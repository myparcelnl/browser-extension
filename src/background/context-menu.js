import background, { sendToPopup } from '../background';
import ActionNames from '../helpers/ActionNames';
import Config from '../helpers/Config';

/**
 * Context menu class. Contains functions to create and handle the context menu items.
 */
export default class ContextMenu {

  /**
   * Add our custom menu item to the context menu.
   */
  static create() {
    window.chrome.contextMenus.removeAll();
    window.chrome.contextMenus.create({
      id: Config.contextMenuItemId,
      title: Config.contextMenuTitle,
      contexts: ['selection'],
    });
  }

  /**
   * On clicking a menu item in the context menu, check if ours is the one that's clicked.
   *
   * @param {Object} data - Data received from click event.
   */
  static activate(data) {
    if (data.menuItemId === Config.contextMenuItemId) {
      console.log(data);
      this.selectContentText(data.selectionText);
    }
  }

  /**
   * Get the user's selection while clicking the context menu item, filter it and then send it to the popup.
   *
   * @param {string} selection - Selection text.
   */
  static selectContentText(selection) {
    selection = selection.trim().replace(/[\s\n]/, ' ');
    background.openPopup();
    sendToPopup({action: ActionNames.createShipmentFromSelection, selection: selection});
  }
};
