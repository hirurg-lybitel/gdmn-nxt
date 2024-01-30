import { IIconsNames } from '../social-media-icons';

type ISocialMediaLinks= {
  [key in IIconsNames]: string;
}

export const socialMediaLinks: ISocialMediaLinks = {
  'facebook': 'https://www.facebook.com/',
  'instagram': 'https://vk.com/',
  'telegram': 'https://t.me/',
  'viber': '',
  'linkedin': 'https://www.linkedin.com/in/',
  'skype': '',
  'ok': 'https://ok.ru/profile/',
  'whatsApp': '',
  'github': 'https://github.com/',
  'vk': 'https://vk.com/',
};
