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
  let secretIdx = 0;
  let addressIdx = 1;

  let input = path.join(__dirname, '../data/secrets-with-address.csv');
  let output = path.join(__dirname, '../data/uclaimed-secrets.csv');
  let readStream = fs.createReadStream(input, { encoding: 'utf8' }); // readStream is a read-only stream wit raw text content of the CSV file
  let writeStream = fs.createWriteStream(output, { encoding: 'utf8' }); // writeStream is a write-only stream to write on the disk

  let csvStream = csv.parse(); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const { api } = await connect();
  let unclaimedCount = 0;
  csvStream
    .on('data', async function (data) {
      if (lineNum <= 12000) {
        data = data.map((field) =>
          field.includes(',') ? `"${field}"` : field
        );
        // line 0 is header
        if (lineNum !== 0) {
          let isClaimed = false;
          if (data[addressIdx]) {
            isClaimed = !(
              await api.query.uniques.account.keys(data[addressIdx])
            ).length;
          }
          if (!isClaimed) {
            unclaimedCount += 1;
            data[secretIdx] = data[secretIdx];
            writeStream.write(data.join(',') + '\n');
          }
        }
        lineNum += 1;
        console.log(lineNum, unclaimedCount);
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
