import './custom-tree-view.module.less';
import TreeView from '@mui/lab/TreeView';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NestedSets, { CollectionEl } from 'nested-sets-tree';
import { Box, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import TreeItem from '@mui/lab/TreeItem';
import { useCallback, useState } from 'react';


export interface CustomTreeViewProps {
  hierarchy: any[];
  tree: NestedSets;
  onNodeSelect: (event: React.SyntheticEvent, nodeId: string) => void;
}


const RenderTree = (props: CustomTreeViewProps, nodes: CollectionEl) => {
  const { hierarchy, tree } = props;

  const [nodeId, setNodeId] = useState<number>();

  const initialRightClickStateCreator = () => ({
    mouseX: null,
    mouseY: null
  });

  const [right, setRight] = useState<{
    mouseX: null | number;
    mouseY: null | number;
  }>(initialRightClickStateCreator());

  const onClose = useCallback(() => {
    setRight(initialRightClickStateCreator());
  }, []);

  const rightClick = (event: React.MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setRight({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
    setNodeId(nodes.ID);
  };

  const handleEditClick = () => {
    console.log('handleEditClick', nodeId);
    onClose();
  }

  const handleDeleteClick = () => {
    console.log('handleDeleteClick', nodeId);
    onClose();
  }

  return (
    <>
      <TreeItem
        sx={{
          paddingTop: 0.8,
          paddingBottom: 0.8,
          fontSize: 2,
          color: '#1976d2'
        }}
        key={nodes.ID}
        nodeId={nodes.ID.toString()}
        onContextMenu={rightClick}
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FolderIcon color='primary' />
            <span
              style={{
                flex: 1,
                paddingLeft: 3
              }}
            >
              {hierarchy.find((elem) => elem.ID === nodes.ID)?.NAME}
            </span>
          </Box>
        }
      >
        {Array.isArray(tree.getChilds(nodes, false).results)
            ? tree.getChilds(nodes, false).results.map((node) => RenderTree(props, node))
            : null}
      </TreeItem>
      <Menu
        BackdropProps={{
          invisible: true,
          onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
        open={right.mouseY !== null}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={
          right.mouseY !== null && right.mouseX !== null
            ? { top: right.mouseY, left: right.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Редактировать</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Удалить</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export function CustomTreeView(props: CustomTreeViewProps) {
  const { hierarchy, tree } = props;
  const { onNodeSelect } = props;




  return (
    <TreeView
    sx={{
      // paddingTop: 12,
      marginRight: 1,
      flexGrow: 1,
      maxWidth: 400,
      height: '100%',
      overflowY: 'auto',
      border: 1,
      borderRadius: '4px',
      borderColor: 'grey.300',
    }}
    defaultCollapseIcon={<KeyboardArrowDownIcon/>}
    defaultExpandIcon={<KeyboardArrowRightIcon/>}
    onNodeSelect={onNodeSelect}
  >
    {tree.all
      .filter((node) => node.PARENT === 0)
      .sort((a, b) => Number(a.LB) - Number(b.LB))
      .map((node) => RenderTree(props, node))}
  </TreeView>
  );
}

export default CustomTreeView;
