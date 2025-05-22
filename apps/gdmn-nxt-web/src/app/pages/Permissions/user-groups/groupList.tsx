import { IUserGroup } from '@gsbelarus/util-api-types';
import { IconButton, List, ListItem, ListItemText, Theme, Typography, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, SetStateAction } from 'react';
import EditIcon from '@mui/icons-material/Edit';

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    borderRadius: 0,
    '&:hover': {
      color: theme.palette.text.primary,
      '& .caption': {
        color: theme.palette.text.primary,
      }
    },
    '& .actions': {
      position: 'absolute',
      right: 0,
      top: 0
    },
    '&:hover .actions': {
      display: 'inline'
    }
  },
  listItemSelected: {
    backgroundColor: theme.palette.primary.main + '!important',
    color: theme.palette.secondary.main + '!important',
    borderRadius: '4px',
    '& .caption': {
      color: theme.palette.secondary.main + '!important',
    },
    '& .action': {
      color: theme.palette.primary.contrastText
    }
  }
}));

interface IGroupList {
  groups: IUserGroup[];
  setSelectedUserGroup?: Dispatch<SetStateAction<IUserGroup | undefined>>;
  selectedUserGroup: IUserGroup;
  onEdit: (id: IUserGroup) => (e: any) => void;
};

export const GroupList = (props: IGroupList) => {
  const { groups, setSelectedUserGroup, selectedUserGroup, onEdit } = props;

  const classes = useStyles();

  const onClick = (group: IUserGroup) => (e: any) => {
    setSelectedUserGroup && setSelectedUserGroup(group);
  };

  const mobile = useMediaQuery('(pointer: coarse)');

  return <List>
    {groups.map(group =>
      <ListItem
        className={`
          ${classes.listItem}
          ${group.ID === selectedUserGroup?.ID ? classes.listItemSelected : ''}
        `}
        key={group.ID}
        button
        divider
        sx={{
          py: 2,
        }}
        onClick={onClick(group)}
      >
        <ListItemText>
          <Typography variant="body1">{group.NAME}</Typography>
          <Typography variant="caption" className="caption">{group.DESCRIPTION}</Typography>
          <div
            className="actions"
            hidden={!mobile}
          >
            <IconButton size="small" onClick={onEdit(group)}>
              <EditIcon
                className="action"
                fontSize="small"
                color={(mobile && group.ID === selectedUserGroup?.ID) ? 'action' : 'primary'}
              />
            </IconButton>
          </div>
        </ListItemText>
      </ListItem>)}
  </List>;
};
