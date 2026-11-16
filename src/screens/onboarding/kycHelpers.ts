import type { MBStore } from '../../context/store';
import type { KycDocId } from '../../types/mineralBridge';

/** The documents this user must upload, with their display labels. */
export function idDocs(store: MBStore): [KycDocId, string][] {
  const k = store.state.kyc;
  const all: [KycDocId, string, boolean][] = [
    ['front', k.idType === 'Passport' ? 'Passport photo page' : k.idType + ' · front', true],
    ['back', k.idType + ' · back', k.idType !== 'Passport'],
    ['selfie', 'Selfie holding your ID', true],
    ['address', 'Proof of address (utility bill, bank statement or lease)', true],
    ['biz', 'Business document (registration, licence or permit)', store.bizDocNeeded()],
  ];
  return all.filter(d => d[2]).map(d => [d[0], d[1]]);
}
