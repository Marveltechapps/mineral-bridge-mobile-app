import { useEffect } from 'react';
import { DevSettings } from 'react-native';
import { flash } from '../../navigation/flow';
import { appStore } from '../../context/appStore';

/**
 * The design's "STATES" panel, exposed in debug builds through the React
 * Native dev menu (Ctrl+M / shake). These are states the backend normally
 * triggers (outbid alerts, KYC approval), so they have no in-app control.
 */
export function useDevStates() {
  useEffect(() => {
    if (!__DEV__) return;
    const set = appStore.setState;
    DevSettings.addMenuItem('State: outbid banner', () =>
      set({ banner: true }),
    );
    DevSettings.addMenuItem('State: bid confirmed toast', () =>
      flash('Bid placed — $48,400 on Cobalt Hydroxide'),
    );
    DevSettings.addMenuItem('State: filter bottom sheet', () =>
      set({ sheet: 'filter' }),
    );
    DevSettings.addMenuItem('State: cycle account tier', () =>
      set(p => ({ tierIdx: (p.tierIdx + 1) % 3 })),
    );
    DevSettings.addMenuItem('State: cycle KYC status', () =>
      set(p => ({
        kyc:
          p.kyc === 'verified'
            ? 'none'
            : p.kyc === 'none'
            ? 'pending'
            : 'verified',
      })),
    );
  }, []);
}
