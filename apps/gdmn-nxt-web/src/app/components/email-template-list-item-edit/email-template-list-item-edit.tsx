import { Box, Button, DialogActions, DialogContent, DialogTitle, TextField, Tooltip } from '@mui/material';
import styles from './email-template-list-item-edit.module.less';
import EmailTemplate, { ITemplateEdit } from '@gdmn-nxt/components/email-template/email-template';
import { useEffect, useMemo, useState } from 'react';
import { htmlToTemplateObject, objectToHtml } from '@gdmn-nxt/components/email-template/html-to-object';
import EditableTypography from '@gdmn-nxt/components/editable-typography/editable-typography';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';
import { ITemplate } from '@gsbelarus/util-api-types';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import EditDialog from '../edit-dialog/edit-dialog';

interface EmailTemplateListItemEditProps {
  template?: ITemplate,
  open: boolean,
  onClose: () => void,
  onSumbit: (template?: ITemplate, isDelete?: boolean) => void
}

const EmailTemplateListItemEdit = (props: EmailTemplateListItemEditProps) => {
  const { template: templateOld, open, onClose, onSumbit } = props;

  const [template, setTemplate] = useState<string>();
  const [templateName, setTemplateName] = useState('');
  const [error, setError] = useState<string | undefined>();
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

  const handleClose = () => {
    setError(undefined);
    setConfirmOpen(false);
    onClose();
  };

  const handleCancel = () => {
    if ((!templateOld
      && (template === objectToHtml(htmlToTemplateObject('')) || !template)
      && templateName === ''
    )) {
      handleClose();
      return;
    }
    if (templateOld?.HTML === template && templateOld?.NAME === templateName) {
      handleClose();
      return;
    }
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!templateOld) {
      setTemplate(undefined);
      setTemplateName('');
      return;
    }
    if (firstRender) setFirstRender(false);
    setTemplate(templateOld?.HTML);
    setTemplateName(templateOld?.NAME);
  }, [templateOld, firstRender, open]);

  const clear = () => {
    setTemplate(undefined);
    setTemplateName('');
  };

  const handeSubmit = (isDelete: boolean) => {
    handleClose();
    if (isDelete) {
      onSumbit(templateOld, true);
      !templateOld && clear();
      return;
    }
    onSumbit({
      ID: templateOld?.ID || -1,
      NAME: templateName,
      HTML: template || ''
    });
    !templateOld && clear();
  };

  const handleConfirmCancelClick = () => {
    setConfirmOpen(false);
  };

  const handleSubmitClick = () => {
    if (!checkValidName(templateName)) {
      return;
    }
    handeSubmit(false);
  };

  const handleTemplateNameChange = (e: any) => {
    const value = e.target.value.replace(/\s+/g, ' ');
    error && checkValidName(value);
    setTemplateName(value);
  };

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={'Внимание'}
      text="Изменения будут утеряны. Продолжить?"
      confirmClick={handleClose}
      cancelClick={handleConfirmCancelClick}
    />,
  [confirmOpen]);

  return (
    <>
      <EditDialog
        open={open}
        onClose={handleCancel}
        title={!templateOld ? 'Создание шаблона' : 'Редактирование шаблона: ' + templateOld.NAME}
        fullwidth
        onSubmitClick={handleSubmitClick}

        onDeleteClick={() => handeSubmit(true)}
        deleteButton={!!templateOld}
      >
        <div style={{ minWidth: 0 }}>
          <ErrorTooltip
            open={!!error}
            title={error}
          >
            <TextField
              fullWidth
              label="Наименование"
              style={{ marginBottom: '20px' }}
              value={templateName}
              onChange={handleTemplateNameChange}
            />
          </ErrorTooltip>
          <div style={{ height: 'calc(100% - 60px)', minHeight: '600px' }}>
            <EmailTemplate
              value={template}
              onChange={setTemplate}
            />
          </div>
        </div>
      </EditDialog>
      {memoConfirmDialog}
    </>
  );
};

export default EmailTemplateListItemEdit;
