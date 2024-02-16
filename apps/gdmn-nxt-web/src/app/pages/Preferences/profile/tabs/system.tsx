import { ContractType } from '@gsbelarus/util-api-types';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { useState } from 'react';

export default function SystemTab() {
  const [contractType, setContractType] = useState<number>(ContractType.GS);

  const handleChange = (event: SelectChangeEvent) => {
    setContractType(Number(event.target.value));
  };
  return (
    <>
      <FormControl size="small" style={{ width: 200 }}>
        <InputLabel id="select-label">Тип договоров</InputLabel>
        <Select
          labelId="select-label"
          value={contractType.toString()}
          label="Тип договоров"
          onChange={handleChange}
        >
          {Object
            .keys(ContractType)
            .filter(key => !isNaN(Number(key)))
            .map(key => (
              <MenuItem key={key} value={key}>{ContractType[Number(key)]}</MenuItem>
            ))}
        </Select>
      </FormControl>
    </>
  );
}
