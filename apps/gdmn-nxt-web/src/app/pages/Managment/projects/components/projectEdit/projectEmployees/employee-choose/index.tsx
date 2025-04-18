import ChecklistIcon from '@mui/icons-material/Checklist';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Button, CardActions, CardContent, ClickAwayListener, Fade, IconButton, Popper, Tooltip } from '@mui/material';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { IContactWithID } from '@gsbelarus/util-api-types';
import { EmployeesSelect } from '@gdmn-nxt/components/selectors/employees-select/employees-select';

interface Props {
  value: IContactWithID[];
  disabled?: boolean;
  onSubmit: (employees: IContactWithID[]) => void;
  label?: string,
  placeholder?: string
}

export default function EmployeesChoose({
  value,
  disabled,
  onSubmit,
  label,
  placeholder
}: Props) {
  const [employees, setEmployees] = useState<IContactWithID[]>(value);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setEmployees(value);
  }, [anchorEl]);

  const handleEmployeesSelect = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  }, [anchorEl]);

  const handleOnClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEmployeesChange = useCallback((values: IContactWithID[] | IContactWithID | null) => {
    if (!values) return;
    setEmployees(values as IContactWithID[]);
  }, []);

  const handleOnSubmit = useCallback(() => {
    handleOnClose();
    onSubmit(employees);
  }, [employees, handleOnClose, onSubmit]);

  return (
    <div>
      <IconButton
        size="small"
        disabled={disabled}
        onClick={handleEmployeesSelect}
      >
        <Tooltip arrow title="Выбрать контакты">
          <ChecklistIcon
            color={disabled ? 'disabled' : 'primary'}
          />
        </Tooltip>
      </IconButton>
      <Popper
        open={!!anchorEl}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{
          zIndex: 1300,
          width: '600px',
          maxWidth: 'calc(100% - 50px)'
        }}
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleOnClose}>
            <Fade {...TransitionProps} timeout={250}>
              <CustomizedCard borders boxShadows>
                <CardContent style={{ padding: '8px' }}>
                  <EmployeesSelect
                    label={label}
                    placeholder={placeholder}
                    multiple
                    value={employees}
                    onChange={handleEmployeesChange}
                  />
                </CardContent>
                <CardActions style={{ justifyContent: 'right' }}>
                  <Button
                    onClick={handleOnClose}
                    variant="outlined"
                    color="primary"
                  >
                    Отменить
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleOnSubmit}
                  >
                    Подтвердить
                  </Button>
                </CardActions>
              </CustomizedCard>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
};
