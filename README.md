# Chrome Extension

## Installation

Run the following scripts to get the dev environment up and running:

```bash
yarn
```

```bash
yarn serve
```

### Create build

Build only `myparcel` for each environment

```bash
yarn build myparcel --environment development
yarn build myparcel --environment staging
yarn build myparcel
```

Build all for all environments

```bash
yarn build --environment development
yarn build --environment staging
yarn build
```

In Google Chrome, go to `chrome://extensions` and turn on developer mode if you haven't already. Press the "Load unpacked" button in the top left and select the folder of the extension you want from `dist`. It's possible to have them all running simultaneously in any environment.

You need to run the backoffice locally as well and change the `browserExtensionId` in the dev config for the platform you're trying to use to the id of the extension you just added. You can find this id in `chrome://extensions`.

That's it, now you can use the extension by pressing the new button in your toolbar!

## Usage

### How it works

The extension has an always-present script which is the background script. It will inject a content script on every web page you visit. The third script is actually part of the backoffice but will be referred to as "popup" or "popup script".

#### Flow

The extension works by sending messages between the three scripts. The background can communicate with both the content and the popup, but the content and popup can't communicate with each other, meaning any message has to pass through the background script.

```
content ←→ background ←→ popup
```

#### Popup

When you open the extension (via the browser button) it will load the backoffice in a popup. The backoffice URL is based on the current environment and platform. If you use the sendmyparcel extension made with `npm run dev` the initial popup URL will be `extension.dev.sendmyparcel.be/browser-extension/create-shipment`.

The backoffice will be in a different "mode", most routes are not loaded. On loading the backoffice it will "boot" the browser extension and send a `popupConnected` message to the background script.

### Debugging

To debug the extension, go to `chrome://extensions` in Chrome and click the `background page` link for this extension. This will open a console window for the extension's background script. In dev and stage environments there will be a fair amount of logging to show the user what's happening and allow for easier debugging. This is not present in prod as all code will be minified and the entire `Logger.js` file will not be loaded and all its calls will be stripped out.
