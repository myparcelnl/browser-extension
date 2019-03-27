import background, { sendToPopup } from '../background';
import actions from '../helpers/actionNames';
import config from '../helpers/config';

export default {

  /**
   * Add our custom menu item to the context menu.
   */
  create() {
    window.chrome.contextMenus.removeAll();
    window.chrome.contextMenus.create({
      id: config.contextMenuItemId,
      title: config.contextMenuTitle,
      contexts: ['selection'],
    });
  },

  /**
   * On clicking a menu item in the context menu, check if ours is the one that's clicked.
   *
   * @param {Object} data - Data received from click event.
   */
  activate(data) {
    if (data.menuItemId === config.contextMenuTitle) {
      console.log(data);
      this.selectContentText(data.selectionText);
    }
  },

  /**
   * Get the user's selection while clicking the context menu item, filter it and then send it to the popup.
   *
   * @param {string} selection - Selection text.
   */
  selectContentText(selection) {
    selection = selection.trim().replace(/[\s\n]/, ' ');
    background.openPopup();
    sendToPopup({action: actions.createShipmentFromSelection, selection: selection});
  },
};
