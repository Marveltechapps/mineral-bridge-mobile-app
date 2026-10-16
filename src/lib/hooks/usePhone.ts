import { useApp } from '../../context/appStore';

/** Groups a national number as "802 441 9087". */
export function formatPhone(phone: string): string {
  return [phone.slice(0, 3), phone.slice(3, 6), phone.slice(6, 10)]
    .filter(Boolean)
    .join(' ');
}

/** The number being entered, formatted for display and with the +234 prefix. */
export function usePhone() {
  const phone = useApp(s => s.phone);
  return {
    phone,
    display: formatPhone(phone) || '000 000 0000',
    full: '+234 ' + formatPhone(phone),
    color: phone ? '#1a1f36' : '#b9c0d6',
  };
}
