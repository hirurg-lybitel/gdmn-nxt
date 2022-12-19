import { createSlice } from '@reduxjs/toolkit';

export interface FaqState {
  faqs: any[]
};

export interface Faq {
    faqs: any[]
  };
const initialState: FaqState = {
  faqs: [
    {
      question: 'вопрос 1',
      answer: 'Ответ на вопрос 1',
      num: 1
    },
    {
      question: 'вопрос 2',
      answer: 'Ответ на вопрос 2',
      num: 2
    },
    {
      question: 'вопрос 3',
      answer: 'Ответ на вопрос 3',
      num: 3
    },
    {
      question: 'вопрос 4',
      answer: 'Ответ на вопрос 4',
      num: 4,
    },
    {
      question: 'вопрос 5',
      answer: 'Ответ на вопрос 5',
      num: 5
    },
    {
      question: 'вопрос 6',
      answer: 'Ответ на вопрос 6',
      num: 6
    },
    {
      question: 'вопрос 7',
      answer: 'Ответ на вопрос 7',
      num: 7
    },
    {
      question: 'вопрос 8',
      answer: 'Ответ на вопрос 8',
      num: 8
    },
    {
      question: 'вопрос 9',
      answer: 'Ответ на вопрос 9',
      num: 9
    },
    {
      question: 'вопрос 10',
      answer: 'Ответ на вопрос 10',
      num: 10
    },
    {
      question: 'вопрос 11',
      answer: 'Ответ на вопрос 11',
      num: 11
    }
  ]
};


export const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    addNewFaq: (state, action) => {
      console.log('asd');
      const faq = action.payload;
      faq.num = state.faqs.length + 1;
      state.faqs.push(faq);
    }
  },
});

export const {
  addNewFaq
} = faqSlice.actions;

export default faqSlice.reducer;