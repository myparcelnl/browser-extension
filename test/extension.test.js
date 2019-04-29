import background from '../src/background';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const puppeteer = require('puppeteer');
const {scripts} = require('../package.json');

const extensionPath = path.join(__dirname, '../');

describe('Build and install Chrome extension', () => {

  /**
   * Try to build the extension
   */
  test('Extension can build', async() => {
    const {stderr} = await exec(scripts.dist);
    expect(stderr).toBeFalsy();
  }, 15000);

  /**
   * Launch a Chrome instance using puppeteer and try to install the extension that was built
   */
  test('Extension can be installed', async() => {
    const options = {
      headless: false,
      ignoreHTTPSErrors: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    };
    const browser = await puppeteer.launch(options);
    expect(browser).toBeTruthy();
    await browser.close();
  }, 5000);
});

describe('More things', () => {

  it('detects websites correctly', () => {
    // <url>, <isWebsite>
    const websites = [
      ['chrome://testurl', false],
      ['about:blank', false],
      ['http://url.com', true],
      ['https://url.com', true],
    ];

    websites.forEach((website) => {
      const [url, isWebsite] = website;

      expect(background.isWebsite({url})).toBe(isWebsite);
    });
  });

});
