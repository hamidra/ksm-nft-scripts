const { seed, connect } = require('./chain');
const { signAndSendTx } = require('./txHandler');

const fs = require('fs');
const csv = require('csv/lib/sync');
const path = require('path');

let addressIndex = 1;
let batchSize = 800;
let totalCount = 9999;
let amount = '';

let readAddresses = async (hasHeader = true) => {
  let input = path.join(
    __dirname,
    `../data/test/test-secrets-with-address.csv`
  );
  const data = fs.readFileSync(input);

  let records = csv.parse(data); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  if (hasHeader) {
    records = records.slice(1);
  }
  let addressList = records
    .map((record) => record[addressIndex])
    .filter((address) => !!address);

  return addressList;
};

let transferFunds = async () => {
  const { api, signingPair } = await connect();
  let addresses = await readAddresses();
  if (addresses.length != totalCount) {
    throw new Error(
      `number of loaded addresses ${addresses.length} is not equal to the target nft count ${totalCount}`
    );
  }

  let instanceId = 0;
  let batchNo = 0;
  while (instanceId < totalCount) {
    let txs = [];
    let startInstanceId = instanceId;
    for (let i = 0; i < batchSize; i += 1) {
      if (instanceId >= totalCount) {
        break;
      }
      txs.push(api.tx.balances.transfer(addresses[instanceId], amount));
      instanceId += 1;
    }
    console.log(
      `Sending batch number ${batchNo} for instanceIds ${startInstanceId}:${instanceId}`
    );
    let txBatch = api.tx.utility.batch(txs);
    await signAndSendTx(api, txBatch, signingPair);
    console.log(`batch number ${batchNo} finished!`);
    batchNo += 1;
  }
};

transferFunds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
