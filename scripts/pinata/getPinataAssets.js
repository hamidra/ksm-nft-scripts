const pinataSDK = require('@pinata/sdk');
//const pinata = pinataSDK('yourPinataApiKey', 'yourPinataSecretApiKey');
const pinata = require('./pinataClient');

const metadataFilter = {
  name: 'exampleName',
  keyvalues: {
    testKeyValue: {
      value: 'exampleFilterValue',
      op: 'exampleFilterOperation',
    },
    testKeyValue2: {
      value: 'exampleFilterValue2',
      op: 'exampleFilterOperation2',
    },
  },
};

const filters = {
  status: 'pinned',
  pageLimit: 10,
  pageOffset: 0,
  //metadata: metadataFilter,
};

pinata
  .pinList(filters)
  .then((result) => {
    //handle results here
    console.log(result);
  })
  .catch((err) => {
    //handle error here
    console.log(err);
  });
