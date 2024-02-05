import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { styled } from '@mui/material/styles';

export interface ItemButtonDeleteProps extends IconButtonProps {
  button?: boolean;
  label?: string;
}

export function ItemButtonDelete({
  button = false,
  label = '',
  onClick = () => {},
  ...rest
}: ItemButtonDeleteProps) {
  const Container =
    button
      ? styled(IconButton)(({ theme }) => ({
        color: theme.palette.error.main,
        ...rest,
      }))
      : styled('div')(({ theme }) => ({
        color: theme.palette.error.main,
      }));

  Container.defaultProps = {
    onClick
  };

  return (
    <Container size="small">
      <Tooltip title="Удалить" arrow>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <DeleteForeverIcon fontSize="small" />
          {label && <span>{label}</span>}
        </Stack>
      </Tooltip>
    </Container>
  );
}

export default ItemButtonDelete;
