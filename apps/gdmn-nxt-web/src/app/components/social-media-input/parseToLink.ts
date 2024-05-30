import { MessengerCode } from '@gsbelarus/util-api-types';
import { socialMediaLinks } from './social-media-links';

export const parseToMessengerLink = (code: MessengerCode, name: string) => {
  const parseToString = (messengerName: string) => {
    return `${socialMediaLinks[code]}${messengerName}`;
  };
  if (code === 'telegram') {
    return parseToString(name.replaceAll('@', ''));
  }
  return parseToString(name);
};
