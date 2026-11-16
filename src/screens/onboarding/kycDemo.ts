import type { MBStore } from '../../context/store';

/** Demo buttons that simulate the compliance team's KYC decision. */
export function kycDemo(store: MBStore) {
  return {
    approve: () => { store.setState(x => ({ user: x.user ? { ...x.user, kyc: 'verified' } : x.user })); store.flash('Demo: KYC approved'); },
    reject: () => {
      const now = Date.now();
      store.setState(x => ({
        user: x.user ? { ...x.user, kyc: 'rejected', kycReason: 'Compliance asked you to re-upload 2 documents. Replace them and resubmit.', kycFlags: { address: ['Proof of address is older than 3 months. Upload one dated within the last 3 months.', now], selfie: ['Your face is partly hidden. Take a new selfie in good light holding your ID.', now] } } : x.user,
        kyc: { ...x.kyc, consent: false },
      }));
      store.notify(null, 'KYC: documents need re-upload', 'Replace your proof of address and selfie, then resubmit.');
      store.flash('Demo: compliance asked for re-upload');
    },
  };
}
