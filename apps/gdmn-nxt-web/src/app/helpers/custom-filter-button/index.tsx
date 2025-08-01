import FilterListIcon from '@mui/icons-material/FilterList';
import { Badge, IconButton, Tooltip } from '@mui/material';

interface Props {
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  hasFilters?: boolean;
}

export default function CustomFilterButton({
  disabled = false,
  onClick = () => { },
  hasFilters = false
}: Readonly<Props>) {
  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      size="small"
    >
      <Tooltip
        arrow
        title={hasFilters
          ? 'У вас есть активные фильтры'
          : 'Выбрать фильтры'
        }
      >
        <Badge
          color="error"
          variant={hasFilters ? 'dot' : 'standard'}
        >
          <FilterListIcon
            color={disabled ? 'disabled' : 'primary'}
          />
        </Badge>
      </Tooltip>
    </IconButton>
  );
}
