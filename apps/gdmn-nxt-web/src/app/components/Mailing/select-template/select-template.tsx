import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './select-template.module.less';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Grid, Stack, Typography } from '@mui/material';
import EmailTemplateListItem from '@gdmn-nxt/components/email-template-list-item/email-template-list-item';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { IFilteringData, ITemplate } from '@gsbelarus/util-api-types';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useGetAllTemplateQuery } from '../../../features/Marketing/templates/templateApi';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';


export interface SelectTemplateProps {
  open: boolean,
  onCancel: () => void;
  onSelect: (template: ITemplate) => void;
}

export function SelectTemplate({
  open,
  onCancel,
  onSelect
}: SelectTemplateProps) {
  const [filter, setFilter] = useState<IFilteringData | null>(null);

  const { data: { templates } = {
    count: 0,
    templates: []
  }, isFetching, isLoading } = useGetAllTemplateQuery({
    // pagination: paginationData,
    ...(filter && { filter })
  });

  const onTemplateSelect = (template: ITemplate) => () => {
    onSelect(template);
  };

  const newTemplateSelect = () => {
    onSelect({
      ID: -1,
      NAME: 'New',
      HTML: ''
    });
  };

  const requestSearch = (value: string) => {
    setFilter({ name: value });
  };

  const cancelSearch = () => {
    setFilter(null);
  };

  return (
    <EditDialog
      open={open}
      onClose={onCancel}
      fullwidth
      selectDialog
      title={(
        <Stack
          direction={'row'}
          spacing={{ xs: 0, sm: 3 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          sx={{ gap: { xs: '10px', sm: '0' } }}
        >
          <div style={{ textWrap: 'nowrap' }}>Выберите шаблон</div>
          <SearchBar
            disabled={isLoading}
            onRequestSearch={requestSearch}
            onCancelSearch={cancelSearch}
            cancelOnEscape
            value={filter?.name}
          />
        </Stack>
      )}
    >
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12, lg: 12, ultraWide: 15 }}
        minWidth={0}
      >
        <Grid
          item
          xs={4}
          sm={4}
          md={4}
          lg={3}
          ultraWide={3}
          key={1}
        >
          <NewTemplate
            onClick={newTemplateSelect}
          />
        </Grid>
        {templates.map(template => (
          <Grid
            item
            xs={4}
            sm={4}
            md={4}
            lg={3}
            ultraWide={3}
            key={template.ID}
          >
            <CustomizedCard
              className={styles['card-item']}
              onClick={onTemplateSelect(template)}
            >
              <div style={{ pointerEvents: 'none' }}>
                <EmailTemplateListItem
                  template={template}
                  editable={false}
                />
              </div>
            </CustomizedCard>
          </Grid>
        ))}
      </Grid>
    </EditDialog>
  );
}

export default SelectTemplate;


interface INewTemplate {
  onClick: () => void;
}

const NewTemplate = ({
  onClick
}: INewTemplate) => {
  return (
    <CustomizedCard
      className={`${styles['card-item']} ${styles['new-card']}`}
      onClick={onClick}
    >
      <div className={styles['new-card-header']}>
        Новый шаблон</div>
      <div
        style={{
          textAlign: 'center'
        }}
      >
        <AddIcon
          className={styles['icon-add']}
        />
      </div>
      <img src="assets/img/new_template.svg" alt="Новый шаблон" />
    </CustomizedCard>
  );
};
