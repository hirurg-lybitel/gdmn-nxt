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
import discord from './discord.png';
import { MessengerCode } from '@gsbelarus/util-api-types';

type ISocialMediaIcons = {
  [key in MessengerCode]: {icon: string, domain?: string, link?: string};
}

export const socialMediaIcons: ISocialMediaIcons = {
  'facebook': {
    icon: facebook,
    domain: 'www.facebook.com',
    link: 'https://www.facebook.com/'
  },
  'instagram': {
    icon: instagram,
    domain: 'www.instagram.com',
    link: 'https://www.instagram.com/'
  },
  'telegram': {
    icon: telegram,
    domain: 't.me',
    link: 'https://t.me/'
  },
  'viber': {
    icon: viber
  },
  'linkedin': {
    icon: linkedin,
    domain: 'www.linkedin.com',
    link: 'https://www.linkedin.com/in/'
  },
  'skype': {
    icon: skype,
    domain: 'join.skype.com',
    link: 'https://join.skype.com/invite/'
  },
  'ok': {
    icon: ok,
    domain: 'ok.ru',
    link: 'https://ok.ru/profile/'
  },
  'whatsApp': {
    icon: whatsApp
  },
  'github': {
    icon: github,
    domain: 'github.com',
    link: 'https://github.com/'
  },
  'vk': {
    icon: vk,
    domain: 'vk.com',
    link: 'https://vk.com/'
  },
  'discord': {
    icon: discord
  }
};
