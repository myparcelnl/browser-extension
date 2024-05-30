import {
  type MessageGetContentFromPopup,
  type MessageDataWithPreset,
  type MappedFieldMessage,
  type StoredExtensionSettings,
} from '../types/index.js';
import {ActionNames} from '../helpers/index.js';
import Logger from '../helpers/Logger.js';
import {GLOBAL_SETTING_PREFIX} from '../constants.js';
import {
  saveMappings,
  getSavedMappingsForUrl,
  getSavedGlobalSettings,
  saveSettings,
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
  public static async getContent(message: MessageGetContentFromPopup): Promise<void> {
    const requestUrl = message.url;

    if (!requestUrl) {
      throw new Error('No url provided.');
    }

    const resolvedMessage: MessageGetContentFromPopup = {
      ...message,
      url: new URL(requestUrl).hostname,
    };

    const {url, preset} = resolvedMessage;

    const [savedSelectors, newPresetName] = await Promise.all([
      getSavedMappingsForUrl(url),
      this.updatePreset(resolvedMessage),
    ]);

    const selectors = {...preset, ...savedSelectors};

    // Only send to content if either a preset or at least one selector is present.
    if (!Object.keys(selectors).length) {
      Logger.warning(`No preset or selectors present for "${url}".`);
      return;
    }

    Connection.sendToContent({
      ...resolvedMessage,
      action: ActionNames.getContent,
      presetName: newPresetName,
      selectors,
    } satisfies MessageDataWithPreset);
  }

  /**
   * Get settings (if any) and append them to the defaults.
   */
  public static async getGlobalSettings(): Promise<StoredExtensionSettings> {
    const savedSettings = await getSavedGlobalSettings();

    return {
      enable_context_menu: true,
      ...savedSettings,
    };
  }

  /**
   * Save settings to local storage, tell the popup about it and return them.
   */
  public static async saveGlobalSettings(settings: StoredExtensionSettings): Promise<StoredExtensionSettings> {
    const newSettings = {
      ...(await this.getGlobalSettings()),
      ...settings,
    } satisfies StoredExtensionSettings;

    saveSettings(newSettings, GLOBAL_SETTING_PREFIX);
    Connection.sendToPopup({action: ActionNames.savedSettings});
    return newSettings;
  }

  /**
   * Save mapped field to local storage if not null and send it to popup.
   */
  public static saveMappedField(message: MappedFieldMessage): void {
    if (message.path) {
      void saveMappings(message);
    }

    Connection.sendToPopup(message);
  }

  /**
   * Update/remove preset and return its name.
   */
  private static async updatePreset(message: MessageDataWithPreset): Promise<string> {
    const {url, presetName, presetChosenManually = false, resetPresetSettings = false} = message;
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
