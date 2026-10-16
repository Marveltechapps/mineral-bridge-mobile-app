import { CommonActions, type LinkingOptions } from '@react-navigation/native';
import { SCREEN_IDS, type RootStackParamList, type ScreenId } from './types';

/**
 * `mineralbridge://<screen>` opens any screen directly (push notifications,
 * support links and automated screenshot runs), e.g.
 * `adb shell am start -d mineralbridge://aDetail`. Like the design's screen
 * picker (`jump`), a link replaces the history, so back returns to the
 * screen's tab home.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['mineralbridge://'],
  config: {
    screens: Object.fromEntries(SCREEN_IDS.map(id => [id, id])) as Record<
      ScreenId,
      string
    >,
  },
  getActionFromState: state =>
    CommonActions.reset({ ...state, index: state.routes.length - 1 }),
};
