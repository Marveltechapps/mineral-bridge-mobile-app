// Root-level routes. 'home' and 'samples' are the original starter screens
// (HomeScreen / SampleScreen), kept unchanged. 'app' is the Mineral Bridge
// customer app built from the design handoff.
export type ScreenName = 'home' | 'samples' | 'app';

// Screens inside the Mineral Bridge customer app (see src/navigation/AppShell.tsx).
export type AppScreen =
  | 'welcome' | 'auth' | 'otp' | 'regType' | 'regDetails' | 'kyc' | 'kycDoc' | 'kycDone'
  | 'home' | 'cats' | 'minerals' | 'lots' | 'detail' | 'cart' | 'checkout' | 'placed'
  | 'orders' | 'order' | 'quote' | 'contract' | 'payInsp' | 'sellConfirm' | 'report' | 'pay'
  | 'refund' | 'cancel' | 'refunds' | 'receipt' | 'chat' | 'shipment'
  | 'sellCats' | 'sellForm' | 'sellDone'
  | 'profile' | 'editProfile' | 'bizType' | 'kycStatus' | 'notifs' | 'prefs' | 'help'
  | 'auctions' | 'auction' | 'auctionWon' | 'doc';
