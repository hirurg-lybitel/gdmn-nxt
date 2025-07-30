import { TabContext, TabList } from '@mui/lab';
import { Box, Tab, TextField, TextFieldProps } from '@mui/material';
import { CSSProperties, useState } from 'react';
import ReactMarkdown from 'react-markdown';

type IMarkdownTextfieldProps = TextFieldProps & {
  containerStyle?: CSSProperties;
  fullHeight?: boolean;
};

export default function MarkdownTextfield({ containerStyle, fullHeight, ...props }: IMarkdownTextfieldProps) {
  const [tab, setTab] = useState('1');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: fullHeight ? '100%' : undefined, ...containerStyle }}>
      <TabContext value={tab}>
        <TabList
          style={{ paddingLeft: '8px' }}
          onChange={(e, value) => setTab(value)}
        >
          <Tab
            label="Изменение"
            value="1"
          />
          <Tab
            label="Просмотр"
            value="2"
          />
        </TabList>
      </TabContext>
      <div style={{ width: '100%', position: 'relative', flex: fullHeight ? 1 : undefined }}>
        <TextField
          {...props}
          sx={{
            opacity: tab === '2' ? 0 : 1,
            visibility: tab === '2' ? 'hidden' : 'visible',
            height: fullHeight ? '100%' : undefined,
            '& .MuiInputBase-root': {
              height: fullHeight ? '100%' : undefined
            },
            '& .MuiInputBase-input': {
              height: fullHeight ? '100% !important' : undefined
            },
            ...props.sx
          }}
          multiline
          fullWidth
        />
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)', position: 'absolute',
            inset: 0, opacity: tab === '2' ? '1' : '0',
            visibility: tab === '2' ? 'visible' : 'hidden',
            padding: '8.5px 14px', lineHeight: 1.3,
            borderRadius: 'var(--border-radius)', border: '1px solid var(--color-borders)'
          }}
        >
          <ReactMarkdown>
            {props.value?.toString() ?? ''}
          </ReactMarkdown>
        </Box>
      </div>
    </div>
  );
}
