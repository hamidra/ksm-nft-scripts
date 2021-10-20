const { connect } = require('./chain/chain-statemine');

const fs = require('fs');
const csv = require('csv');
const path = require('path');

let readCSV = async (hasHeader = true) => {
  let input = path.join(__dirname, `../data/secrets-with-address.csv`);
  const data = fs.readFileSync(input);

  let records = csv.parse(data); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  return records;
};
const addIsClaimedColumn = async () => {
  let lineNum = 0;
  let isClaimdIdx = 2;
  let addressIdx = 1;

  let input = path.join(__dirname, '../data/secrets-with-address.csv');
  let output = path.join(__dirname, '../data/secrets-claimed-report.csv');
  let readStream = fs.createReadStream(input, { encoding: 'utf8' }); // readStream is a read-only stream wit raw text content of the CSV file
  let writeStream = fs.createWriteStream(output, { encoding: 'utf8' }); // writeStream is a write-only stream to write on the disk

  let csvStream = csv.parse(); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const { api } = await connect();
  let claimedCount = 0;
  csvStream
    .on('data', async function (data) {
      if (lineNum <= 12000) {
        data = data.map((field) =>
          field.includes(',') ? `"${field}"` : field
        );
        if (lineNum === 0) {
          if (isClaimdIdx < data.length) {
            if (data[isClaimdIdx] !== 'is claimed') {
              throw new Error(
                `column index ${isClaimdIdx} is not the address column`
              );
            }
          } else {
            data.push('is claimed?!');
          }
        } else {
          let isClaimed = '';
          if (data[addressIdx]) {
            isClaimed = !(
              await api.query.uniques.account.keys(data[addressIdx])
            ).length;
          }
          if (addressIdx < data.length) {
            data[isClaimdIdx] = isClaimed ? 'yes' : 'no';
          } else {
            data.push(isClaimed ? 'yes' : 'no');
          }
          if (data[isClaimdIdx] === 'yes') {
            claimedCount += 1;
          }
        }
        lineNum += 1;
        console.log(lineNum, claimedCount);
        writeStream.write(data.join(',') + '\n');
      }
    })
    .on('end', function () {
      console.log(`done`);
    })
    .on('error', function (error) {
      console.log(error);
    });

  readStream.pipe(csvStream);
};

addIsClaimedColumn().catch((err) => console.log(`error happend \n ${err}`));
