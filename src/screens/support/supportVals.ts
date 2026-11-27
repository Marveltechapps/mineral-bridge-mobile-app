// Labels and tones shared by the support inbox and thread screens.
import { D } from '../../theme';

export const TOPIC: Record<string, string> = { general: 'General question', other_payment_method: 'Other payment method', order: 'Order help', sell: 'Selling help' };
export const topicLabel = (t: string) => TOPIC[t] || t.replace(/_/g, ' ').replace(/^./, m => m.toUpperCase());

const STATUS: Record<string, [string, string, string]> = {
  open: ['Open', D.amberBg, D.AMBER],
  agent_replied: ['Replied', D.blueBg, D.blue],
  waiting_on_user: ['Waiting for you', D.amberBg, D.AMBER],
  resolved: ['Resolved', D.greenBg, D.green],
  closed: ['Closed', D.chip, D.ink2],
};
export const statusTone = (st: string): [string, string, string] => STATUS[st] || [st.replace(/_/g, ' ').replace(/^./, m => m.toUpperCase()), D.chip, D.ink2];
