import { createSlice } from '@reduxjs/toolkit';

export interface faq {
  question: string,
  answer: string
}

export interface FaqState {
  faqs: faq[]
};

const initialState: FaqState = {
  faqs: [
    {
      question: 'вопрос 1',
      answer: 'Ответ на вопрос 1',
    },
    {
      question: 'вопрос 2',
      answer: 'Ответ на вопрос 2',
    },
    {
      question: 'вопрос 3',
      answer: 'Ответ на вопрос 3',
    },
    {
      question: 'вопрос 4',
      answer: 'Ответ на вопрос 4',
    },
    {
      question: 'вопрос 5',
      answer: 'Ответ на вопрос 5',
    },
    {
      question: 'вопрос 6',
      answer: 'Ответ на вопрос 6',
    },
    {
      question: 'вопрос 7',
      answer: 'Ответ на вопрос 7',
    },
    {
      question: 'вопрос 8',
      answer: 'Ответ на вопрос 8',
    },
    {
      question: 'вопрос 9',
      answer: 'Ответ на вопрос 9',
    },
    {
      question: 'вопрос 10',
      answer: 'Ответ на вопрос 10',
    },
    {
      question: 'вопрос 11',
      answer: 'Ответ на вопрос 11',
    }
  ]
};


export const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    addFaq: (state, action) => {
      state.faqs.push(action.payload);
    },
    editFaq: (state, action) => {
      const faqs = [...state.faqs];
      faqs[action.payload.index] = ({ 'question': action.payload.question, 'answer': action.payload.answer });
      state.faqs = faqs;
    },
    deleteFaq: (state, action) => {
      const faq = [...state.faqs];
      faq.splice(action.payload, 1);
      state.faqs = faq;
    }
  },
});

export const {
  addFaq,
  editFaq,
  deleteFaq
} = faqSlice.actions;

export default faqSlice.reducer;