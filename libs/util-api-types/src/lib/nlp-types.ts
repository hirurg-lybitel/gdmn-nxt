export type Language = 'en' | 'be' | 'ru';

export interface INLPDialogItem {
  id: string;
  who: string;
  language: Language;
  text: string;
  command?: string;
};

export type NLPDialog = INLPDialogItem[];

export function nlpDialogItem(who: string, language: Language, text: string, command?: string): INLPDialogItem {
  return {
    id: crypto.randomUUID(),
    who,
    language,
    text,
    command
  }
};

export interface IMorph {
  [attribute: string]: string;
};

export interface INLPTokenHead {
  id: number;
  ancestors: number[];
  children: number[];
  conjuncts: number[];
};

export interface INLPToken {
  id: number;
  token: string;
  lemma: string;
  pos: string;
  tag: string;
  shape: string;
  is_alpha: boolean;
  is_stop: boolean;
  dep: string;
  head?: INLPTokenHead;
  morph: IMorph;
};

export interface INLPSentence {
  detectedLanguage: {
    language: string;
    score: number;
  };
  text: string;
  tokens: INLPToken[];
};

export interface INLPResult {
  version: '1.0';
  engine: string;
  models: string[];
  text: string;
  sents: INLPSentence[];
};

export interface INLPQuery {
  version: '1.0';
  session: string;
  language?: Language;
  text: string;
};
