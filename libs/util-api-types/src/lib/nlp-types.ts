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
  pos_explain: string;
  tag: string;
  shape: string;
  is_alpha: boolean;
  is_digit: boolean;
  is_currency: boolean;
  is_bracket: boolean;
  is_stop: boolean;
  dep: string;
  dep_explain: string;
  head?: INLPTokenHead;
  morph: IMorph;
  start: number;
  ent_type?: string;
  entities?: {
    entity: string;
    lName: string;
    score: number;
  }[]
};

export interface INLPEnt {
  ent: string;
  lemma: string;
  label: string;
  start_char: number;
  end_char: number;
};

export type IntentLabel = 'show' | 'insert' | 'update' | 'delete';

export interface IIntent {
  label: IntentLabel;
  score: number;
};

export interface INLPSentence {
  detectedLanguage: {
    language: string;
    score: number;
  };
  text: string;
  tokens: INLPToken[];
  intent: IIntent[];
};

export interface INLPResult {
  version: '1.0';
  engine: string;
  models: string[];
  text: string;
  sents: INLPSentence[];
  ents: INLPEnt[];
};

export interface INLPQuery {
  version: '1.0';
  session: string;
  fullDbName: string;
  language?: Language;
  text: string;
};
