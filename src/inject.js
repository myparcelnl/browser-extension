// import MyParcelBackgroundView from './background';
import log from './log';
log.info('inject.js');

// console.log(chrome.extension.sendMessage());
// console.log(window.MyParcelExtensionBackground);

class MyParcel {
  constructor() {

  }

  sendMessage(data) {
    chrome.extension.sendMessage(data);
  }

  mapInputs() {
    window.MyParcelExtensionBackground.mapInputs();
  }
}

window.MyParcelExtension = MyParcel;

// console.log(window.MyParcelExtension);
//
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(request);
//   console.log(sender);
//   console.log(sendResponse);
//   sendResponse('pong');
// });

// /* eslint-disable no-multi-assign,no-console,no-magic-numbers,max-lines-per-function,id-length */
//
// (() => {
//   myparcelLog('Searching for address information');
//   window.conn = window.chrome.extension.connect({name: 'content'});
//   window.conn.onDisconnect.addListener(() => {
//     window.conn = false;
//     stopSelecting();
//   });
//
//   /**
//    * Incoming calls.
//    */
//   window.chrome.runtime.onMessage.addListener((data, sender, response) => {
//     if (data.action === 'ping') {
//       return response('pong');
//     }
//     sendToBackground(data.action);
//     if (data.action === 'startSelecting') {
//       response(true);
//       startSelecting(data.name, data.text);
//     }
//     if (data.action === 'stopSelecting') {
//       response(true);
//       stopSelecting();
//     }
//     if (data.action === 'getSelectorValues') {
//       response({
//         address: getSelectorsValues(data.selectors),
//       });
//     }
//   });
//
//   /**
//    * Get value from selector elements.
//    *
//    * @param {object} config
//    * @returns {object}
//    */
//   function getSelectorsValues(config) {
//     const configData = {};
//     for (const key in config) {
//       configData[key] = getSelectorValues(config[key]);
//     }
//
//     return configData;
//   }
//
//   /**
//    * Get the html element value for a given css selector.
//    *
//    * @param {string} selector
//    * @returns {string}
//    */
//   function getSelectorValues(selector) {
//     let value = '';
//     if (selector) {
//       selector = selector.split('@');
//       const selectorPath = selector[0];
//       const selectorIndex = selector[1];
//       const path = document.querySelectorAll(selectorPath);
//       if (path.length > 0) {
//         const e = path[0];
//         const tag = (e && e.tagName) ? e.tagName.toLowerCase() : '';
//
//         if (e && e.value && selectorIndex && tag === 'textarea') {
//           value = e.value.split(/\n/g)[selectorIndex.trim()];
//         } else if (selectorIndex) {
//           const element = e.getTextParts()[selectorIndex.trim()];
//           if (element) {
//             value = element.textContent;
//           }
//         } else if (e) {
//           value = (['input', 'select', 'textarea'].indexOf(tag) !== -1) ? e.value : e.textContent;
//         }
//       }
//     }
//     return value.trim();
//   }
//
//   /**
//    * Add temp span surrounding text nodes for selection.
//    *
//    * @param {Array} array
//    */
//   function wrap(array) {
//     for (let i = 0; i < array.length; i++) {
//       const e = array[i];
//       if (e.parentElement.childNodes.length > 1 && e.textContent.trim() !== '') {
//         const span = document.createElement('span');
//         span.innerHTML = e.textContent;
//         span.classList.add('createdSubItem');
//         e.parentNode.insertBefore(span, e);
//         e.parentNode.removeChild(e);
//       }
//     }
//   }
//
//   /**
//    * Remove temp span surrounding text nodes for selection.
//    */
//   function unwrap() {
//     const array = document.getElementsByClassName('createdSubItem');
//     if (array) {
//       for (let i = array.length - 1; i >= 0; i--) {
//         const e = array[i];
//         const txt = document.createTextNode(e.textContent);
//         e.parentNode.insertBefore(txt, e);
//         e.parentNode.removeChild(e);
//       }
//     }
//   }
//
//   /**
//    * @param {Event} event
//    * @returns {boolean}
//    */
//   function addSelectingClass(event) {
//     if (event.target.hasDepth(3)) {
//       return false;
//     }
//     event.stopPropagation();
//     const e = event.target;
//
//     if (document.body.get('myparcelHover')) {
//       document.body.get('myparcelHover').classList.remove('myparcelHover');
//     }
//
//     e.classList.add('myparcelHover');
//
//     if (e.innerHTML !== e.nodeValue) {
//       wrap(e.getTextParts());
//     }
//   }
//
//   /**
//    * Make toolbar follow mouse movements.
//    *
//    * @param {Event} event
//    */
//   function mouseMove(event) {
//     addSelectingClass(event);
//     followMouse(event);
//   }
//
//   /**
//    * Set event listeners for selecting the elements in de website.
//    *
//    * @param {string} name
//    * @param {string} text
//    */
//   function startSelecting(name, text) {
//     document.addEventListener('mousemove', mouseMove);
//     document.addEventListener('keyup', checkForEscape);
//     document.addEventListener('click', chooseElement);
//
//     showToolbar(name, text);
//   }
//
//   /**
//    * Remove the mouse listeners when done with selecting.
//    */
//   function stopSelecting() {
//     document.removeEventListener('mousemove', mouseMove);
//     document.removeEventListener('keyup', checkForEscape);
//     document.removeEventListener('click', chooseElement);
//
//     if (document.body.get('myparcelHover')) {
//       document.body.get('myparcelHover').classList.remove('myparcelHover');
//     }
//     hideToolbar();
//     unwrap();
//   }
//
//   /**
//    * @param {Event} event
//    * @returns {boolean}
//    */
//   function chooseElement(event) {
//     event.stopPropagation();
//     event.preventDefault();
//
//     let element = event.target;
//     /** If the element has an input get that instead */
//     if (element.getElementsByTagName('input').length > 0) {
//       element = element.getElementsByTagName('input')[0];
//     }
//     if (element.getElementsByTagName('select').length > 0) {
//       element = element.getElementsByTagName('select')[0];
//     }
//
//     let path = element.getPath();
//     if (element.classList.contains('createdSubItem')) {
//       const index = element.parentElement.getElementsByClassName('createdSubItem').index(element);
//       path = `${element.parentElement.getPath()} @ ${index}`;
//     }
//
//     stopSelecting();
//     sendToBackground('chooseElement', {path: path, value: getSelectorValues(path)});
//
//     return false;
//   }
//
//   /**
//    * Monitor escape key.
//    *
//    * @param {Event} event
//    */
//   function checkForEscape(event) {
//     if (event.keyCode === 27) {
//       stopSelecting();
//       sendToBackground('cancelElement');
//     }
//   }
//
//   /**
//    * Show a toolbar in the content.
//    *
//    * @param {string} name
//    * @param {string} text
//    */
//   function showToolbar(name, text) {
//     if (!document.getElementById('myparcelTooltip')) {
//       createToolbar();
//     }
//
//     const tooltip = document.getElementById('myparcelTooltip');
//
//     tooltip.style.display = 'block';
//     tooltip.querySelector('span').innerHTML = text;
//     tooltip.querySelector('em').innerHTML = name;
//   }
//
//   /**
//    * Hide the toolbar.
//    */
//   function hideToolbar() {
//     const tooltip = document.getElementById('myparcelTooltip');
//     if (tooltip) {
//       tooltip.style.display = 'none';
//     }
//   }
//
//   /**
//    * Create the toolbar, destroy the previously generated toolbar if needed.
//    */
//   function createToolbar() {
//     let tooltip = document.getElementById('myparcelTooltip');
//     if (tooltip) {
//       tooltip.parentElement.removeChild(tooltip);
//     }
//
//     tooltip = document.createElement('div');
//     tooltip.setAttribute('id', 'myparcelTooltip');
//     tooltip.innerHTML = '<div class="arrow"></div><div class="text"><span></span><em></em>or<em class="esc">esc</em></div>';
//     document.body.appendChild(tooltip);
//   }
//
//   /** * Make the tooltip follow the cursor. * *
//    @param {Event} event */ function followMouse(event) {
//     let eventDoc, doc, x, y;
//     x = event.pageX;
//     y = event.pageY;
//     if
//     (x === null && event.clientX !== null) {
//       eventDoc = (event.target && event.target.ownerDocument) || document;
//       doc =
//         eventDoc.documentElement;
//       const {body} = eventDoc;
//       x = event.clientX + (doc && doc.scrollLeft || body &&
//         body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
//       y = event.clientY + (doc &&
//         doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
//     }
//     const
//       tooltip = document.getElementById('myparcelTooltip');
//     if (tooltip) {
//       tooltip.style.top = `${y}px`;
//       tooltip.style.left = `${x + 10}px`;
//     }
//   }
//
//   /** * Communication with the extension. * * @param {string} action * @param
//    {Object} data */ function sendToBackground(action, data = {}) {
//     data['action'] = action;
//     if (window.conn) {
//       window.conn.postMessage(data);
//     }
//   }
//
//   /** * Use MutationObserver to call updateDetected() on page updates. */ let updateSendDone = true;
//   const observer = new MutationObserver((mutations) => {
//     if (updateSendDone && pageHasFocus) {
//       updateSendDone = false;
//       setTimeout(updateDetected, 200);
//       setTimeout(() => {
//         updateSendDone = true;
//       }, 500);
//     }
//   });
//   observer.observe(document.getElementsByTagName('body')[0], {childList: true});
//   /** * Call updateDetected() after current page is done loading. */ const readyStateCheckInterval = setInterval(() => {
//     if (document.readyState === 'complete') {
//       clearInterval(readyStateCheckInterval);
//       /** call updateDetected for first time */ updateDetected();
//       /** call updateDetected again 3 seconds later to make sure slow filling elements are also set */ setTimeout(updateDetected, 3000);
//     }
//   }, 10);
//
//   /** * Run if the script detects an update on the website. */ function updateDetected() {
//     /** if toolbar is not last element in body tree anymore relocate it to the end */ const tooltip = document.getElementById('myparcelTooltip');
//     if (tooltip && tooltip.parentNode.lastChild !== tooltip) {
//       document.body.appendChild(tooltip);
//     }
//     sendToBackground('contentUpdated');
//     myparcelLog('updated');
//   }
//
//   /** * Colored log messages in current browser console window. * * @param {string} data * @param {*} rest */ function myparcelLog(data, ...rest) {
//     console.log(`%c MyParcel %c ${data} `, 'font-size:12px;font-family:monospace;background:#040707;color:#fbf8f8;', 'font-size:12px;font-family:monospace;background:#96ebd7;color:#040707;', ...rest);
//   }
//
//   let pageHasFocus = true;
//   window.onfocus = () => {
//     pageHasFocus = true;
//   };
//   window.onblur = () => {
//     pageHasFocus = false;
//   };
//   /** * Prototype functions. */ Element.prototype.get = (elClass) => {
//     return (this.getElementsByClassName(elClass)) ? this.getElementsByClassName(elClass)[0] : {};
//   };
//   Element.prototype.childrenByTag = (elTag) => {
//     return Array.prototype.slice.call(this.children).filter((element) => {
//       return element.tagName.toLowerCase() === elTag;
//     });
//   };
//   Element.prototype.index = () => {
//     const array = Array.prototype.slice.call(this.parentNode.children).filter((e) => {
//       return !e.classList.contains('createdSubItem');
//     });
//     return array.indexOf(this) + 1;
//   };
//   Element.prototype.getPath = (prefPath) => {
//     const path = prefPath ? ` > ${prefPath}` : '';
//     const parent = this.parentNode;
//     /** Add tag to path */ let tag = this.localName.toLowerCase();  /** Check if we are at doc root */
//     if (!tag || !parent) {
//       return path;
//     }
//     if (parent.nodeName === '#document') {
//       return `${selector} > ${path}`;
//     }  /** Check if the tag is unique */
//     if (document.querySelectorAll(tag).length === 1) {
//       return tag + path;
//     }  /** Add an id to the selector if this is set */
//     if (this.id) {
//       if (!this.id.match(/[:\d{4,}]+/g)) { /** Id is not a random string */
//         if (document.querySelectorAll(`${tag}#${this.id}`).length === 1) { /** Id is unique */
//           return `${tag}#${this.id}${path}`;
//         }
//       }
//     }
//     /** Check if class is unique */ const classes = this.className ? this.className.replace('myparcelHover', '').trim() : false;
//     if (classes) {
//       let classList = '';
//       const classArray = classes.split(' ');
//       for (let i = 0; i < classArray.length; i++) {
//         const className = classArray[i];
//         if (!className.match(/[:\d{4,}]+/g)) {
//           if (document.querySelectorAll(`${tag}.${className}`).length === 1) {
//             return `${tag}.${className}${path}`;
//           }
//           classList += `.${className}`;
//           if (document.querySelectorAll(tag + classList).length === 1) {
//             return tag + classList + path;
//           }
//         }
//       }
//     }  /** No unique selector found yet so we take the nth selector from the parent */
//     if (parent.childrenByTag(tag).length > 1) {
//       tag += `:nth-child(${this.index()})`;
//     }
//     return parent.getPath(tag + path);
//   };
//   Element.prototype.getTextParts = () => {
//     const list = [];
//     for (let i = 0; i < this.childNodes.length; i++) {
//       if (this.childNodes[i].nodeName === '#text' && this.childNodes[i].nodeValue.trim() !== '') {
//         list.push(this.childNodes[i]);
//       }
//     }
//     return list;
//   };
//   Element.prototype.hasDepth = (amount) => {
//     if (amount < 1) {
//       return true;
//     }
//     for (let i = 0; i < this.childNodes.length; i++) {
//       if (this.childNodes[i].childNodes.length > 0 && this.childNodes[i].hasDepth(amount - 1)) {
//         return true;
//       }
//     }
//     return false;
//   };
//   NodeList.prototype.index = HTMLCollection.prototype.index = (e) => {
//     for (let i = 0; i < this.length; i++) {
//       if (this[i] === e) {
//         return i;
//       }
//     }
//   };
// })();
