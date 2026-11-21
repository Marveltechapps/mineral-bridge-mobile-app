// Labels and tones shared by the support inbox and thread screens.
import { colors as c } from '../../theme';

export const TOPIC: Record<string, string> = { general: 'General question', other_payment_method: 'Other payment method', order: 'Order help', sell: 'Selling help' };
export const topicLabel = (t: string) => TOPIC[t] || t.replace(/_/g, ' ').replace(/^./, m => m.toUpperCase());

const STATUS: Record<string, [string, string, string]> = {
  open: ['Open', c.amberBg, c.amber],
  agent_replied: ['Replied', c.blueBg, c.blue],
  waiting_on_user: ['Waiting for you', c.amberBg, c.amber],
  resolved: ['Resolved', c.greenBg, c.green],
  closed: ['Closed', c.chip, c.ink2],
};
export const statusTone = (st: string): [string, string, string] => STATUS[st] || [st.replace(/_/g, ' ').replace(/^./, m => m.toUpperCase()), c.chip, c.ink2];
