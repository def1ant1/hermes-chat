import { DEFAULT_SETTINGS } from '@hermeslabs/const';
import { UserSettings } from '@hermeslabs/types';
import type { PartialDeep } from 'type-fest';

export interface UserSettingsState {
  defaultSettings: UserSettings;
  settings: PartialDeep<UserSettings>;
  updateSettingsSignal?: AbortController;
}

export const initialSettingsState: UserSettingsState = {
  defaultSettings: DEFAULT_SETTINGS,
  settings: {},
};
