import facebook from './facebook.png';
import instagram from './instagram.png';
import whatsApp from './whatsApp.png';
import skype from './skype.png';
import telegram from './telegram.png';
import vk from './vk.png';
import linkedin from './linkedin.png';
import ok from './ok.png';
import github from './github.png';
import viber from './viber.png';

export type IIconsNames =
  'facebook'
  | 'instagram'
  | 'telegram'
  | 'viber'
  | 'linkedin'
  | 'skype'
  | 'ok'
  | 'whatsApp'
  | 'github'
  | 'vk';

type ISocialMediaIcons = {
  [key in IIconsNames]: string;
}

export const socialMediaIcons: ISocialMediaIcons = {
  'facebook': facebook,
  'instagram': instagram,
  'telegram': telegram,
  'viber': viber,
  'linkedin': linkedin,
  'skype': skype,
  'ok': ok,
  'whatsApp': whatsApp,
  'github': github,
  'vk': vk
};
