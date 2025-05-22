import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import Confirmation from '@gdmn-nxt/helpers/confirmation';

export interface ItemButtonDeleteProps extends IconButtonProps {
  button?: boolean;
  label?: string;
  confirmation?: boolean;
  onClick?: () => void;
  title?: string;
  text?: string;
  hint?: string;
  showHintAnyway?: boolean
};

export function ItemButtonDelete({
  button = false,
  label = '',
  confirmation = true,
  onClick = () => {},
  title = 'Удаление',
  text = 'Вы уверены, что хотите продолжить?',
  hint = 'Удалить',
  disabled = false,
  showHintAnyway = false,
  ...rest
}: ItemButtonDeleteProps) {
  const Container = useMemo(() =>
    button
      ? styled(IconButton)(({ theme }) => ({
        color: theme.palette.error.main,
        ...rest,
      }))
      : styled('div')(({ theme }) => ({
        color: theme.palette.error.main,
      }))
  , [button]);

  if (!confirmation) {
    Container.defaultProps = {
      onClick
    };
  }

  const RootElement = (
    <Container
      disabled={disabled}
      style={{ pointerEvents: (!showHintAnyway && disabled) ? 'none' : 'all' }}
      size="small"
      className="StyledDeleteButton"
    >
      <Tooltip title={(label || (!showHintAnyway && disabled)) ? '' : hint} arrow>
        <span>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <DeleteForeverIcon color={disabled ? 'disabled' : undefined} fontSize="small" />
            {label && <span style={disabled ? { color: 'gray' } : {}}>{label}</span>}
          </Stack>
        </span>
      </Tooltip>
    </Container>
  );

  return (
    confirmation && !disabled
      ? <Confirmation
        title={title}
        text={text}
        dangerous
        onConfirm={onClick}
        actions={[
          'Отменить',
          'Удалить'
        ]}
      >
        {RootElement}
      </Confirmation>
      : <>{RootElement}</>
  );
}

export default ItemButtonDelete;
