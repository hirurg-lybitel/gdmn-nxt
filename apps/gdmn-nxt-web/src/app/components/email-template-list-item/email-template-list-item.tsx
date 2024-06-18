import { Box, IconButton, Typography } from '@mui/material';
import ReactHtmlParser from 'react-html-parser';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import styles from './email-template-list-item.module.less';
import { ITemplate } from '@gsbelarus/util-api-types';

interface EmailTemplateListItemProps {
  template: ITemplate,
  onOpen?: (template: ITemplate) => void,
  editable?: boolean
}

const EmailTemplateListItem = (props: EmailTemplateListItemProps) => {
  const {
    template,
    onOpen,
    editable = true
  } = props;

  const [show, setShow] = useState(false);

  const editClick = (template: ITemplate) => () => {
    onOpen && onOpen(template);
  };

  return (
    <div
      onMouseLeave={() => setShow(false)}
      onMouseEnter={() => setShow(true)}
      style={{ height: '100%', overflow: 'hidden', borderRadius: '10px' }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ height: '30px', width: '100%', position: 'relative' }}>
          <Typography style={{ position: 'absolute', left: 0, right: '20px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {template.NAME}
          </Typography>
        </div>
        <Box flex={1}/>
        {editable &&
          <div style={{ position: 'absolute', right: 5, top: 5, visibility: show ? 'visible' : 'hidden' }}>
            <IconButton onClick={editClick(template)} size="small"><EditIcon /></IconButton>
          </div>
        }

      </div>
      <Box
        sx={{
          borderRadius: '10px',
          overflow: 'hidden',
          height: '100%',
          width: '100%',
          background: '#0000000d',
          '& body,html': { height: '100%', pointerEvents: 'none', userSelect: 'none' }
        }}
      >
        {ReactHtmlParser(template.HTML)}
      </Box>
    </div>
  );
};

export default EmailTemplateListItem;
