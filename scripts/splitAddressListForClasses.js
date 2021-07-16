const fs = require('fs');
const csv = require('csv/lib/sync');
const path = require('path');

let countPerClass = 3333;
let classIds = [0, 1, 2];

let sliceAddressList = (hasHeader = true) => {
  let input = path.join(__dirname, '../data/secrets-with-address.csv');
  let data = fs
    .readFileSync(input, { encoding: 'utf8' })
    .split('\n')
    .filter((line) => line);
  if (hasHeader) {
    data = data.slice(1);
  }

  let totalCount = countPerClass * classIds.length;
  if (data.length != totalCount) {
    throw new Error(
      `the total number of addresses ${data.length} is not enough to assign ${countPerClass} per class for classes ${classIds}`
    );
  }
  for (let i = 0; i < classIds.length; i += 1) {
    addressList = data
      .slice(i * countPerClass, (i + 1) * countPerClass)
      .join('\n');
    let slicePath = path.join(
      __dirname,
      `../data/secrets-with-address${classIds[i]}.csv`
    );
    fs.writeFileSync(slicePath, addressList, { encoding: 'utf8' });
  }
};

sliceAddressList();
