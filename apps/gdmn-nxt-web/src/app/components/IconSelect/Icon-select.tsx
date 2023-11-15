import React, { CSSProperties, useEffect, useState } from 'react';
import { IconButton, useMediaQuery, Theme, Autocomplete, TextField, autocompleteClasses } from '@mui/material';
import { useTheme, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as icons from '@mui/icons-material'
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Popper from '@mui/material/Popper'
import ListSubheader from '@mui/material/ListSubheader';
import { IconByName } from '@gsbelarus/ui-common-dialogs';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useOutsideClick } from '../../features/common/useOutsideClick';

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];

  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
    display:'flex',
    justifyContent:'center'
  }

  if (dataSet.hasOwnProperty('group')) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  return <div style={{...style, top: (style.top as number) + LISTBOX_PADDING, display:'flex',justifyContent:'center'}}>
    <IconButton onClick={()=>{dataSet[3](dataSet[1])}} style={{height:'40px',width:'100%',borderRadius:0}}>
      <IconByName name={dataSet[1]}/>
    </IconButton>
  </div>
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
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

  const getChildSize = (child: React.ReactElement) => {
    if (child.hasOwnProperty('group')) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
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

/* eslint-disable-next-line */

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

  const [ref] = useOutsideClick(openDialog, () => setOpenDialog(false));

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
          height:'365px',
          padding:'10px',
          zIndex:'1400',
          left:'30px',
          top:'30px',
          visibility: openDialog ? 'visible' : 'hidden',
          opacity: openDialog ? 1 : 0
        }}>
        <Autocomplete
          id="virtualize-demo"
          sx={{ width: 100,boxShadow: 4, background:theme.palette.background.paper, borderRadius:'12px 12px 0 0' }}
          className={classes.picker}
          disableListWrap
          PopperComponent={StyledPopper}
          ListboxComponent={ListboxComponent}
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
