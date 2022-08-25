import { IUserGroup } from '@gsbelarus/util-api-types';
import { Dialog, DialogTitle, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, ReactElement, Ref } from 'react';
import styles from './user-group-edit.module.less';

// const useStyles = makeStyles(() => ({
//   dialog: {
//     position: 'absolute',
//     right: 0,
//     margin: 0,
//     height: '100%',
//     maxHeight: '100%',
//     // width: '20vw',
//     minWidth: 330,
//     maxWidth: '100%',
//     borderTopRightRadius: 0,
//     borderBottomRightRadius: 0
//   },
//   button: {
//     width: '120px',
//   },
// }));

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export interface UserGroupEditProps {
  open: boolean;
  userGroup?: IUserGroup;
  onSubmit: (userGroup: IUserGroup) => void;
  onCancelClick: () => void;
}

export function UserGroupEdit(props: UserGroupEditProps) {
  const { open, userGroup } = props;
  const { onSubmit, onCancelClick } = props;

  return (
    <Dialog
      open={open}
      // className={styles['dialog']}
      classes={{ paper: styles['dialog'] }}
      TransitionComponent={Transition}
    >
      <DialogTitle>
        {userGroup ? `Редактирование: ${userGroup.NAME}` : 'Добавление'}
      </DialogTitle>

    </Dialog>
  );
}

export default UserGroupEdit;
