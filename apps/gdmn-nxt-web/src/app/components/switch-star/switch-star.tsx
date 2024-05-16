import { IconButton, Tooltip } from '@mui/material';
import styles from './switch-star.module.less';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import React from 'react';

export interface SwitchStarProps {
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function SwitchStar({
  selected,
  onClick
}: SwitchStarProps) {
  return (
    <Tooltip title={selected ? 'Удалить из избранных' : 'Добавить в избранные'}>
      <IconButton
        size="small"
        className={styles.chosenButton}
        onClick={onClick}
      >
        <StarIcon className={`${styles.selectedStar} ${selected ? '' : styles.starInvisible}`} />
        <StarBorderIcon className={`${styles.unselectedStar} ${!selected ? '' : styles.starInvisible}`} />
      </IconButton>
    </Tooltip>
  );
}

export default SwitchStar;
