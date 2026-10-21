import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { navigationRef } from '../src/navigation/flow';
import { SCREEN_IDS, type ScreenId } from '../src/navigation/types';
import { appStore } from '../src/context/appStore';

// Legacy timers: modern (sinon) fake timers crash when an interval clears itself
// from inside its own callback, which the OTP countdown legitimately does on blur.
jest.useFakeTimers({ legacyFakeTimers: true });

async function renderApp() {
  await render(<App />);
  await act(async () => {
    jest.advanceTimersByTime(50);
  });
}

/** Advances fake time in small steps (screens unmount inside timer callbacks). */
async function tick(ms: number) {
  for (let t = 0; t < ms; t += 100) {
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
  }
}

async function open(id: ScreenId) {
  await act(async () => {
    navigationRef.reset({ index: 0, routes: [{ name: id }] });
    jest.advanceTimersByTime(600);
  });
}

describe('App', () => {
  beforeEach(async () => {
    appStore.reset();
    await AsyncStorage.clear();
  });

  it('hands the splash off to Welcome after 2 seconds', async () => {
    await renderApp();
    expect(screen.getByText('VERIFIED MINERAL TRADE')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(2100);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('We buy your minerals.')).toBeTruthy();
    expect(screen.getByText('Create an account')).toBeTruthy();
  });

  it('signs up with the on-screen keypad and verifies the code', async () => {
    await renderApp();
    await open('welcome');
    await fireEvent.press(screen.getByText('Create an account'));
    await act(async () => jest.advanceTimersByTime(600));
    expect(screen.getByText("What's your mobile number?")).toBeTruthy();
    expect(screen.getByText('000 000 0000')).toBeTruthy();

    for (const d of '8024419087')
      await fireEvent.press(screen.getByLabelText(d));
    expect(screen.getByText('802 441 9087')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Delete'));
    expect(screen.getByText('802 441 908')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('7'));

    await fireEvent.press(screen.getByText('Send my code'));
    await act(async () => jest.advanceTimersByTime(600));
    expect(screen.getByText('Enter the 6-digit code')).toBeTruthy();
    expect(screen.getByText('Code expires in 0:42')).toBeTruthy();

    for (const d of '123456') await fireEvent.press(screen.getByLabelText(d));
    await tick(400);
    expect(screen.getByText('Verifying your number')).toBeTruthy();
    await tick(1800);
    expect(screen.getByText("You're verified")).toBeTruthy();
  });

  it('asks unverified users to verify before buying', async () => {
    await renderApp();
    await open('bDetail');
    await fireEvent.press(screen.getByText('Verify identity to continue'));
    await act(async () => jest.advanceTimersByTime(400));
    expect(screen.getByText('Verify your identity first')).toBeTruthy();
    await fireEvent.press(screen.getByText('Not right now'));
    expect(appStore.getState().sheet).toBeNull();
  });

  it('steps the quantity and switches units', async () => {
    await renderApp();
    await open('bQty');
    expect(screen.getByDisplayValue('250')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Increase quantity'));
    expect(screen.getByDisplayValue('300')).toBeTruthy();
    await fireEvent.press(screen.getByText('Tonnes'));
    expect(screen.getByText('TONNES')).toBeTruthy();
  });

  it('reviews the quantity and address that were entered', async () => {
    appStore.setState({
      kyc: 'verified',
      qty: 5,
      qtyText: '5',
      unit: 'kg',
      delivery: {
        ...appStore.getState().delivery,
        facility: 'Test Refinery',
        street: '5 Marina',
        city: 'Lagos',
      },
    });
    await renderApp();
    await open('bReview');
    expect(screen.getByText('5 kg · $61.40 / g')).toBeTruthy();
    expect(screen.getByText(/5 Marina/)).toBeTruthy();
    expect(screen.getByText(/Test Refinery/)).toBeTruthy();
  });

  it('switches tabs from the tab bar', async () => {
    await renderApp();
    await open('bHome');
    await fireEvent.press(screen.getByLabelText('Learn'));
    await act(async () => jest.advanceTimersByTime(600));
    expect(screen.getByText('Learning Center')).toBeTruthy();
    expect(navigationRef.getCurrentRoute()?.name).toBe('lHome');
  });

  it('expands one FAQ at a time', async () => {
    await renderApp();
    await open('support');
    expect(screen.getByText(/Escrow releases within 24 hours/)).toBeTruthy();
    await fireEvent.press(
      screen.getByText('What does verification actually check?'),
    );
    expect(screen.queryByText(/Escrow releases within 24 hours/)).toBeNull();
    expect(
      screen.getByText(/A licensed verifier attends your site/),
    ).toBeTruthy();
  });

  it('sends a chat message and receives the agent reply', async () => {
    await renderApp();
    await open('chat');
    await fireEvent.press(screen.getByText('Where is my evaluator?'));
    await fireEvent.press(screen.getByLabelText('Send'));
    expect(
      screen.getAllByText('Where is my evaluator?').length,
    ).toBeGreaterThan(0);
    await act(async () => jest.advanceTimersByTime(1700));
    expect(
      screen.getByText(/Emeka is on site at Ilesha Lease Site 4/),
    ).toBeTruthy();
  });

  it('toggles a setting and picks a preference', async () => {
    await renderApp();
    await open('settings');
    expect(appStore.getState().prefs.marketing).toBe(false);
    await fireEvent.press(screen.getByText('Product news'));
    expect(appStore.getState().prefs.marketing).toBe(true);
    await fireEvent.press(screen.getByText('Currency'));
    await act(async () => jest.advanceTimersByTime(400));
    await fireEvent.press(screen.getByText('EUR'));
    expect(appStore.getState().prefsVal.currency).toBe('USD');
    await fireEvent.press(screen.getByText('Done'));
    expect(appStore.getState().prefsVal.currency).toBe('EUR');
    expect(appStore.getState().sheet).toBeNull();
  });

  describe('every screen renders', () => {
    const MARKERS: Partial<Record<ScreenId, string>> = {
      welcome: 'We buy your minerals.',
      tier: 'Your tier',
      kycId: 'Which ID will you use?',
      bHome: 'Adaeze Okafor',
      bDetail: 'Verify identity to continue',
      sEstimate: 'MINERAL BRIDGE WILL PAY YOU',
      aDetail: 'TIME REMAINING',
      lPlayer: 'CHAPTERS',
      payout: 'AVAILABLE TO WITHDRAW',
      settings: 'Log out',
    };
    it.each(SCREEN_IDS.filter(id => id !== 'splash'))('%s', async id => {
      await renderApp();
      await open(id);
      expect(navigationRef.getCurrentRoute()?.name).toBe(id);
      expect(screen.getByTestId(`screen-${id}`)).toBeTruthy();
      const marker = MARKERS[id];
      if (marker) expect(screen.getAllByText(marker).length).toBeGreaterThan(0);
    });
  });
});
