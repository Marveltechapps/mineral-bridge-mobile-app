/**
 * Backend endpoints each screen needs in production. No Mineral Bridge API
 * exists yet, so the app runs on the design's bundled data
 * (`src/lib/catalog.ts`); these paths document the integration surface.
 */
export const ENDPOINTS = {
  auth: {
    requestOtp: '/auth/otp/request',
    verifyOtp: '/auth/otp/verify',
    resendOtp: '/auth/otp/resend',
    signOut: '/auth/sign-out',
    deleteAccount: '/auth/account',
  },
  account: {
    profile: '/me',
    tier: '/me/tier',
    preferences: '/me/preferences',
  },
  kyc: {
    submit: '/kyc/submissions',
    status: '/kyc/status',
    uploadDocument: '/kyc/documents',
  },
  catalog: {
    categories: '/catalog/categories',
    types: (category: string) => `/catalog/categories/${category}/types`,
    products: (type: string) => `/catalog/types/${type}/products`,
    product: (id: string) => `/catalog/products/${id}`,
  },
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (id: string) => `/orders/${id}`,
    tracking: (id: string) => `/orders/${id}/tracking`,
    cart: '/cart',
  },
  sell: {
    estimate: '/sell/estimates',
    requests: '/sell/requests',
    request: (id: string) => `/sell/requests/${id}`,
    slots: '/sell/evaluation-slots',
    acceptOffer: (id: string) => `/sell/requests/${id}/offer/accept`,
    declineOffer: (id: string) => `/sell/requests/${id}/offer/decline`,
    bulkQuote: '/sell/bulk-quotes',
  },
  auctions: {
    list: '/auctions',
    detail: (id: string) => `/auctions/${id}`,
    bids: (id: string) => `/auctions/${id}/bids`,
  },
  learn: {
    tracks: '/learn/tracks',
    lesson: (id: string) => `/learn/lessons/${id}`,
    progress: (id: string) => `/learn/lessons/${id}/progress`,
  },
  payouts: {
    balance: '/payouts/balance',
    accounts: '/payouts/accounts',
    withdraw: '/payouts/withdrawals',
    history: '/payouts/history',
  },
  documents: { list: '/documents', detail: (id: string) => `/documents/${id}` },
  notifications: { list: '/notifications', markAllRead: '/notifications/read' },
  support: {
    tickets: '/support/tickets',
    ticket: (id: string) => `/support/tickets/${id}`,
    chat: '/support/chat',
  },
} as const;
