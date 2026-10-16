import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import { appStore } from '../context/appStore';
import { tabHome } from './screenMeta';
import type { RootStackParamList, ScreenId } from './types';

/**
 * Navigation verbs from the design, usable from screens and from the
 * overlays that live outside the navigator:
 *
 * - `go`   pushes a screen onto the history (`go(s)`),
 * - `jump` replaces the whole history (tab bar, deep links, sign-out),
 * - `back` pops, or falls back to the current tab's home screen.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function currentScreen(): ScreenId | undefined {
  return navigationRef.isReady()
    ? (navigationRef.getCurrentRoute()?.name as ScreenId | undefined)
    : undefined;
}

export function go(screen: ScreenId | undefined) {
  if (!screen || !navigationRef.isReady()) return;
  appStore.setState({ sheet: null, banner: false, toast: null });
  navigationRef.dispatch(StackActions.push(screen));
}

export function jump(screen: ScreenId) {
  if (!navigationRef.isReady()) return;
  appStore.setState({ sheet: null, toast: null, banner: false });
  navigationRef.reset({ index: 0, routes: [{ name: screen }] });
}

/** Swaps the current screen without adding history (auto-advancing screens). */
export function replace(screen: ScreenId) {
  if (!navigationRef.isReady()) return;
  appStore.setState({ sheet: null, toast: null, banner: false });
  navigationRef.dispatch(StackActions.replace(screen));
}

/** @returns `false` when there is nowhere to go back to (Android exits the app). */
export function back(): boolean {
  if (!navigationRef.isReady()) return false;
  if (navigationRef.canGoBack()) {
    appStore.setState({ sheet: null });
    navigationRef.goBack();
    return true;
  }
  const screen = currentScreen();
  const home = screen ? tabHome(screen) : 'bHome';
  appStore.setState({ sheet: null });
  if (screen && home !== screen) {
    navigationRef.reset({ index: 0, routes: [{ name: home }] });
    return true;
  }
  return false;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

/** Shows the green confirmation toast for 2.4s. */
export function flash(message: string) {
  appStore.setState({ toast: message });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => appStore.setState({ toast: null }), 2400);
}
