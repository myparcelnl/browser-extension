import Background from '../Background';
import ActionNames from '../helpers/ActionNames';
import Chrome from '../helpers/Chrome';
import Config from '../helpers/Config';
import Connection from './Connection';

/**
 * Context menu class. Contains functions to create and handle the context menu items.
 */
export default class ContextMenu {

  /**
   * Find context menu item by id.
   *
   * @param {string} id - Context menu ID.
   * @returns {chrome.contextMenus.CreateProperties}
   */
  static find(id) {
    return Config.contextMenus.find((item) => item.id === id);
  }

  /**
   * Add our custom menu item to the context menu.
   *
   * @param {chrome.contextMenus.CreateProperties} item - Context menu item to add.
   */
  static create(item) {
    window.chrome.contextMenus.create(item, Chrome.catchError);
  }

  /**
   * Remove a context menu item by id.
   *
   * @param {string} id - ID of the context menu item to remove.
   */
  static remove(id) {
    window.chrome.contextMenus.remove(id, Chrome.catchError);
  }

  /**
   * On clicking a menu item in the context menu, check if ours is the one that's clicked.
   *
   * @param {Object} data - Data received from click event.
   */
  static activate(data) {
    switch (data.menuItemId) {
      case Config.contextMenuCreateShipment:
        console.log('create shipment', data.selectionText);
        this.selectContentText(data.selectionText);
        break;
      case Config.contextMenuSwitchApp:
        console.log('switch app');
        break;
    }
  }

  /**
   * Get the user's selection while clicking the context menu item, filter it and then send it to the popup.
   *
   * @param {string} selection - Selection text.
   */
  static selectContentText(selection) {
    selection = selection.trim().replace(/[\s\n]/, ' ');
    Background.openPopup();
    Connection.sendToPopup({action: ActionNames.createShipmentFromSelection, selection: selection});
  }
};
