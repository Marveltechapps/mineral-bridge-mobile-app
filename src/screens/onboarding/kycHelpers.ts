import type { MBStore } from '../../context/store';
import type { KycDocId } from '../../types/mineralBridge';
import { kycDocRows } from '../../lib/mappers';

/** The documents this user must upload, with their display labels. */
export function idDocs(store: MBStore): [KycDocId, string][] {
  const s = store.state;
  return kycDocRows(s.kycReq, s.kyc.idType, store.bizDocNeeded());
}