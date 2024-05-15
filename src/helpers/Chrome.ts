import Logger from './Logger.js';

/**
 * Chrome (`chrome`) helper functions.
 */
export default class Chrome {
  /**
   * Helper function to catch `chrome.runtime.lastError`. To be used as callback in `chrome` functions.
   */
  static catchError() {
    const message = chrome.runtime.lastError?.message;

    if (!message) {
      return;
    }

    Logger.error(message);
  }

  static queryTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        resolve(tabs);
      });
    });
  }

  static async queryTab(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab | undefined> {
    return (await this.queryTabs(queryInfo))[0];
  }
}
