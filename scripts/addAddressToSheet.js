const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const fs = require('fs');
const csv = require('csv');
const path = require('path');

const addAddressColumn = async () => {
  let lineNum = 0;
  let giftSecretIdx = 3;
  let addressIdx = 17;

  // initialize keyring
  const keyring = new Keyring({ type: 'sr25519' });
  await cryptoWaitReady();
  keyring.setSS58Format(2); //set format to Kusama

  let input = path.join(__dirname, '../data/ksm-nft-campaign.csv');
  let output = path.join(
    __dirname,
    '../data/ksm-nft-campaign-with-address.csv'
  );
  let readStream = fs.createReadStream(input, { encoding: 'utf8' }); // readStream is a read-only stream wit raw text content of the CSV file
  let writeStream = fs.createWriteStream(output, { encoding: 'utf8' }); // writeStream is a write-only stream to write on the disk

  let csvStream = csv.parse(); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records

  csvStream
    .on('data', function (data) {
      if (lineNum <= 12000) {
        data = data.map((field) =>
          field.includes(',') ? `"${field}"` : field
        );
        if (lineNum === 0) {
          if (addressIdx < data.length) {
            if (data[addressIdx] !== 'gift account address') {
              throw new Error(
                `column index ${addressIdx} is not the address column`
              );
            }
          } else {
            data.push('gift account address');
          }
        } else {
          let address = '';
          if (data[giftSecretIdx]) {
            address = keyring.createFromUri(data[giftSecretIdx]).address;
          }
          if (addressIdx < data.length) {
            data[addressIdx] = address;
          } else {
            data.push(address);
          }
        }
        lineNum += 1;
        console.log(lineNum);
        writeStream.write(data.join(',') + '\n');
      }
    })
    .on('end', function () {
      console.log('done');
    })
    .on('error', function (error) {
      console.log(error);
    });

  readStream.pipe(csvStream);
};

addAddressColumn().catch((err) => console.log(`error happend \n ${err}`));
