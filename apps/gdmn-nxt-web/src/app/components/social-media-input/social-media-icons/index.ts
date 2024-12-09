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
  [key in MessengerCode]: {icon: string, domain?: string};
}

export const socialMediaIcons: ISocialMediaIcons = {
  'facebook': {
    icon: facebook,
    domain: 'www.facebook.com'
  },
  'instagram': {
    icon: instagram,
    domain: 'www.instagram.com'
  },
  'telegram': {
    icon: telegram,
    domain: 't.me'
  },
  'viber': {
    icon: viber
  },
  'linkedin': {
    icon: linkedin,
    domain: 'www.linkedin.com'
  },
  'skype': {
    icon: skype,
    domain: 'join.skype.com'
  },
  'ok': {
    icon: ok,
    domain: 'ok.ru'
  },
  'whatsApp': {
    icon: whatsApp
  },
  'github': {
    icon: github,
    domain: 'github.com'
  },
  'vk': {
    icon: vk,
    domain: 'vk.com'
  },
  'discord': {
    icon: discord
  }
};
