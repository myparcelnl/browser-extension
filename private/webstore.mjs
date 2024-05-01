import WebStore from 'chrome-webstore-upload';
import {apps, clientId, clientSecret, refreshToken} from './store-data.mjs';

export default async (app) => {
  const store = new WebStore({
    extensionId: apps[app],
    clientId,
    clientSecret,
    refreshToken,
  });

  store.token = await store.fetchToken();

  return store;
};
