/* eslint-disable func-names */
import log from '../helpers/log';
const selectionClass = 'myparcel__mapping-field';

const obj = {
  stopMapping() {
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keyup', this.checkForEscape);
    document.removeEventListener('mousemove', this.mouseMove);

    if (document.getElementsByClassName(selectionClass).length) {
      for (const element of document.getElementsByClassName(selectionClass)) {
        element.classList.remove(selectionClass);
      }
    }
  },

  checkForEscape(event, resolve) {
    if (event.keyCode === 27) {
      this.stopMapping();
      resolve(null);
    }
  },

  mouseMove(event) {
    event.stopPropagation();
    const e = event.target;

    console.log(document.getElementsByClassName(selectionClass));
    if (document.getElementsByClassName(selectionClass).length) {
      document.getElementsByClassName(selectionClass)[0].classList.remove(selectionClass);
    }

    e.classList.add(selectionClass);
  },

  handleClick(event, resolve) {
    event.stopPropagation();
    event.preventDefault();

    let element = event.target;
    ['input', 'select'].forEach((tag) => {
      if (element.getElementsByTagName(tag).length > 0) {
        element = element.getElementsByTagName(tag)[0];
      }
    });

    console.log(element);
    const path = element.getPath();
    console.log(path);
    this.stopMapping();
    resolve({path});
  },
};

export const clickedElement = () => {
  return new Promise((resolve) => {
    document.addEventListener('mousemove', obj.mouseMove);
    document.addEventListener('keyup', (event) => obj.checkForEscape(event, resolve));
    document.addEventListener('click', (event) => obj.handleClick(event, resolve));
  });
};

HTMLElement.prototype.getPath = function() {
  console.log(this);
  console.log(this.tagName);
  console.log(this.innerText);
  const content = this.innerText;
  // const stack = [];
  // while ( this.parentNode != null ) {
  //   let sibCount = 0;
  //   let sibIndex = 0;
  //   for ( let i = 0; i < this.parentNode.childNodes.length; i++ ) {
  //     const sib = this.parentNode.childNodes[i];
  //     if ( sib.nodeName === this.nodeName ) {
  //       if ( sib === this ) {
  //         sibIndex = sibCount;
  //       }
  //       sibCount++;
  //     }
  //   }
  //   if ( this.hasAttribute('id') && this.id !== '' ) {
  //     stack.unshift(`${this.nodeName.toLowerCase()}#${this.id}`);
  //   } else if ( sibCount > 1 ) {
  //     stack.unshift(`${this.nodeName.toLowerCase()}:eq(${sibIndex})`);
  //   } else {
  //     stack.unshift(this.nodeName.toLowerCase());
  //   }
  //   const el = this.parentNode;
  //   console.log(el);
  // }
  // console.log(stack);
  // return stack.slice(1); // removes the html element
};

// showToolbar(name, text) {
//   if (!document.getElementById('myparcelTooltip')) {
//     this.createToolbar();
//   }
//
//   const tooltip = document.getElementById('myparcelTooltip');
//
//   tooltip.style.display = 'block';
//   tooltip.querySelector('span').innerHTML = text;
//   tooltip.querySelector('em').innerHTML = name;
// },
//
// hideToolbar() {
//   const tooltip = document.getElementById('myparcelTooltip');
//   if (tooltip) {
//     tooltip.style.display = 'none';
//   }
// },
//
// createToolbar() {
//   let tooltip = document.getElementById('myparcelTooltip');
//   if (tooltip) {
//     tooltip.parentElement.removeChild(tooltip);
//   }
//
//   tooltip = document.createElement('div');
//   tooltip.setAttribute('id', 'myparcelTooltip');
//   tooltip.innerHTML = '<div class="arrow"></div><div class="text"><span></span><em></em>or<em class="esc">esc</em></div>';
//   document.body.appendChild(tooltip);
// },
//
// followMouse(event) {
//   let eventDoc, doc, body, x, y;
//   x = event.pageX;
//   y = event.pageY;
//   if (x === null && event.clientX !== null) {
//     eventDoc = (event.target && event.target.ownerDocument) || document;
//     doc = eventDoc.documentElement;
//     body = eventDoc.body;
//     x = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
//     y = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
//   }
//   const tooltip = document.getElementById('myparcelTooltip');
//   if (tooltip) {
//     tooltip.style.top = `${y}px`;
//     tooltip.style.left = `${x + 10}px`;
//   }
// },
// chooseElement(event) {
//   event.stopPropagation();
//   event.preventDefault();
//
//   let element = event.target;
//   /** If the element has an input get that instead */
//   if (element.getElementsByTagName('input').length > 0) {
//     element = element.getElementsByTagName('input')[0];
//   }
//   if (element.getElementsByTagName('select').length > 0) {
//     element = element.getElementsByTagName('select')[0];
//   }
//
//   let path = element.getPath();
//   if (element.classList.contains('createdSubItem')) {
//     const index = element.parentElement.getElementsByClassName('createdSubItem').index(element);
//     path = `${element.parentElement.getPath()} @ ${index}`;
//   }
//
//   this.stopSelecting();
//   this.sendToBackground('chooseElement', {path: path, value: this.getSelectorValues(path)});
//
//   return false;
// },

// function wrap(array) {
//   for (let i = 0; i < array.length; i++) {
//     const e = array[i];
//     if (e.parentElement.childNodes.length > 1 && e.textContent.trim() !== '') {
//       const span = document.createElement('span');
//       span.innerHTML = e.textContent;
//       span.classList.add('createdSubItem');
//       e.parentNode.insertBefore(span, e);
//       e.parentNode.removeChild(e);
//     }
//   }
// }
//
// function unwrap() {
//   const array = document.getElementsByClassName('createdSubItem');
//   if (array) {
//     for (let i = array.length - 1; i >= 0; i--) {
//       const e = array[i];
//       const txt = document.createTextNode(e.textContent);
//       e.parentNode.insertBefore(txt, e);
//       e.parentNode.removeChild(e);
//     }
//   }
// }
