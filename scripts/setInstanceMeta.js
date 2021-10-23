const { seed, connect } = require('./chain/chain-test');
const { signAndSendTx } = require('./chain/txHandler');

const fs = require('fs');
const csv = require('csv/lib/sync');
const path = require('path');

let addressIndex = 1;
let metaIndex = 2;
let batchSize = 800;
let totalCount = 97;
let classId = 10;

let readMeta = async (hasHeader = false) => {
  let input = path.join(
    __dirname,
    `../data/Parity-Anniversary/secrets-with-address${classId}.csv`
  );
  const data = fs.readFileSync(input);

  let records = csv.parse(data); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  if (hasHeader) {
    records = records.slice(1);
  }
  let filtered = records.filter((record) => !!record[addressIndex]);
  return filtered;
};

let mintClassInstances = async () => {
  const { api, signingPair, proxiedAddress } = await connect();
  let records = await readMeta();
  if (records.length != totalCount) {
    throw new Error(
      `number of loaded addresses ${records.length} is not equal to the target nft count ${totalCount}`
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
      let asset = await api.query.uniques.asset(classId, instanceId);
      asset = asset?.unwrapOr(null);
      console.log(asset?.toHuman());
      if (
        /*asset.owner?.toHuman() === records[instanceId][addressIndex]*/ asset
      ) {
        txs.push(
          api.tx.uniques.setMetadata(
            classId,
            instanceId,
            records[instanceId][metaIndex],
            false
          )
        );
        instanceId += 1;
      } else {
        throw new Error(
          `the address ${records[instanceId][addressIndex]} is not the owner of the instance ${instanceId}`
        );
      }
    }
    console.log(
      `Sending batch number ${batchNo} for instanceIds ${startInstanceId}:${instanceId}`
    );
    let txBatch = api.tx.utility.batchAll(txs);
    let call = proxiedAddress
      ? api.tx.proxy.proxy(proxiedAddress, 'Assets', txBatch)
      : txBatch;
    await signAndSendTx(api, call, signingPair);
    console.log(call.toHuman());
    console.log(`batch number ${batchNo} finished!`);
    batchNo += 1;
  }
};

mintClassInstances()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
