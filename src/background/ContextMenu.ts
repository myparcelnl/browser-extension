import {ActionNames} from '../helpers/index.js';
import Chrome from '../helpers/Chrome.js';
import {CONTEXT_MENU_CREATE_SHIPMENT} from '../constants.js';
import Background from '../Background.js';
import Connection from './Connection.js';

/**
 * Context menu class. Contains functions to create and handle the context menu items.
 */
export default class ContextMenu {
  /**
   * Add our custom menu item to the context menu.
   */
  static create(item: chrome.contextMenus.CreateProperties) {
    chrome.contextMenus.create(item, Chrome.catchError);
  }

  /**
   * Remove a context menu item by id.
   */
  static remove(id: string) {
    chrome.contextMenus.remove(id, Chrome.catchError);
  }

  /**
   * On clicking a menu item in the context menu, check if ours is the one that's clicked.
   */
  static activate(data: chrome.contextMenus.OnClickData) {
    if (data.menuItemId !== CONTEXT_MENU_CREATE_SHIPMENT || !data.selectionText) {
      return;
    }

    void this.selectContentText(data.selectionText);
  }

  /**
   * Get the user's selection while clicking the context menu item, filter it and then send it to the popup.
   */
  static async selectContentText(selection: string) {
    const resolvedSelection = selection.trim().replace(/[\s\n]/, ' ');

    await Background.openPopup();

    Connection.sendToPopup({
      action: ActionNames.createShipmentFromSelection,
      selection: resolvedSelection,
    });
  }
}
