import { Linking, Share } from 'react-native';
import { Remote } from '../src/context/remote';
import * as catalogueSvc from '../src/services/catalogue.service';

jest.mock('../src/services/catalogue.service');
jest.mock('../src/services/auth.service');
jest.mock('../src/services/me.service');

const catalogue = catalogueSvc as jest.Mocked<typeof catalogueSvc>;

describe('BUG-005: openProductDocument download', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('BUG-005: download=true shares the signed URL', async () => {
    catalogue.getProductDocument.mockResolvedValue({
      type: 'lot_test_report',
      number: 'SGS-1',
      name: 'sgs-report.pdf',
      contentType: 'application/pdf',
      available: true,
      url: 'https://files.example.com/sgs-report.pdf',
      expiresAt: null,
    });
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

    const host = {
      s: { flash: jest.fn(), setState: jest.fn(), state: {} },
      fail: jest.fn(),
      run: async (_k: string, fn: () => Promise<unknown>) => fn(),
      st: { user: null },
    } as unknown as ConstructorParameters<typeof Remote>[0];
    const remote = new Remote(host);

    const ok = await remote.openProductDocument('REF-1', 'lot_test_report', true);
    expect(ok).toBe(true);
    expect(share).toHaveBeenCalledWith({ url: 'https://files.example.com/sgs-report.pdf', title: 'sgs-report.pdf' });
    share.mockRestore();
  });

  it('BUG-005 neighbouring: view opens with Linking', async () => {
    catalogue.getProductDocument.mockResolvedValue({
      type: 'lot_test_report',
      number: 'SGS-1',
      name: 'sgs-report.pdf',
      contentType: 'application/pdf',
      available: true,
      url: 'https://files.example.com/view.pdf',
      expiresAt: null,
    });
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const host = {
      s: { flash: jest.fn(), setState: jest.fn(), state: {} },
      fail: jest.fn(),
      run: async (_k: string, fn: () => Promise<unknown>) => fn(),
      st: { user: null },
    } as unknown as ConstructorParameters<typeof Remote>[0];
    const remote = new Remote(host);
    await remote.openProductDocument('REF-1', 'lot_test_report', false);
    expect(open).toHaveBeenCalledWith('https://files.example.com/view.pdf');
    open.mockRestore();
  });
});