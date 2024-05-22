import { Box, CardContent, CardHeader, Divider, Stack, TablePagination, Typography } from '@mui/material';
import CustomizedCard from '../Styled/customized-card/customized-card';
import styles from './email-template-list.module.less';
import SearchBar from '../search-bar/search-bar';
import CustomAddButton from '../helpers/custom-add-button';
import CustomLoadingButton from '../helpers/custom-loading-button/custom-loading-button';
import { templates } from './testData';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import ReactHtmlParser from 'react-html-parser';

interface EmailTemplateListProps {

}

const EmailTemplateList = (props: EmailTemplateListProps) => {
  return (
    <CustomizedCard style={{ flex: 1 }}>
      <CardHeader
        title={<Typography variant="pageHeader">Шаблоны</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box paddingX={'4px'} />
            <SearchBar />
            <Box display="inline-flex" alignSelf="center">
              <CustomAddButton
                // disabled={}
                label="Создать договор"
                // onClick={() => }
              />
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                loading={false}
                onClick={() => {}}
              />
            </Box>
          </Stack>
        }
      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <div className={`container ${styles['container']}`}>
          {templates.length === 0
            ? <div className={styles.noData}>noData</div>
            : <>
              <CustomizedScrollBox>
                <ul className={`list ${styles.list}`}>
                  {templates.map((template: any, index: number) =>
                    <li key={index} className={styles.item}>
                      <Box
                        sx={{ '& html,body': {
                          height: 'calc(100% - 24px)'
                        } }}
                        className={styles.card}
                      >
                        <Typography>
                          {template.name}
                        </Typography>
                        <div style={{ height: '100%', display: 'flex', marginBottom: '10px' }}>
                          {ReactHtmlParser(template.html)}
                        </div>
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
                  count={10}
                  page={1}
                  rowsPerPageOptions={[10]}
                  rowsPerPage={10}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                />
              </div>
            </>
          }
        </div>
      </CardContent>
    </CustomizedCard>
  );
};

export default EmailTemplateList;
