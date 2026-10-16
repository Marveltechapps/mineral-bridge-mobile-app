import React from 'react';
import { OutbidBanner, Toast } from './Notices';
import { Sheets } from './Sheets';

/** App-level layers drawn above every screen: banner, toast, then sheets. */
export function Overlays() {
  return (
    <>
      <OutbidBanner />
      <Toast />
      <Sheets />
    </>
  );
}
