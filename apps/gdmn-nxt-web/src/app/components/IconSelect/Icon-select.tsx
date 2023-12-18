import React, { useState } from 'react';
import { IconButton, useMediaQuery, Theme, Autocomplete, TextField, autocompleteClasses } from '@mui/material';
import { useTheme, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as icons from '@mui/icons-material'
import { FixedSizeGrid, VariableSizeList, GridChildComponentProps } from 'react-window';
import Popper from '@mui/material/Popper'
import { IconByName } from '@gsbelarus/ui-common-dialogs';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useOutsideClick } from '../../features/common/useOutsideClick';

const columnCount = 7
function renderRow(props: GridChildComponentProps) {
const { data, rowIndex, style, columnIndex } = props;
  const dataSet = data[columnIndex + (rowIndex * columnCount) ];
  if(!dataSet) return <></>
  return (
    <div style={{...style, width:'40px'}}>
      <IconButton onClick={()=>{dataSet[3](dataSet[1])}} style={{height:'40px',width:'40px',borderRadius:0}}>
        <IconByName name={dataSet?.[1]}/>
      </IconButton>
    </div>
  )
}

const OuterElementContext = React.createContext({});

// Adapter for react-window
const ListboxComponent = (outRef:React.MutableRefObject<any>) => React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactElement[] = [];
  (children as React.ReactElement[]).forEach(
    (item: React.ReactElement & { children?: React.ReactElement[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    },
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  return (
    <div ref={outRef}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeGrid
          itemData={itemData}
          columnCount={columnCount}
          columnWidth={40}
          height={150}
          rowCount={itemCount/columnCount}
          rowHeight={35}
          width={300}
        >
          {renderRow}
        </FixedSizeGrid>
      </OuterElementContext.Provider>
    </div>
  );
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

const useStyles = makeStyles((theme: Theme) => ({
  picker:{
    '& .MuiInputBase-root': {
      borderRadius:0,
      borderBottomLeftRadius:0
    }
  }
}));

export interface IconSelectProps {
  icon:string,
  setIcon:(arg1:string) => void
}

export function IconSelect(props: IconSelectProps) {
  const classes = useStyles();

  const {icon,setIcon} = props

  const [openDialog,setOpenDialog] = useState<boolean>(false)

  const changeDialog = () => {
    setOpenDialog(!openDialog)
  }

  const theme = useTheme();

  const [ref, ref2] = useOutsideClick(openDialog, () => {
    console.log('asd')
    setOpenDialog(false)
  });

  return (
    <div ref={ref} style={{position:'relative'}}>
      <IconButton  onClick={changeDialog}>
        {icon === ''
          ? <RadioButtonUncheckedIcon/>
          : <IconByName name={icon}/>
        }
      </IconButton>
      <div
        style={{
          position:'absolute',
          padding:'10px',
          zIndex:'1400',
          left:'30px',
          top:'30px',
          visibility: openDialog ? 'visible' : 'hidden',
          opacity: openDialog ? 1 : 0
        }}>
        <Autocomplete
          id="virtualize-demo"
          sx={{ width: 300,boxShadow: 4, background:theme.palette.background.paper, borderRadius:'12px 12px 0 0' }}
          className={classes.picker}
          disableListWrap
          clearOnBlur={false}
          PopperComponent={StyledPopper}
          ListboxComponent={ListboxComponent(ref2)}
          options={[''].concat(Object.keys(icons).filter(item => !item.includes('Outlined') && !item.includes('Rounded') && !item.includes('TwoTone') && !item.includes('Sharp')))}
          renderInput={(params) => <TextField {...params} label="Поиск" />}
          renderOption={(props, option, state) =>
            [props, option, state.index, setIcon] as React.ReactNode
          }
          renderGroup={(params) => params as any}
          open={openDialog}
        />
      </div>
    </div>
  );
}

export default IconSelect;
