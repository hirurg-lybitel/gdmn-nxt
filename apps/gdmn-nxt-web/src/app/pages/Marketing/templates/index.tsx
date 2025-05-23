import { Box, CardContent, CardHeader, Divider, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import EmailTemplateListItem from '../../../components/email-template-list-item/email-template-list-item';
import EmailTemplateListItemEdit from '../../../components/email-template-list-item-edit/email-template-list-item-edit';
import { IFilteringData, IPaginationData, ITemplate } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { templateApi, useAddTemplateMutation, useDeleteTemplateMutation, useUpdateTemplateMutation } from '../../../features/Marketing/templates/templateApi';
import styles from './email-template-list.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import CustomNoData from '@gdmn-nxt/components/Styled/Icons/CustomNoData';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import CustomTablePagination from '@gdmn-nxt/components/CustomTablePagination/CustomTablePagination';
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

  const filterEntityName = 'template';
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);

  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);

  const dispatch = useDispatch();
  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
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

  const [addTemplate, { isLoading: addIsLoading }] = useAddTemplateMutation();
  const [updateTemplate, { isLoading: updateIsLoading }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: deleteIsLoading }] = useDeleteTemplateMutation();

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

  const disabled = isLoading || isFetching || updateIsLoading || addIsLoading || deleteIsLoading;

  return (
    <>
      <CustomizedCard style={{ flex: 1 }}>
        <CustomCardHeader
          search
          refetch
          title={'Шаблоны'}
          isLoading={isLoading || filtersIsLoading}
          isFetching={isFetching || filtersIsFetching || updateIsLoading || addIsLoading || deleteIsLoading}
          onCancelSearch={cancelSearch}
          onRequestSearch={requestSearch}
          searchValue={filterData?.name?.[0]}
          onRefetch={templatesRefresh}
          addButton
          onAddClick={handleAdd}
          addButtonHint="Создать шаблон"
        />
        <Divider />
        <CardContent style={{ padding: 0 }}>
          <div className={`container ${styles['container']}`}>
            {!(isLoading || isFetching) && templatesData.templates.length === 0
              ? <div className={styles.noData}><CustomNoData /></div>
              : <>
                <CustomizedScrollBox>
                  <ul className={`list ${styles.list}`}>
                    {(isLoading) ?
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
                  <CustomTablePagination
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
