import { Chip, Tooltip } from '@mui/material';
import style from './datafield.module.less';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { ColorMode } from '@gsbelarus/util-api-types';
import { IconByName } from '@gdmn-nxt/components/icon-by-name';

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
      marginLeft: '0 !important',
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
      justifyContent: 'center',
      display: 'flex',
      padding: '10px',
      paddingBottom: 0,
      paddingTop: 0,
      columnGap: '5px',
      flexWrap: 'wrap'
    },
    childrenItem: {
      marginBottom: '10px'
      // marginRight: '5px',
    }
  };
});

const DataField = ({ name, data, masName, deleteField }: DataFieldProps) => {
  const onHandleDelete = (item: string) => () => {
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
            <Tooltip placement="top" title={item.USR$NAME}>
              <Chip
                icon={
                  <div style={{ marginLeft: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconByName name={item.USR$ICON}/>
                  </div>}
                style={{ maxWidth: '140px', margin: '0', display: 'flex' }}
                label={item.NAME || item.USR$NUMBER || item.USR$NAME}
                variant="outlined"
                color="info"
                onDelete={onHandleDelete(item.NAME || item.USR$NUMBER || item.USR$NAME)}
              />
            </Tooltip>

          </div>
        ))}
      </div>
    </div>
  );
};

export default DataField;
