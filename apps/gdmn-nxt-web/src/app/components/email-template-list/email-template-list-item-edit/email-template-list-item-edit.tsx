import { Box, Button, DialogActions, DialogContent, DialogTitle, TextField, Tooltip } from '@mui/material';
import styles from './email-template-list-item-edit.module.less';
import EmailTemplate, { ITemplateEdit } from '@gdmn-nxt/components/email-template/email-template';
import { useEffect, useMemo, useState } from 'react';
import { htmlToTemplateObject } from '@gdmn-nxt/components/email-template/html-to-object';
import EditableTypography from '@gdmn-nxt/components/editable-typography/editable-typography';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { ITemplate } from '../../../features/template/templateApi';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';

interface EmailTemplateListItemEditProps {
  template?: ITemplate,
  open: boolean,
  onClose: () => void,
  onSumbit: (template?: ITemplate, isDelete?: boolean) => void
}

const EmailTemplateListItemEdit = (props: EmailTemplateListItemEditProps) => {
  const { template: templateOld, open, onClose, onSumbit } = props;

  const [template, setTemplate] = useState<ITemplateEdit | undefined>();
  const [templateName, setTemplateName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isDelete, setIsDelete] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const checkValidName = (str: string) => {
    if (str.trim().length < 1) {
      setError('Обязательное поле');
      return false;
    }
    if (str.length > 50) {
      setError('Слишком длинное наименование');
      return false;
    }
    setError(undefined);
    return true;
  };

  useEffect(() => {
    if (!templateOld) {
      setTemplate(undefined);
      setTemplateName('');
      return;
    }
    if (firstRender) setFirstRender(false);
    setTemplate({ content: htmlToTemplateObject(templateOld?.USR$HTML), html: '' });
    setTemplateName(templateOld?.USR$NAME);
  }, [templateOld, firstRender]);

  const clear = () => {
    setTemplate(undefined);
    setTemplateName('');
  };

  const handleConfirmOkClick = () => {
    setConfirmOpen(false);
    onClose();
    if (isDelete) {
      onSumbit(templateOld, true);
      !templateOld && clear();
      return;
    }
    onSumbit({
      ID: templateOld?.ID || -1,
      USR$NAME: templateName,
      USR$HTML: template?.html || ''
    });
    !templateOld && clear();
  };

  const handleConfirmCancelClick = () => {
    setIsDelete(false);
    setConfirmOpen(false);
    onSumbit(templateOld, true);
  };

  const handleSubmit = () => {
    if (!checkValidName(templateName)) {
      return;
    }
    setConfirmOpen(true);
    setIsDelete(false);
  };

  const handlDelete = () => {
    setConfirmOpen(true);
    setIsDelete(true);
  };

  const handleTemplateNameChange = (e: any) => {
    const value = e.target.value.replace(/\s+/g, ' ');
    checkValidName(value);
    setTemplateName(value);
  };

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      dangerous={isDelete}
      title={isDelete ? 'Удаление шаблона' : 'Сохранение шаблона'}
      text="Вы уверены, что хотите продолжить?"
      confirmClick={handleConfirmOkClick}
      cancelClick={handleConfirmCancelClick}
    />,
  [confirmOpen, isDelete]);

  return (
    <>
      <CustomizedDialog
        open={open}
        onClose={onClose}
        disableEscape
        width="calc(100% - var(--menu-width))"
      >
        <DialogTitle style={{ display: 'flex' }}>
        Редактирование:
          <div style={{ width: '20px' }} />
          {templateName}
        </DialogTitle>
        <DialogContent dividers>
          <ErrorTooltip
            open={!!error}
            title={error}
          >
            <TextField
              fullWidth
              style={{ marginBottom: '20px' }}
              value={templateName}
              onChange={handleTemplateNameChange}
            />
          </ErrorTooltip>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <EmailTemplate
              value={template}
              onChange={(value) => {
                setTemplate(value);
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <ItemButtonDelete button onClick={handlDelete} />
          <Box flex={1}/>
          <Button
            style={{ width: '120px' }}
            onClick={onClose}
            variant="outlined"
            color="primary"
          >
             Отменить
          </Button>
          <Button
            style={{ width: '120px' }}
            variant="contained"
            onClick={handleSubmit}
          >
          Сохранить
          </Button>
        </DialogActions>
      </CustomizedDialog>
      {memoConfirmDialog}
    </>
  );
};

export default EmailTemplateListItemEdit;
