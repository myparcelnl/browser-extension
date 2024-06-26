import util from 'util';
import path from 'path';
import puppeteer from 'puppeteer';
import {scripts} from '../package.json' assert {type: 'json'};

const exec = util.promisify(require('child_process').exec);

// TODO: Fix tests
describe.skip('Build and install Chrome extensions', () => {
  const config = {platforms: []}

  /**
   * Try to build the extension
   */
  test('Extension can build', async () => {
    const {stderr} = await exec(scripts.build);
    expect(stderr).toBeFalsy();
  }, 30000);

  /**
   * Launch a Chrome instance using puppeteer and try to install the extensions that were built
   */
  Object.keys(config.platforms).forEach((platform) => {
    const extensionPath = path.join(__dirname, `../dist/${platform}`);

    test(`${config.platforms[platform].manifest.name} can be installed`, async () => {
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
});
