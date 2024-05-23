import { Box, CardContent, CardHeader, Divider, IconButton, Skeleton, Stack, TablePagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import CustomizedCard from '../Styled/customized-card/customized-card';
import styles from './email-template-list.module.less';
import SearchBar from '../search-bar/search-bar';
import CustomAddButton from '../helpers/custom-add-button';
import CustomLoadingButton from '../helpers/custom-loading-button/custom-loading-button';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import EmailTemplateListItem from './email-template-list-item/email-template-list-item';
import EmailTemplateListItemEdit from './email-template-list-item-edit/email-template-list-item-edit';
import { ITemplate, templateApi, useAddTemplateMutation, useDeleteTemplateMutation, useUpdateTemplateMutation } from '../../features/template/templateApi';
import CustomNoData from '../Styled/Icons/CustomNoData';
import { IFilteringData, IPaginationData } from '@gsbelarus/util-api-types';
import { saveFilterData } from '../../store/filtersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';

interface EmailTemplateListProps {

}

const EmailTemplateList = (props: EmailTemplateListProps) => {
  const theme = useTheme();
  const matchUpUW = useMediaQuery(theme.breakpoints.up('ultraWide'));

  const [pageOptions, setPageOptions] = useState<number[]>([]);

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: matchUpUW ? 16 : 9,
  });

  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.template);

  const dispatch = useDispatch();
  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ 'template': filteringData }));
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
    setPaginationData(prev => ({ ...prev, pageNo: 0 }));
  }, [filterData]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, [filterData]);

  useEffect(() => {
    const rowPerPage = matchUpUW ? 16 : 9;
    setPageOptions([
      rowPerPage,
      rowPerPage * 2,
      rowPerPage * 5,
      rowPerPage * 10
    ]);
  }, [paginationData, matchUpUW]);


  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPaginationData({ ...paginationData, pageNo: newPage });
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPaginationData({ pageNo: 0, pageSize: parseInt(event.target.value, 10) });
  };

  const { data: templatesData = {
    count: 0,
    templates: []
  }, isFetching, isLoading, refetch: templatesRefresh } = templateApi.useGetAllTemplateQuery({
    pagination: paginationData,
    ...(filterData && { filter: filterData })
  });

  const [addTemplate] = useAddTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const [editedTemplate, setEditedTemplate] = useState<ITemplate | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = (template: ITemplate) => {
    setIsAdd(false);
    setIsOpen(true);
    setEditedTemplate(template);
  };

  const onSumbit = (template?: ITemplate, isDelete?: boolean) => {
    if ((isAdd && isDelete) || !template) return;
    if (isDelete) {
      deleteTemplate(template.ID);
      return;
    }
    if (isAdd) {
      addTemplate(template);
      return;
    }
    updateTemplate([template, template.ID]);
  };

  const editTemplate = useMemo(() => {
    return (
      <EmailTemplateListItemEdit
        onSumbit={onSumbit}
        open={isOpen}
        template={editedTemplate}
        onClose={handleClose}
      />
    );
  }, [editedTemplate, isOpen]);

  const loadingData = (size: number) => {
    const mas = [];
    for (let i = 0;i < size;i++) {
      mas.push(0);
    }
    return mas;
  };

  const handleAdd = () => {
    setEditedTemplate(undefined);
    setIsAdd(true);
    setIsOpen(true);
  };

  return (
    <>
      <CustomizedCard style={{ flex: 1 }}>
        <CardHeader
          title={<Typography variant="pageHeader">Шаблоны</Typography>}
          action={
            <Stack direction="row" spacing={1}>
              <Box paddingX={'4px'} />
              <SearchBar
                disabled={isLoading}
                onRequestSearch={requestSearch}
                onCancelSearch={cancelSearch}
                fullWidth
                cancelOnEscape
                value={
                  filterData?.name
                    ? filterData.name[0]
                    : undefined
                }
              />
              <Box display="inline-flex" alignSelf="center">
                <CustomAddButton
                  disabled={(isLoading || isFetching)}
                  label="Создать шаблон"
                  onClick={handleAdd}
                />
              </Box>
              <Box display="inline-flex" alignSelf="center">
                <CustomLoadingButton
                  loading={(isLoading || isFetching)}
                  hint="Обновить данные"
                  onClick={templatesRefresh}
                />
              </Box>
            </Stack>
          }
        />
        <Divider />
        <CardContent style={{ padding: 0 }}>
          <div className={`container ${styles['container']}`}>
            {!(isLoading || isFetching) && templatesData.templates.length === 0
              ? <div className={styles.noData}><CustomNoData /></div>
              : <>
                <CustomizedScrollBox>
                  <ul className={`list ${styles.list}`}>
                    {(isLoading || isFetching) ?
                      loadingData(paginationData.pageSize).map((value, index) =>
                        <li key={index} className={styles.item}>
                          <Skeleton
                            variant="rectangular"
                            height={400}
                            style={{
                              borderRadius: '15px',
                            }}
                          />
                        </li>
                      )
                      : templatesData.templates.map((template: any, index: number) =>
                        <li key={index} className={styles.item}>
                          <Box
                            sx={{ '& html,body': {
                              height: 'min-content'
                            } }}
                            className={styles.card}
                          >
                            <EmailTemplateListItem
                              templates={templatesData.templates}
                              onOpen={handleOpen}
                              template={template}
                            />
                          </Box>
                        </li>
                      )}
                  </ul>
                </CustomizedScrollBox>
                <Divider />
                <div className={styles.footer}>
                  <TablePagination
                    component="div"
                    labelRowsPerPage="Карточек на странице:"
                    count={templatesData.count}
                    page={paginationData.pageNo}
                    rowsPerPageOptions={pageOptions}
                    rowsPerPage={paginationData.pageSize}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </div>
              </>
            }
          </div>
        </CardContent>
      </CustomizedCard>
      {editTemplate}
    </>
  );
};

export default EmailTemplateList;
