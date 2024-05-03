import Logger from './Logger';

/**
 * Chrome (`chrome`) helper functions.
 */
export default class Chrome {
  /**
   * Helper function to catch `chrome.runtime.lastError`. To be used as callback in `chrome` functions.
   */
  static catchError() {
    if (chrome.runtime.lastError) {
      Logger.error(chrome.runtime.lastError.message);
    }
  }
}
