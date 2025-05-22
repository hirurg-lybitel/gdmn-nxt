import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
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
}: Readonly<SwitchStarProps>) {
  const mobile = useMediaQuery('(pointer: coarse)');

  return (
    <Tooltip title={selected ? 'Удалить из избранных' : 'Добавить в избранные'}>
      <IconButton
        size="small"
        className={styles.chosenButton}
        onClick={onClick}
      >
        <StarIcon
          className={`
            ${styles.selectedStar}
            ${mobile ? '' : styles.selectedStarHover}
            ${selected ? '' : styles.starInvisible}
          `}
        />
        <StarBorderIcon
          className={`
            ${styles.unselectedStar}
            ${mobile ? '' : styles.unselectedStarHover}
            ${!selected ? '' : styles.starInvisible}
          `}
        />
      </IconButton>
    </Tooltip>
  );
}

export default SwitchStar;
