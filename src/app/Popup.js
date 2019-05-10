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

    // Get apps for current environment
    this.apps = json.apps[env];

    this.createPage();
  }

  /**
   * Create the HTML page.
   *
   * @returns {undefined}
   */
  static createPage() {
    const root = document.getElementById('popup');

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
