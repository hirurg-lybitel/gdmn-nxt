import './custom-tree-view.module.less';
import TreeView from '@mui/lab/TreeView';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NestedSets, { CollectionEl } from 'nested-sets-tree';
import { Box, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import TreeItem from '@mui/lab/TreeItem';
import { useCallback, useState } from 'react';
import CustomizedCard from '../components/Styled/customized-card/customized-card';

interface CustomizedTreeItemProps extends CustomTreeViewProps {
  node: CollectionEl;
}

const RecursiveCustomizedTreeItem = (props: CustomizedTreeItemProps) => {
  const {node, tree, hierarchy} = props;
  const {onEdit, onDelete} = props;

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
    setNodeId(node.ID);
  };

  const handleEditClick = () => {
    if (onEdit) onEdit(Number(nodeId));
    onClose();
  }

  const handleDeleteClick = () => {
    if (onDelete) onDelete(Number(nodeId));
    onClose();
  }

  return (
    <Box>
      <TreeItem
        sx={{
          paddingTop: 0.8,
          paddingBottom: 0.8,
          fontSize: 2,
          color: '#1976d2'
        }}
        nodeId={node.ID.toString()}
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
              {hierarchy.find((elem) => elem.ID === node.ID)?.NAME}
            </span>
          </Box>
        }
      >
        {Array.isArray(tree.getChilds(node, false).results)
            ? tree.getChilds(node, false).results.map((node) => <RecursiveCustomizedTreeItem key={node.ID} {...props} node={node}  />)
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
        <MenuItem key={1} onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Редактировать</Typography>
        </MenuItem>
        <Divider />
        <MenuItem key={2}  onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Удалить</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};


export interface CustomTreeViewProps {
  hierarchy: any[];
  tree: NestedSets;
  onNodeSelect?: (event: React.SyntheticEvent, nodeId: string) => void;
  onEdit?: (nodeId: number) => void;
  onDelete?: (nodeId: number) => void;
}

export function CustomTreeView(props: CustomTreeViewProps) {
  const { tree } = props;
  const { onNodeSelect } = props;

  return (
    <CustomizedCard
      borders
      boxShadows
      sx={{
        height: '100%',
        overflowY: 'auto',
        marginRight: 1,
        flexGrow: 1,
        maxWidth: 400
      }}>
      <TreeView
        defaultCollapseIcon={<KeyboardArrowDownIcon/>}
        defaultExpandIcon={<KeyboardArrowRightIcon/>}
        onNodeSelect={onNodeSelect}
      >
      {tree.all
        .filter( ({ PARENT }) => !PARENT )
        .sort( (a, b) => Number(a.LB) - Number(b.LB) )
        .map( (node) => <RecursiveCustomizedTreeItem key={node.ID} {...props} node={node} />)}
    </TreeView>
  </CustomizedCard>
  );
}

export default CustomTreeView;

