const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const puppeteer = require('puppeteer');
const { scripts } = require('../package.json');

const extensionPath = path.join(__dirname, '../dist');

describe('build & install', () => {

  // Calls the standard 'npm dist' script used to build the distributable
  test('extension can build', async() => {
    const { stderr } = await exec(scripts.dist);
    expect(stderr).toBeFalsy();
  }, 15000);

  // boots a Chrome instance using Puppeteer and adds the extension we build in the earlier test
  test('extension can be installed', async() => {
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
