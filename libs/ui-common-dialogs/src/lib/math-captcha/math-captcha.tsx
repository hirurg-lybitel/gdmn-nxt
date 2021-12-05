import Chip from '@mui/material/Chip/Chip';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { useState, useEffect } from 'react';
import './math-captcha.module.less';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export interface MathCaptchaProps {
  disabled?: boolean;
  onEnter: (passed: boolean) => void;
};

const operations = {
  '+': (a: number, b: number) => a + b,
  '-': (a: number, b: number) => a - b,
  '*': (a: number, b: number) => a * b,
  '/': (a: number, b: number) => a / b
};

type Operation = keyof typeof operations;

interface IState {
  a?: number;
  b?: number;
  value?: number;
  op?: Operation;
  passed?: boolean;
};

export function MathCaptcha({ disabled, onEnter }: MathCaptchaProps) {
  const [{ a, b, value, op, passed }, setData] = useState<IState>({});

  const init = () => {
    const bigN1 = Math.floor(Math.random() * 98) + 2;
    const bigN2 = Math.floor(Math.random() * 98) + 2;
    const smallN1 = Math.floor(Math.random() * 8) + 2;
    const smallN2 = Math.floor(Math.random() * 8) + 2;

    switch (Math.floor(Math.random() * 4)) {
      case 0: {
        const a = bigN1;
        const b = bigN2;
        setData({ a, b, op: '+' });
        break;
      }

      case 1: {
        const a = Math.max(bigN1, bigN2);
        const b = Math.min(bigN1, bigN2);
        setData({ a, b, op: '-' });
        break;
      }

      case 2: {
        const a = smallN1;
        const b = smallN2;
        setData({ a, b, op: '*' });
        break;
      }

      case 3:
        const a = smallN1 * smallN2;
        const b = smallN2;
        setData({ a, b, op: '/' });
        break;
    }
  };

  useEffect(init, []);

  useEffect( () => {
    if (op && typeof a === 'number' && typeof b === 'number') {
      const newPassed = value === operations[op](a, b);

      if (newPassed !== !!passed) {
        setData( data => ({ ...data, passed: newPassed }) );
        onEnter(newPassed);
      }
    }
  }, [value]);

  return (
    <Stack direction="column" spacing={2}>
      <Typography>
        To be sure, that you are human, please, calculate and enter the right answer:
      </Typography>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Chip label={a} variant="outlined" />
        <Chip label={op} variant="outlined" />
        <Chip label={b} variant="outlined" />
        <Chip label="=" variant="outlined" />
        <TextField
          label="Answer"
          value={value}
          disabled={disabled}
          error={typeof value === 'number' && !passed}
          type="number"
          onChange={ event => {
            const s = event.target.value.trim();
            const v = Number(s);
            setData( data => ({ ...data, value: Number.isNaN(v) ? undefined : v }) );
          } }
        />
        <Chip label={<AutorenewIcon />} variant="outlined" onClick={ disabled ? undefined : () => { init(); onEnter(false); } } />
      </Stack>
    </Stack>
  );
}

export default MathCaptcha;
