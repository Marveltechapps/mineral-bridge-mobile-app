import { useEffect } from 'react';
import { flash } from '../../navigation/flow';
import {
  appStore,
  setAppState,
  useApp,
  type ChatMessage,
} from '../../context/appStore';

const HISTORY: ChatMessage[] = [
  {
    who: 'a',
    text: 'Hi Adaeze, Ngozi from the verification desk. How can I help?',
    time: '14:06',
  },
  {
    who: 'u',
    text: 'My evaluation is running now. When will I see the offer?',
    time: '14:07',
    read: true,
  },
  {
    who: 'a',
    text: 'The fire assay finishes around 16:00 and the offer is issued straight after. You will get a push notification.',
    time: '14:08',
  },
];

const REPLIES: Record<string, string> = {
  'Where is my evaluator?':
    'Emeka is on site at Ilesha Lease Site 4 — he checked in at 10:02 and the assay is running now.',
  'Change my payout account':
    'I can do that. Open Profile then Payouts and add the account; I will verify it while we talk.',
  'Talk about an order':
    'Sure — MB-2026-04871 is in transit and lands Wednesday between 14:00 and 17:00.',
};

export const QUICK_REPLIES = Object.keys(REPLIES);

let replyTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Live chat with the verification desk. Sending appends the message, shows
 * the typing indicator and posts the agent's reply 1.6s later (demo agent;
 * see `ENDPOINTS.support.chat` for the production socket).
 */
export function useChat() {
  const { chatOut, draft, typing } = useApp(s => ({
    chatOut: s.chatOut,
    draft: s.chatDraftText,
    typing: s.chatTyping,
  }));
  useEffect(() => () => clearTimeout(replyTimer), []);

  const send = () => {
    const st = appStore.getState();
    const text = (st.chatDraftText || '').trim();
    if (!text) {
      flash('Type a message first');
      return;
    }
    const n = st.chatOut.length;
    setAppState(p => ({
      chatDraftText: '',
      chatTyping: true,
      chatOut: p.chatOut.concat([
        {
          who: 'u',
          text,
          time: '14:' + String(9 + n).padStart(2, '0'),
          read: true,
        },
      ]),
    }));
    clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      const reply =
        REPLIES[text] ||
        'Got it — let me check that against your account and come straight back to you.';
      setAppState(p => ({
        chatTyping: false,
        chatOut: p.chatOut.concat([
          {
            who: 'a',
            text: reply,
            time: '14:' + String(10 + n).padStart(2, '0'),
          },
        ]),
      }));
    }, 1600);
  };

  return {
    messages: HISTORY.concat(chatOut),
    draft,
    typing,
    setDraft: (t: string) => setAppState({ chatDraftText: t }),
    send,
  };
}
