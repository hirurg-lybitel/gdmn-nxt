import facebook from './facebook.png';
import instagram from './instagram.png';
import whatsup from './whatsup.png';
import skype from './skype.png';
import telegram from './telegram.png';
import vk from './vk.png';
import linkedin from './linkedin.png';
import ok from './ok.png';
import github from './github.png';
import viber from './viber.png';

interface ISocialMediaIcons {
  [value: string]: {
    name: string,
    icon: string,
    mask?: string
  }
}

export const socialMediaIcons: ISocialMediaIcons = {
  facebook: {
    name: 'facebook',
    icon: facebook,
  },
  instagram: {
    name: 'instagram',
    icon: instagram,
  },
  telegram: {
    name: 'telegram',
    icon: telegram,
    mask: '@'
  },
  viber: {
    name: 'viber',
    icon: viber,
  },
  linkedin: {
    name: 'linkedin',
    icon: linkedin
  },
  skype: {
    name: 'skype',
    icon: skype
  },
  ok: {
    name: 'ok',
    icon: ok
  },
  whatsup: {
    name: 'whatsup',
    icon: whatsup
  },
  github: {
    name: 'github',
    icon: github
  },
  vk: {
    name: 'vk',
    icon: vk
  }
};
