import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import Confirmation from '../helpers/confirmation';

export interface ItemButtonDeleteProps extends IconButtonProps {
  button?: boolean;
  label?: string;
  confirmation?: boolean;
  onClick?: () => void;
  title?: string;
  text?: string;
}

export function ItemButtonDelete({
  button = false,
  label = '',
  confirmation = true,
  onClick = () => {},
  title = 'Удаление',
  text = 'Вы уверены, что хотите продолжить?',
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

  // return (
  //   <Container size="small">
  //     <Tooltip title="Удалить" arrow>
  //       <Stack
  //         direction="row"
  //         alignItems="center"
  //         spacing={1}
  //       >
  //         <DeleteForeverIcon fontSize="small" />
  //         {label && <span>{label}</span>}
  //       </Stack>
  //     </Tooltip>
  //   </Container>
  // );


  const RootElement = (
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

  return (
    confirmation
      ? <Confirmation
        title={title}
        text={text}
        dangerous
        onConfirm={onClick}
      >
        {RootElement}
      </Confirmation>
      : <>{RootElement}</>
  );
}

export default ItemButtonDelete;
