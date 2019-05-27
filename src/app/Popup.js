import popupHTML from './popup.html';

const env = process.env.NODE_ENV;

class Popup {

  /**
   * @type {Object}
   */
  static apps = {};

  /**
   * Get apps and create HTML page.
   *
   * @returns {Promise<undefined>}
   */
  static async boot() {
    const response = await fetch(chrome.extension.getURL('./config/config.json'));
    const json = await response.json();

    this.apps = this.getApps(env, json.platforms);

    this.createPage();
  }

  /**
   * Get app urls for current environment.
   *
   * @param {string} environment - Environment name: `production`, `development` or `staging`.
   * @param {Object} platforms - Platform object to loop through.
   *
   * @returns {Object} - Object with `<appName>: <appUrl>` pairs.
   */
  static getApps(environment, platforms) {

    const apps = {};

    for (const appName in platforms) {
      if (platforms.hasOwnProperty(appName) && platforms[appName].urls.hasOwnProperty(environment)) {
        apps[appName] = platforms[appName].urls[environment];
      }
    }

    return apps;
  }

  /**
   * Create the HTML page.
   *
   * @returns {undefined}
   */
  static createPage() {
    const root = document.getElementById('popup');

    console.log(root);
    root.innerHTML = popupHTML({apps: Object.keys(this.apps)});
    const links = root.querySelectorAll('.app');

    links.forEach((link) => {
      link.addEventListener('click', () => this.start(link.attributes.getNamedItem('data-app').value));
    });
  }

  /**
   * Tell the background to boot using the given app name.
   *
   * @param {string} app - App name.
   */
  static start(app) {
    chrome.runtime.sendMessage(app, () => {
      window.close();
    });
  }
}

Popup.boot();
