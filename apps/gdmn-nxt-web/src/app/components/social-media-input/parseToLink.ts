import { MessengerCode } from '@gsbelarus/util-api-types';
import { socialMediaIcons } from './social-media-icons';

export const parseToMessengerLink = (code: MessengerCode, name: string) => {
  const parseToString = (messengerName: string) => {
    return `${socialMediaIcons[code].link}${messengerName}`;
  };
  if (code === 'telegram') {
    return parseToString(name.replaceAll('@', '').replaceAll('https://t.me/', ''));
  }
  return parseToString(name);
};
