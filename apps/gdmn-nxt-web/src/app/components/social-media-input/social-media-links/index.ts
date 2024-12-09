import { MessengerCode } from '@gsbelarus/util-api-types';

type ISocialMediaLinks= {
  [key in MessengerCode]: string;
}

export const socialMediaLinks: ISocialMediaLinks = {
  'facebook': 'https://www.facebook.com/',
  'instagram': 'https://www.instagram.com/',
  'telegram': 'https://t.me/',
  'viber': '',
  'linkedin': 'https://www.linkedin.com/in/',
  'skype': 'https://join.skype.com/invite/',
  'ok': 'https://ok.ru/profile/',
  'whatsApp': '',
  'github': 'https://github.com/',
  'vk': 'https://vk.com/',
  'discord': ''
};
