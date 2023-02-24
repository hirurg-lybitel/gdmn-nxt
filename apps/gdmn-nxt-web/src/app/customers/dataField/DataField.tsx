import { Chip, Box, Stack } from '@mui/material';
import style from './datafield.module.less';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { ColorMode } from '@gsbelarus/util-api-types';

interface DataFieldProps {
    name: string;
    masName: string;
    data: any;
    deleteField: any;
}

const useStyles = makeStyles((theme: Theme) => {
  const border = `1px solid rgba(189, 200, 240, ${theme.palette.mode === ColorMode.Dark ? '0.2' : '0.5'})`;
  return {
    mainContainer: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '100%',
      borderLeft: border,
      borderBottom: border,
      borderRight: border,
      borderRadius: theme.mainContent.borderRadius,
      height: 'fit-content',
      ...(theme.palette.mode === ColorMode.Dark && { background: 'rgba(0, 0, 0, 0.08)' })
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      width: '100% !important',
    },
    headerTitle: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      gap: '0.25em',
      width: 'fit-content',
      height: '2em',
      margin: '-1em 0.5em 0em 0.5em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '1em',
    },
    headerBorderBefore: {
      borderTop: border,
      borderTopLeftRadius: theme.mainContent.borderRadius,
      width: '1em',
    },
    headerBorderAfter: {
      borderTop: border,
      borderTopRightRadius: theme.mainContent.borderRadius,
      width: '1em',
      flexGrow: 2,
    },
    childrenContainer: {
      display: 'flex',
      padding: '1em',
      paddingTop: 0,
    },
    childrenItem: {
      marginRight: '5px',
    }
  };
});

const DataField = ({ name, data, masName, deleteField }: DataFieldProps) => {
  const onHandleDelete = (item:string) => () => {
    deleteField(masName, item);
  };

  const classes = useStyles();

  return (
    <div className={classes.mainContainer}>
      <div className={classes.header}>
        <div className={classes.headerBorderBefore} />
        <div className={classes.headerTitle}>
          <span>{name}</span>
        </div>
        <div className={classes.headerBorderAfter} />
      </div>
      <div className={classes.childrenContainer}>
        {data.map((item: any) => (
          <div className={classes.childrenItem} key={item.ID}>
            <Chip
              style={{ maxWidth: '220px', margin: '0', display: 'flex' }}
              label={item.NAME || item.USR$NUMBER || item.USR$NAME}
              variant="outlined"
              color="info"
              onDelete={onHandleDelete(item.NAME || item.USR$NUMBER || item.USR$NAME)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataField;
