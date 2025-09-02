import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Chip, Divider, Stack, Tab, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import styles from './projectNote.module.less';
import ReactMarkdown from 'react-markdown';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import InfoIcon from '@mui/icons-material/Info';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';

interface IProjectNoteProps {
  message?: string,
  onChange: (note: string) => void,
}

export default function ProjectNote({ message, onChange }: Readonly<IProjectNoteProps>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
      <MarkdownTextfield
        fullWidth
        required
        multiline
        rows={1}
        name="message"
        fullHeight
        smallButtonsBreakpoint="xs"
        onChange={(e) => onChange(e.target.value)}
        value={message ?? ''}
      />
    </div>
  );
}
