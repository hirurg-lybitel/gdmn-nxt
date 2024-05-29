import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { useGetAllTemplateQuery } from '../../../features/managment/templateApi';
import styles from './select-template.module.less';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Grid, Stack, Typography } from '@mui/material';
import EmailTemplateListItem from '@gdmn-nxt/components/email-template-list-item/email-template-list-item';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { IFilteringData, ITemplate } from '@gsbelarus/util-api-types';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';


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
    <CustomizedDialog
      open={open}
      onClose={onCancel}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        <Stack
          direction={'row'}
          spacing={3}
          alignItems={'center'}
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
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ sm: 8, md: 12, lg: 12, ultraWide: 15 }}
        >
          <Grid
            item
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
                <EmailTemplateListItem
                  template={template}
                  editable={false}
                />
              </CustomizedCard>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          className="DialogButton"
          variant="outlined"
          onClick={onCancel}
        >
          Закрыть
        </Button>
      </DialogActions>
    </CustomizedDialog>
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
