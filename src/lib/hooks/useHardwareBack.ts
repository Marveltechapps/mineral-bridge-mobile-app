import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { back } from '../../navigation/flow';
import { appStore } from '../../context/appStore';

/**
 * Android back button: closes an open sheet first, then follows the same
 * history as the on-screen back arrow. When there is nowhere left to go the
 * event is not handled, so Android leaves the app.
 */
export function useHardwareBack() {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (appStore.getState().sheet) {
        appStore.setState({ sheet: null });
        return true;
      }
      return back();
    });
    return () => sub.remove();
  }, []);
}
