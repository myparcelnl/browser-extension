import {
  type MessageGetContentFromPopup,
  type MessageDataWithPreset,
  type MappedFieldMessage,
  type StoredExtensionSettings,
  type DeleteFieldsMessage,
} from '../types/index.js';
import {ActionNames} from '../helpers/index.js';
import Logger from '../helpers/Logger.js';
import {GLOBAL_SETTING_PREFIX} from '../constants.js';
import {
  saveMappings,
  getSavedMappingsForUrl,
  getSavedGlobalSettings,
  saveSettings,
  deleteMappedFields,
  removeFromStorage,
  getStorageKeys,
} from './storage/index.js';
import Connection from './Connection.js';

/**
 * Actions to run from the background script.
 */
export default class BackgroundActions {
  /**
   * Get the content for given preset selectors and any selectors in storage. Requires `url` to be present in `request`.
   * Will search stored mappings for `request.url` and send any found selectors to the content script to get the content
   * of each selector.
   *
   * Data is saved and retrieved by hostname.
   *
   * @example getContent({ url: 'url.com' });
   */
  static async getContent(request: MessageGetContentFromPopup) {
    const requestUrl = request.url;

    if (!requestUrl) {
      throw new Error('No url provided.');
    }

    const resolvedRequest: MessageGetContentFromPopup = {
      ...request,
      url: new URL(requestUrl).hostname,
    };

    const {url, preset} = resolvedRequest;

    const [savedSelectors, newPresetName] = await Promise.all([
      getSavedMappingsForUrl(url),
      this.updatePreset(resolvedRequest),
    ]);

    const selectors = {...preset, ...savedSelectors};

    // Only send to content if either a preset or at least one selector is present.
    if (!Object.keys(selectors).length) {
      Logger.warning(`No preset or selectors present for "${url}".`);
      return;
    }

    Connection.sendToContent({
      ...resolvedRequest,
      action: ActionNames.getContent,
      presetName: newPresetName,
      selectors,
    } satisfies MessageDataWithPreset);
  }

  /**
   * Get settings (if any) and append them to the defaults.
   */
  static async getGlobalSettings(): Promise<StoredExtensionSettings> {
    const savedSettings = await getSavedGlobalSettings();

    return {
      enable_context_menu: true,
      ...savedSettings,
    };
  }

  /**
   * Save mapped field to local storage if not null and send it to popup.
   */
  static saveMappedField(request: MappedFieldMessage) {
    if (request.path) {
      void saveMappings(request);
    }

    Connection.sendToPopup(request);
  }

  /**
   * Save settings to local storage, tell the popup about it and return them.
   */
  static async saveGlobalSettings(settings: StoredExtensionSettings): Promise<StoredExtensionSettings> {
    const newSettings = {
      ...(await this.getGlobalSettings()),
      ...settings,
    } satisfies StoredExtensionSettings;

    saveSettings(newSettings, GLOBAL_SETTING_PREFIX);
    Connection.sendToPopup({action: ActionNames.savedSettings});
    return newSettings;
  }

  /**
   * Delete a given field from storage.
   */
  static deleteFields(request: DeleteFieldsMessage) {
    return deleteMappedFields(request);
  }

  /**
   * Update/remove preset and return its name.
   */
  static async updatePreset(request: MessageDataWithPreset): Promise<string> {
    const {url, presetName, presetChosenManually = false, resetPresetSettings = false} = request;
    const presetNameSettingKey = `${url}-chosenPreset`;

    if (resetPresetSettings) {
      removeFromStorage(presetNameSettingKey);
    }

    if (presetChosenManually) {
      saveSettings({[presetNameSettingKey]: presetName});
      return presetName;
    }

    const settingsKeys = await getStorageKeys(GLOBAL_SETTING_PREFIX);

    if (!settingsKeys.hasOwnProperty(presetNameSettingKey)) {
      return presetName;
    }

    return settingsKeys[presetNameSettingKey] as string;
  }
}
