const fs = require('fs');
const { randomAsHex } = require('@polkadot/util-crypto');
const path = require('path');
let output = path.join(__dirname, '../data/test/test-secrets.csv');
const count = 600;
let writeStream = fs.createWriteStream(output);

for (let i = 0; i < count; i++) {
  const secret = randomAsHex(10);
  writeStream.write(`${secret}, \n`);
}

// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
  console.log('wrote all data to file');
});

// close the stream
writeStream.end();
