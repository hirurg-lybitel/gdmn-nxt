import { Language, NLPDialog, nlpDialogItem } from "@gsbelarus/util-api-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const getLangMessage = (currLang: Language) => currLang === 'en'
  ? 'Current language set to english. Change it with /lang:ru or /lang:be commands.'
  : currLang === 'ru'
  ? 'Установлен текущий язык: русский. Изменить язык можно командами: /lang:en или /lang:be'
  : 'Бягучая мова: беларуская. Змяніць мову магчыма камандамі: /lang:en альбо /lang:ru';

export interface NLPState {
  currLang: Language;
  nlpDialog: NLPDialog;
};

const initialState: NLPState = {
  currLang: 'en',
  nlpDialog: [nlpDialogItem('it', 'en', getLangMessage('en'))]
};

export const nlpSlice = createSlice({
  name: 'nlp',
  initialState,
  reducers: {
    push: (state, action: PayloadAction<{ who: string; text: string }>) => {
      const { who, text } = action.payload;
      const t = text.trim();
      const cmd = t.slice(0, 8).toLowerCase();

      const newLang: Language = cmd === '/lang:ru'
        ? 'ru'
        : cmd === '/lang:en'
        ? 'en'
        : cmd === '/lang:be'
        ? 'be'
        : state.currLang;

      if (newLang !== state.currLang) {
        return {
          ...state,
          currLang: newLang,
          nlpDialog: [
            ...state.nlpDialog,
            nlpDialogItem(who, newLang, t, '/lang'),
            nlpDialogItem('it', newLang, getLangMessage(newLang))
          ]
        }
      } else {
        return {
          ...state,
          nlpDialog: [
            ...state.nlpDialog,
            nlpDialogItem(who, newLang, t)
          ]
        }
      }
    },
    setNLPDialog: (state, action: PayloadAction<NLPDialog>) => ({
      ...state,
      nlpDialog:
      action.payload
    })
  }
});

// Action creators are generated for each case reducer function
export const { setNLPDialog, push } = nlpSlice.actions;

export default nlpSlice.reducer;
