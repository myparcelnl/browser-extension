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
   * On clicking a menu item in the context menu, check if ours is the one that's clicked.
   */
  public static activate(data: chrome.contextMenus.OnClickData): void {
    if (data.menuItemId !== CONTEXT_MENU_CREATE_SHIPMENT || !data.selectionText) {
      return;
    }

    void this.selectContentText(data.selectionText);
  }

  /**
   * Add our custom menu item to the context menu.
   */
  public static create(item: chrome.contextMenus.CreateProperties): void {
    chrome.contextMenus.create(item, Chrome.catchError);
  }

  /**
   * Remove a context menu item by id.
   */
  public static remove(id: string): void {
    chrome.contextMenus.remove(id, Chrome.catchError);
  }

  /**
   * Get the user's selection while clicking the context menu item, filter it and then send it to the popup.
   */
  private static async selectContentText(selection: string): Promise<void> {
    const resolvedSelection = selection.trim().replace(/[\s\n]/, ' ');

    await Background.openPopup();

    Connection.sendToPopup({
      action: ActionNames.createShipmentFromSelection,
      selection: resolvedSelection,
    });
  }
}
