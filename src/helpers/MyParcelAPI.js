import { version } from '../../package';

const API = 'https://backoffice.myparcel.nl/api/';
const baseOptions = {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `chrome_extension/${version}`,
  },
  redirect: 'follow',
  referrer: 'no-referrer',
};

const addParameters = (url, parameters) => {
  if (parameters) {
    const arr = [];
    for (const parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        arr.push(`${parameter}=${parameters[parameter]}`);
      }
    }
    url += `?${arr.join('&')}`;
  }
  return `${API}${url}`;
};

export default {
  endpoints: {
    tracktraces: 'tracktraces',
  },

  get(endpoint, data = {}, parameters = {}) {
    const url = addParameters(this.endpoints[endpoint], parameters);
    return fetch(
      url,
      Object.assign(
        { method: 'GET' },
        baseOptions,
        data
      ),
    ).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });
  },
};
