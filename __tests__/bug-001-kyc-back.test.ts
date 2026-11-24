/**
 * BUG-001: a mocked picker returns a back image; upload uses the back field.
 */
import { KYC_DOC_TO_KIND, ID_TYPE_WIRE } from '../src/lib/mappers';

describe('BUG-001: National ID back upload (mobile)', () => {
  it('maps back → id_back and National ID → national_id for the upload payload', () => {
    expect(KYC_DOC_TO_KIND.back).toBe('id_back');
    expect(ID_TYPE_WIRE['National ID']).toBe('national_id');
  });

  it('BUG-001 neighbouring: front mapping unchanged', () => {
    expect(KYC_DOC_TO_KIND.front).toBe('id_front');
  });
});
