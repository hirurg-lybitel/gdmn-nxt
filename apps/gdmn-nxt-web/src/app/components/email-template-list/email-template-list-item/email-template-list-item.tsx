import { Box, IconButton, Skeleton, Typography } from '@mui/material';
import ReactHtmlParser from 'react-html-parser';
import { useEffect, useRef, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import styles from './email-template-list-item.module.less';
import { ITemplate } from '../../../features/template/templateApi';

interface EmailTemplateListItemProps {
  template: ITemplate,
  onOpen: (template: ITemplate) => void,
  templates: ITemplate[]
}

const EmailTemplateListItem = (props: EmailTemplateListItemProps) => {
  const { template, onOpen, templates } = props;
  const ref = useRef(null);
  const [scale, setScale] = useState<number | undefined>();

  const resize = () => {
    const height = (ref.current as any)?.children[0]?.children[1]?.children[0]?.offsetHeight;
    console.log(height);
    if (height <= 360) {
      setScale(1);
      return;
    }
    setScale(360 / height);
  };

  useEffect(() => {
    resize();
  }, [templates]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const [show, setShow] = useState(false);

  return (
    <div
      onMouseLeave={() => setShow(false)}
      onMouseEnter={() => setShow(true)}
      style={{ height: '100%', overflow: 'hidden', }}
    >
      {!scale &&
        <Skeleton
          variant="rectangular"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            height: '100%',
            borderRadius: '15px',
          }}
        />
      }
      <div style={{ visibility: !scale ? 'hidden' : 'visible' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ height: '30px', width: '100%', position: 'relative' }}>
            <Typography style={{ position: 'absolute', left: 0, right: '20px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {template.USR$NAME}
            </Typography>
          </div>
          <Box flex={1}/>
          <div style={{ position: 'absolute', right: 0, top: 0, visibility: show ? 'visible' : 'hidden' }}>
            <IconButton onClick={() => onOpen(template)} size="small"><EditIcon /></IconButton>
          </div>
        </div>
        <Box
          sx={{
            position: 'relative',
            '& body': { height: scale && scale === 1 ? '360px !important' : '100%' }
          }}
        >
          <div style={{ width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div ref={ref} style={{ transform: `scale(${scale || 1})`, transformOrigin: ' center top' }}>
              {ReactHtmlParser(template.USR$HTML)}
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default EmailTemplateListItem;
