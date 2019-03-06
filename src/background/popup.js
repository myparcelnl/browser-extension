export default {
  open(popup, url = null) {
    if (popup) {
      this.show(popup);
    } else {
      if (!url) {
        url = this.popupUrl;
      }

      // todo remove this
      chrome.windows.getAll({windowTypes: ['popup']}, (windows) => {
        windows.forEach((window) => {
          chrome.windows.remove(window.id);
        });
      });

      this.createPopup(url);
    }

    this.setIcon(activeIcon);
  },

  createPopup(url) {
    chrome.windows.getCurrent((win) => {
      chrome.windows.create({
        url: url,
        type: 'popup',
        height: Config.popupDimensions.height,
        width: Config.popupDimensions.width,
        left: win.left + win.width, // - this.popupDimensions.width - 20,
        top: win.top,
      }, (win) => {
        popup = win.tabs[0];
      });
    });
  },

  close() {
    popup = null;
    this.popupConnection = null;
    this.setIcon();
  },

  show(popup) {
    chrome.windows.getCurrent((win) => {
      chrome.windows.update(popup.windowId, {
        focused: true,
        drawAttention: true,
        left: win.left + win.width - this.popupDimensions.width,
        top: win.top + 75,
        height: this.popupDimensions.height,
        width: this.popupDimensions.width,
      });
    });
  },
};

