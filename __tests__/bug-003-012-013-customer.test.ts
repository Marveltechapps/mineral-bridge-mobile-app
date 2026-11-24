import { isOutgoingChatAuthor, otpEmailForDisplay, paymentNeedsReference, paymentSubmitError, qtyValue, quotationNumberToSubmit, screenPollsOrders } from '../src/lib/mappers';

describe('BUG-003: OTP email label', () => {
  it('BUG-003: shows the full registered email, not a partial mask', () => {
    expect(otpEmailForDisplay('adaeze@example.com', 'ad•••e@example.com')).toBe('adaeze@example.com');
  });

  it('BUG-003 edge: blank input does not invent a mask', () => {
    expect(otpEmailForDisplay('  ', 'ad•••e@example.com')).toBe('your email');
  });

  it('BUG-003 neighbouring: phone numbers are not treated as email', () => {
    expect(otpEmailForDisplay('8030000000', '')).toBe('your email');
  });
});

describe('BUG-012 / BUG-013: sell quantity', () => {
  it('BUG-012: grams stored in value with unit kg display as 1 kg', () => {
    expect(qtyValue({ value: 1000, unit: 'kg', grams: 1000 })).toBe(1);
  });

  it('BUG-013: value 0 with 1000 grams displays as 1 kg, not 0', () => {
    expect(qtyValue({ value: 0, unit: 'kg', grams: 1000 })).toBe(1);
  });

  it('BUG-012 neighbouring: a real 1 kg and a real 1000 kg are unchanged', () => {
    expect(qtyValue({ value: 1, unit: 'kg', grams: 1000 })).toBe(1);
    expect(qtyValue({ value: 1000, unit: 'kg', grams: 1_000_000 })).toBe(1000);
  });
});

describe('BUG-008 / BUG-009 / BUG-015 / BUG-016', () => {
  it('BUG-008: bank transfer shows a reference field; a receipt is still required', () => {
    expect(paymentNeedsReference('Bank transfer')).toBe(true);
    expect(paymentSubmitError('Bank transfer', '', false)).toMatch(/receipt/i);
    expect(paymentSubmitError('Bank transfer', 'UTR123456', true)).toBeNull();
    expect(paymentSubmitError('UPI', '', true)).toMatch(/reference/i);
    expect(paymentNeedsReference('Bitcoin')).toBe(false);
  });

  it('BUG-009: the issued quotation number is submitted', () => {
    expect(quotationNumberToSubmit('Q-1024-R2 · revised', 'Q-1-R1')).toBe('Q-1024-R2');
  });

  it('BUG-015: the seller home polls orders', () => {
    expect(screenPollsOrders('home')).toBe(true);
    expect(screenPollsOrders('chat')).toBe(false);
  });

  it('BUG-016: customer messages are outgoing and agent messages are incoming', () => {
    expect(isOutgoingChatAuthor({ sender_role: 'customer' })).toBe(true);
    expect(isOutgoingChatAuthor({ kind: 'agent' }, 'u1')).toBe(false);
  });
});
