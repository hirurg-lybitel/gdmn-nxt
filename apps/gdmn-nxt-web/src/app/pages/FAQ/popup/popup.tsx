import { useState, useEffect, useCallback, useMemo } from 'react';
import { CardHeader, Typography, Button, Divider, CardContent, Box, Tab, IconButton, Card, CardActions } from '@mui/material';
import style from './popup.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { fullFaq } from '../../../features/FAQ/faqApi';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';

interface PopupProps {
  close: () => void
  isOpened: boolean
  isAddPopup: boolean
  faq?: fullFaq,
  addFaq?: (values: fullFaq) => void,
  editFaq?: (values: fullFaq) => void,
}

interface IShippingFields {
  ID: number,
  USR$QUESTION: string,
  USR$ANSWER: string
}

export default function Popup({ close, isOpened, isAddPopup, faq, addFaq, editFaq }: PopupProps) {
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
    },
    onReset: (values) => {
    }
  });

  const closePopup = useCallback(() => {
    setConfirmOpen(false);
    setTabIndex('1');
    close();
    formik.resetForm();
  }, []);

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, [faq]);

  const escPressed = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', escPressed);
    return () => {
      document.removeEventListener('keydown', escPressed);
    };
  }, [escPressed]);

  const handleClose = () => {
    if (formik.dirty) {
      setConfirmOpen(true);
      return;
    }
    closePopup();
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={'Внимание'}
      text="Изменения будут утеряны. Продолжить?"
      confirmClick={closePopup}
      cancelClick={handleConfirmCancelClick}
    />
  , [confirmOpen]);

  const handleSubmit = () => {
    handleConfirmCancelClick();
    closePopup();
    if (isAddPopup) {
      addFaq && addFaq(formik.values);
      return;
    }
    editFaq && editFaq(formik.values);
  };

  const onSubmitClick = async () => {
    formik.validateForm();
    const errors = await formik.validateForm(formik.values);
    if (Object.keys(errors).length !== 0) return;
    handleSubmit();
  };

  const handleValueChange = async (name: string, value: string) => {
    await formik.setFieldValue(name, value);
    if ((formik.errors as any)[name]) {
      await formik.validateField(name);
    };
  };

  return (
    <>
      {memoConfirmDialog}
      <div
        className={isOpened ? style.background : `${style.background} ${style.unactiveBackground}`}
        onClick={handleClose}
      />
      <div className={style.newQuestionBody}>
        <div
          className={
            isOpened
              ? style.NewQuestionContainer
              : `${style.NewQuestionContainer} ${style.inactiveNewQuestionContainer}`
          }
        >
          <FormikProvider value={formik}>
            <Form
              onSubmit={formik.handleSubmit}
              className={style.USR$QUESTIONForm}
              id={'FAQForm'}
            >
              <Card className={style.card}>
                <CardHeader
                  title={<Typography variant="h6">{
                    isAddPopup ? 'Добавить новый вопрос с ответом' : 'Изменить вопрос с ответом'
                  }</Typography>}
                />
                <Divider/>
                <CardContent style={{ flex: 1 }} >
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
                      formik.errors.USR$QUESTION
                  && <div className={style.errorMessage}>{formik.errors.USR$QUESTION}</div>
                    }
                  </div>
                  <TabContext value={tabIndex}>
                    <Box>
                      <TabList onChange={handleTabsChange}>
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
                          formik.errors.USR$ANSWER
                        && <div className={style.errorMessage}>{formik.errors.USR$ANSWER}</div>
                        }
                      </div>
                    </TabPanel>
                    <TabPanel value="2" className={style.tab}>
                      <div className={style.inputContainer}>
                        <div className={style.previewBackground}>
                          <PerfectScrollbar className={style.preview}>
                            <div className={style.previewContent}>
                              <ReactMarkdown className={style.markdown}>
                                {
                                  formik.values.USR$ANSWER
                                }
                              </ReactMarkdown>
                            </div>
                          </PerfectScrollbar>
                        </div>
                        {
                          formik.errors.USR$ANSWER
                        && <div className={style.errorMessage}>{formik.errors.USR$ANSWER}</div>
                        }
                      </div>
                    </TabPanel>
                  </TabContext>
                </CardContent>
                <Divider/>
                <CardActions className={style.buttonsContainer}>
                  <Box flex={1} />
                  <div>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleClose}
                      className={style.button}
                    >Отменить</Button>
                    <Button
                      type="submit"
                      form={'FAQForm'}
                      variant="contained"
                      onClick={onSubmitClick}
                      className={`${style.saveButton} ${style.button}`}
                    >
                      Сохранить
                    </Button>
                  </div>
                </CardActions>
              </Card>
            </Form>
          </FormikProvider>
        </div>
      </div>
    </>
  );
}
