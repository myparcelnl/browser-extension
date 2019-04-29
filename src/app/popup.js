export default class Popup {

  /**
   * @type {HTMLElement}
   */
  static root;

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
    this.apps = this.getApps(json);

    this.createPage();
  }

  /**
   * Get apps and add referral url parameter.
   *
   * @param {Object} json - Object containing <appName> - <url> pairs.
   *
   * @return {Object}
   */
  static getApps(json) {
    const apps = json.apps[process.env.NODE_ENV];
    for (const app in apps) {
      if (apps.hasOwnProperty(app)) {
        const url = new URL(apps[app]);
        apps[app] = url.searchParams.set('referralurl', url.pathname);
      }
    }

    return apps;
  }

  /**
   * Create the HTML page.
   *
   * @return {undefined}
   */
  static createPage() {
    this.root = document.getElementById('popup');

    let element, link;
    for (const appName in this.apps) {
      if (this.apps.hasOwnProperty(appName)) {
        element = document.createElement('div');
        link = this.root.appendChild(element);
        link.innerHTML = `<div class="app app--${appName}">
                            <img src="images/logo_${appName}.png" alt="${appName}"/>
                          </div>`;

        // Add onclick event to the created link.
        link.onclick = () => this.start(appName);
      }
    }
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
