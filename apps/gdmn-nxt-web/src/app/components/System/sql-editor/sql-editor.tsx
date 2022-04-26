import { Box, Button, Stack, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CustomizedCard from '../../customized-card/customized-card';
import styles from './sql-editor.module.less';

/* eslint-disable-next-line */
export interface SqlEditorProps {}

export function SqlEditor(props: SqlEditorProps) {
  return (
    // <div className={styles['container']}>
    //   <h1>Welcome to SqlEditor!</h1>
    // </div>
    <Stack
      p={1}
      spacing={3}
      height="100%"
      display="flex"
    >
      <TextField
        multiline
        rows={4}
        placeholder="Input sql code here"
        variant="outlined"
      />
      <Box>
        <Button variant="contained" endIcon={<SendIcon />}>
          Run
        </Button>
      </Box>
      <CustomizedCard
        borders
        style={{
          flex: 1,
          borderColor: '#bdbdbd'
        }}
      >
        <Box>result</Box>
      </CustomizedCard>

    </Stack>
  );
}

export default SqlEditor;
