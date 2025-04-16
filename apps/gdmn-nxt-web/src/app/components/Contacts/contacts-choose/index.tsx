import ChecklistIcon from '@mui/icons-material/Checklist';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Button, CardActions, CardContent, ClickAwayListener, Fade, IconButton, Popper, Tooltip } from '@mui/material';
import { ContactSelect } from '../../selectors/contact-select';
import { MouseEvent, useEffect, useState } from 'react';
import { IContactPerson } from '@gsbelarus/util-api-types';

interface Props {
  value: IContactPerson[];
  disabled?: boolean;
  onSubmit: (contacts: IContactPerson[]) => void;
}

export default function ContactsChoose({
  value,
  disabled,
  onSubmit
}: Props) {
  const [contacts, setContacts] = useState<IContactPerson[]>(value);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setContacts(value);
  }, [anchorEl]);

  const handleContactsSelect = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleOnClose = () => {
    setAnchorEl(null);
  };

  const handleContactsChange = (values: IContactPerson[] | IContactPerson | null) => {
    if (!values) return;
    setContacts(values as IContactPerson[]);
  };

  const handleOnSubmit = () => {
    handleOnClose();
    onSubmit(contacts);
  };

  return (
    <div>
      <IconButton
        size="small"
        disabled={disabled}
        onClick={handleContactsSelect}
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
          maxWidth: 'calc(100% - 40px)'
        }}
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleOnClose}>
            <Fade {...TransitionProps} timeout={250}>
              <CustomizedCard borders boxShadows>
                <CardContent style={{ padding: '8px' }}>
                  <ContactSelect
                    multiple
                    value={contacts}
                    onChange={handleContactsChange}
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
