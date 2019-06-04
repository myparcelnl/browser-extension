# Chrome Extension

## Installation
Run the following scripts to get the dev environment up and running:

```bash
npm i
npm run dev
```

In Google Chrome, go to `chrome://extensions` and turn on developer mode if you haven't already. Press the "Load unpacked" button in the top left and add the root of this folder. 

That's it, now you can use the extension by pressing the new button in your toolbar!

## Usage

### How it works
The extension has an "always present" script which is the background script. It will inject a content script on every web page you visit. The third script, the popup script, lives in the backoffice. When you open the extension (via the browser button) it will load your local backoffice on `/browser-extension/create-shipment`. The backoffice will be in a different "mode", most routes are not loaded. On loading the backoffice it will "boot" the browser extension and send a `popupConnected` message to the background script.

#### Flow
```
content ←→ background ←→ popup
```

### Debugging
To debug the extension, go to `chrome://extensions` in Chrome and click the `background page` link for this extension. This will open a console window for the extension's background script.
