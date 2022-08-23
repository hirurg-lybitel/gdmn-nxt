import { GridRowId, GridColDef } from "@mui/x-data-grid-pro";
import { useMemo } from "react";
import { StyledDataGrid, gridComponents } from "../../Styled/styled-data-grid/styled-data-grid";

interface IDataGridProps {
  rows?: any[];
  isLoading: boolean;
  selectionModel: GridRowId[];
  setSelectionModel: (selectionModel: GridRowId[]) => void;
};

export const DGrid = ({ rows, isLoading, selectionModel, setSelectionModel }: IDataGridProps) => {
  const columns: GridColDef[] = useMemo( () => {
    const fields = rows?.length ? Object.keys(rows[0]) : [];
    return fields.map(f => ({
      field: f,
      headerName: f,
      minWidth: f.length * (f.length > 10 ? 15 : 35),
    }));
  }, [rows]);

  return (
    <StyledDataGrid
      rows={rows ?? []}
      columns={columns}
      pagination
      loading={isLoading}
      onSelectionModelChange={setSelectionModel}
      selectionModel={selectionModel}
      rowHeight={24}
      headerHeight={24}
      components={gridComponents}
    />
  );
};
