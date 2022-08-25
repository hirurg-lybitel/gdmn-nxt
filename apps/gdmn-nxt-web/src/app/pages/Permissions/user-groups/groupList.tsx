import { IUserGroup } from '@gsbelarus/util-api-types';
import { List, ListItem, ListItemText, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, SetStateAction } from 'react';

interface StyleProps {
  selected: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    borderRadius: '4px',
    // backgroundColor: theme.palette.primary.main,
    // color: theme.palette.secondary.main,
    // transition: theme.transitions.create(['transform', 'color'], {
    //   duration: theme.transitions.duration.shortest,
    //   easing: theme.transitions.easing.easeInOut,
    // }),
    '&:hover': {
      backgroundColor: theme.color.grey[300],
      color: 'initial',
    }
  },
  listItemSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.main,
  }
}));

interface IGroupList {
  groups: IUserGroup[];
  setSelectedUserGroup?: Dispatch<SetStateAction<number>>;
  selectedUserGroup: number;
};

export const GroupList = (props: IGroupList) => {
  const { groups, setSelectedUserGroup, selectedUserGroup } = props;

  const classes = useStyles();

  const onClick = (id:number) => (e: any) => {
    setSelectedUserGroup && setSelectedUserGroup(id);
  };

  return <List>
    {groups.map(group =>
      <ListItem
        className={`
          ${classes.listItem}
          ${group.ID === selectedUserGroup ? classes.listItemSelected : ''}
        `}
        key={group.ID}
        button
        divider
        sx={{
          py: 2,
        }}
        onClick={onClick(group.ID)}
      >
        <ListItemText>
          <Typography variant="body1">{group.NAME}</Typography>
          <Typography variant="caption" style={{ color: 'inherit' }}>{group.DESCRIPTION}</Typography>
        </ListItemText>

      </ListItem>)}
  </List>;
};
