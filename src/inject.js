import { CONNECTION_NAME } from './helpers/config';
import { clickedElement } from './inject/selection';
import log from './helpers/log';

class MyParcelContentScript {

  constructor() {
    log.info('setting up content script connection');

    this.connection = chrome.runtime.connect({name: CONNECTION_NAME});
    this.connection.onMessage.addListener((...args) => this.handleMessages(...args));
  }

  sendToBackground(action, message) {
    this.connection.postMessage(Object.assign({action}, message));
  }

  handleMessages(request) {
    switch (request.action) {
      case 'checkContentConnection':
        this.sendToBackground('contentConnected', {url: window.location.hostname});
        break;
      case 'mapField':
        return this.mapField(request.field);
      case 'getElementContent':
        this.getElementContent(request.selector);
        break;
    }
  }

  async mapField(field) {
    const path = await clickedElement();

    this.sendToBackground('mappedField', { path, field });
  }

  getElementContent(selector) {
    const text = document.querySelector(selector).innerText;
    this.sendToBackground('foundElementContent', {text});
  }
}

new MyParcelContentScript();
