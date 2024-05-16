import Logger from './Logger.js';

/**
 * Chrome (`chrome`) helper functions.
 */
export default class Chrome {
  /**
   * Helper function to catch `chrome.runtime.lastError`. To be used as callback in `chrome` functions.
   */
  public static catchError() {
    const message = chrome.runtime.lastError?.message;

    if (!message) {
      return;
    }

    Logger.error(message);
  }

  public static getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    return this.queryTab({
      active: true,
      highlighted: true,
      lastFocusedWindow: true,
      // Exclude popups and other unexpected "tabs"
      windowType: 'normal',
    });
  }

  public static async getTabById(tabId?: number): Promise<chrome.tabs.Tab | undefined> {
    if (!tabId || chrome.tabs.TAB_ID_NONE === tabId) {
      return undefined;
    }

    return new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => resolve(tab));
    });
  }

  public static async queryTab(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab | undefined> {
    return (await this.queryTabs(queryInfo))[0];
  }

  public static queryTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        resolve(tabs);
      });
    });
  }
}
