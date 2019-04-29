import background, {sendToPopup} from '../background';
import ActionNames from '../helpers/ActionNames';
import Config from '../helpers/Config';
import Logger from '../helpers/Logger'; // strip-log

/**
 * Context menu class. Contains functions to create and handle the context menu items.
 */
export default class ContextMenu {

  /**
   * Find context menu item by id.
   *
   * @param {string} id - Context menu ID.
   * @return {chrome.contextMenus.CreateProperties}
   */
  static find(id) {
    return Config.contextMenus.find((item) => {
      console.log('cm find item', item);
      console.log('cm find id', id);
      return item.id === id;
    });
  }

  /**
   * Add our custom menu item to the context menu.
   *
   * @param {chrome.contextMenus.CreateProperties} item - Context menu item to add.
   */
  static create(item) {
    window.chrome.contextMenus.create(item);
  }

  /**
   * Remove a context menu item by id.
   *
   * @param {string} id - ID of the context menu item to remove.
   */
  static remove(id) {
    window.chrome.contextMenus.remove(id, () => {
      if (chrome.runtime.lastError) {
        Logger.warning(
          `Received error: "${chrome.runtime.lastError}" while trying to delete context menu item "${id}".`
        );
      }
    });
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
    background.openPopup();
    sendToPopup({action: ActionNames.createShipmentFromSelection, selection: selection});
  }
};
