import { Chip, Box } from '@mui/material';
import style from './datafield.module.less';

interface DataFieldProps {
    name: string;
    masName: string;
    data: any;
    deleteField: any;
  }

const DataField = ({ name, data, masName, deleteField }: DataFieldProps) => {
  const onHandleDelete = (item:string) => () => {
    deleteField(masName, item);
  };

  return (
    <Box style={{ margin: '0px 20px 20px 0px' }}>
      <div className={style.selectedDataContainer}>
        <div className={style.selectedDataContainer_name}>
          <span>{name}</span>
        </div>
        {data.map((item: any) => (
          <div className={style.selectedDataContainer_item} key={item.ID}>
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