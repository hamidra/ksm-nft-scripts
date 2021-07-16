const { exit } = require('process');
const { seed, connect } = require('./chain');
const { signAndSendTx } = require('./txHandler');

let setClassMetaData = async () => {
  const { api, signingPair, proxiedAddress } = await connect();

  const classmeta = [
    {
      classId: '0',
      metadata: 'QmbeRbMeCeq8StbUPPNqqUN6cevcFNfPfE58TV8ukmiKkR',
      isFrozen: false,
    },
    {
      classId: '1',
      metadata: 'QmeXMHxaaWRAUPAFa9KAuDLmf4w3kSYyWwjw6aDjtKncnW',
      isFrozen: false,
    },
    {
      classId: '2',
      metadata: 'QmaCWgK91teVsQuwLDt56m2xaUfBCCJLeCsPeJyHEenoES',
      isFrozen: false,
    },
  ];

  let txs = [];
  // construct a list of transactions we want to batch
  for (const { classId, metadata, isFrozen } of classmeta) {
    txs.push(api.tx.uniques.setClassMetadata(classId, metadata, isFrozen));
  }

  let txBatch = api.tx.utility.batch(txs);
  let proxyCall = api.tx.proxy.proxy(proxiedAddress, 'Assets', txBatch);
  console.log(`sending batch tx with hash ${txBatch.toHex()}`);
  await signAndSendTx(api, proxyCall, signingPair);
};

setClassMetaData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
