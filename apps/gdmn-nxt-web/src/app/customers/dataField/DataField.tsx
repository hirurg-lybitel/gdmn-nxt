import { Chip, Box } from '@mui/material';
import style from './datafield.module.less';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

interface DataFieldProps {
    name: string;
    masName: string;
    data: any;
    deleteField: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  selectedDataContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    borderRadius: '10px',
    background: 'rgba(0,0,0,0.08)'
  },
  selectedDataContainer_name: {
    padding: '0 5px',
    top: '-12px',
    left: '7px',
    position: 'absolute',
  },
  selectedDataContainer_item: {
    marginRight: '5px',
  }
}));

const DataField = ({ name, data, masName, deleteField }: DataFieldProps) => {
  const onHandleDelete = (item:string) => () => {
    deleteField(masName, item);
  };

  const classes = useStyles();

  return (
    <Box style={{ margin: '0px 20px 20px 0px' }}>
      <div className={classes.selectedDataContainer}>
        <div className={classes.selectedDataContainer_name}>
          <span>{name}</span>
        </div>
        {data.map((item: any) => (
          <div className={classes.selectedDataContainer_item} key={item.ID}>
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
    </Box>
  );
};

export default DataField;