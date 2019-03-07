import actions from '../helpers/actions';

export default {
  activateContextMenu(info) {
    if (info.menuItemId === 'myparcel-create-shipment') {
      this.selectContentText(info.selectionText);
    }
  },

  selectContentText(selection) {
    selection = selection.trim().replace(/,/, ' ');
    this.open();
    this.sendToPopup({action: actions.createShipmentFromSelection, selection: selection});
  },

  createContextMenu(title) {
    window.chrome.contextMenus.removeAll();
    window.chrome.contextMenus.create({
      id: 'myparcel-create-shipment',
      title,
      contexts: ['selection'],
    });
  },
};
