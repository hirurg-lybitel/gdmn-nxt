import { useState, useCallback } from 'react';
import { Box, Tab } from '@mui/material';
import style from './popup.module.less';
import TextField from '@mui/material/TextField';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { fullFaq } from '../../../features/FAQ/faqApi';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import CustomMarkdown from '@gdmn-nxt/components/Styled/custom-markdown/custom-markdown';

interface PopupProps {
  close: () => void;
  open: boolean;
  isAddPopup: boolean;
  faq?: fullFaq,
  addFaq?: (values: fullFaq) => void,
  editFaq?: (values: fullFaq) => void,
}

interface IShippingFields {
  ID: number,
  USR$QUESTION: string,
  USR$ANSWER: string;
}

export default function Popup({ close, open, isAddPopup, faq, addFaq, editFaq }: PopupProps) {
  const [tabIndex, setTabIndex] = useState('1');

  const formik = useFormik<IShippingFields>({
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      ID: faq?.ID || -1,
      USR$QUESTION: faq?.USR$QUESTION || '',
      USR$ANSWER: faq?.USR$ANSWER || ''
    },
    validationSchema: yup.object().shape({
      USR$QUESTION: yup.string().required('Не указан вопрос'),
      USR$ANSWER: yup.string().required('Не указан вопрос'),
    }),
    onSubmit: (values) => {
      close();
      handleClose();
      if (isAddPopup) {
        addFaq && addFaq(formik.values);
        return;
      }
      editFaq && editFaq(formik.values);
    },
    onReset: (values) => {
    }
  });

  const handleClose = useCallback(() => {
    setTabIndex('1');
    close();
    formik.resetForm();
  }, []);

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, [faq]);

  const handleValueChange = async (name: string, value: string) => {
    await formik.setFieldValue(name, value);
    if ((formik.errors as any)[name]) {
      await formik.validateField(name);
    };
  };

  return (
    <EditDialog
      open={open}
      onClose={handleClose}
      confirmation={formik.dirty}
      title={isAddPopup ? 'Добавить новый вопрос с ответом' : 'Изменить вопрос с ответом'}
      form="FAQForm"
    >
      <FormikProvider value={formik}>
        <Form
          style={{ minWidth: 0 }}
          onSubmit={formik.handleSubmit}
          className={style.USR$QUESTIONForm}
          id={'FAQForm'}
        >
          <div className={style.inputContainer}>
            <TextField
              rows={4}
              className={style.textArea}
              id="outlined-textarea"
              placeholder="Вопрос"
              multiline
              value={formik.values.USR$QUESTION}
              onChange={(e) => handleValueChange('USR$QUESTION', e.target.value)}
            />
            {
              formik.errors.USR$QUESTION && <div className={style.errorMessage}>{formik.errors.USR$QUESTION}</div>
            }
          </div>
          <TabContext value={tabIndex}>
            <Box>
              <TabList variant="scrollable" onChange={handleTabsChange}>
                <Tab label="Изменить" value="1" />
                <Tab label="Просмотреть" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1" className={style.tab}>
              <div className={style.inputContainer}>
                <TextField
                  rows={12}
                  className={style.textArea}
                  id="outlined-textarea"
                  placeholder="Ответ"
                  multiline
                  value={formik.values.USR$ANSWER}
                  onChange={(e) => handleValueChange('USR$ANSWER', e.target.value)}
                />
                {
                  formik.errors.USR$ANSWER && <div className={style.errorMessage}>{formik.errors.USR$ANSWER}</div>
                }
              </div>
            </TabPanel>
            <TabPanel value="2" className={style.tab}>
              <div className={style.inputContainer}>
                <div className={style.previewBackground}>
                  <PerfectScrollbar className={style.preview}>
                    <div className={style.previewContent}>
                      <CustomMarkdown className={style.markdown}>
                        {
                          formik.values.USR$ANSWER
                        }
                      </CustomMarkdown>
                    </div>
                  </PerfectScrollbar>
                </div>
                {
                  formik.errors.USR$ANSWER && <div className={style.errorMessage}>{formik.errors.USR$ANSWER}</div>
                }
              </div>
            </TabPanel>
          </TabContext>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}
