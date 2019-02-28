import { CONNECTION_NAME } from './helpers/config';
import { clickedElement } from './inject/selection';
import log from './helpers/log';

class MyParcelContentScript {

  constructor() {
    log.info('setting up content script connection');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request);
      if (request.action === 'check') {
        return sendResponse('content');
      }
    });

    this.connection = chrome.runtime.connect({name: CONNECTION_NAME});
    this.sendToBackground = (message) => this.connection.postMessage(message);

    this.connection.onMessage.addListener(this.handleMessages);
    this.sendToBackground({action: 'contentConnected'});
  }

  handleMessages(request, sender) {
    log.success(`received message from: ${sender.sender}`);

    switch (request.action) {
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

    this.sendToBackground({
      action: 'mappedField',
      path: element,
    });
  }

  getElementContent(selector) {
    const element = document.querySelector(selector);

    this.sendToBackground({
      action: 'foundElementContent',
      text: element.innerText,
    });
  }
}

new MyParcelContentScript();
