const { Keyring } = require('@polkadot/keyring');
const { ApiPromise, WsProvider } = require('@polkadot/api');

const wsURI =
  process.env.ChainURI || 'wss://kusama-statemine-rpc.paritytech.net';
const seed =
  process.env.AccountSeed || '';

module.exports = {
  wsURI: wsURI,
  seed: seed,
  connect: async function () {
    const wsProvider = new WsProvider(wsURI);
    const keyring = new Keyring({ type: 'sr25519' });
    const api = await ApiPromise.create({ provider: wsProvider });
    await api.isReady;
    const signingPair = keyring.createFromUri(seed);
    return { api, keyring, signingPair };
  },
};
