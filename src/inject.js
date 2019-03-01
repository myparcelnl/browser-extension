import { CONNECTION_NAME } from './helpers/config';
import { clickedElement } from './inject/selection';
import log from './helpers/log';

class MyParcelContentScript {

  constructor() {
    console.log(this);
    log.info('setting up content script connection');

    this.connection = chrome.runtime.connect({name: CONNECTION_NAME});
    this.connection.onMessage.addListener((...args) => this.handleMessages(...args));
  }

  sendToBackground(action, message) {
    this.connection.postMessage(Object.assign({action}, message));
  }

  handleMessages(request, sender) {
    log.success(`received message from: ${sender.sender}`);
    console.log(request);

    switch (request.action) {
      case 'checkContentConnection':
        this.sendToBackground('contentConnected');
        break;
      case 'mapField':
        return this.mapField();
      case 'getElementContent':
        this.getElementContent(request.selector);
        break;
    }
  }

  async mapField() {
    log.info('waiting for clickedElement');
    const element = await clickedElement();
    if (element) {
      log.success('got clickedElement');
      console.log(element);
    } else {
      log.warning('clickedElement is null');
    }

    this.sendToBackground('mappedField', {
      path: element,
    });
  }

  getElementContent(selector) {
    const element = document.querySelector(selector);

    this.sendToBackground('foundElementContent', {
      text: element.innerText,
    });
  }
}

new MyParcelContentScript();
