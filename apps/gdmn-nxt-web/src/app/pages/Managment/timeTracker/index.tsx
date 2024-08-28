import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import styles from './time-tracker.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  Stack,
  Typography,
  AccordionProps,
  AccordionSummaryProps,
  styled,
  Divider
} from '@mui/material';
import { useMemo } from 'react';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { ITimeTrack } from '@gsbelarus/util-api-types';
import dayjs from '@gdmn-nxt/dayjs';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import { AddItem } from './components/add-item';
import { useAddTimeTrackingMutation, useDeleteTimeTrackingMutation, useGetTimeTrackingByDateQuery, useGetTimeTrackingInProgressQuery, useUpdateTimeTrackingMutation } from '../../../features/time-tracking';
import CircularIndeterminate from '@gdmn-nxt/components/helpers/circular-indeterminate/circular-indeterminate';
import MenuBurger from '@gdmn-nxt/components/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion
    disableGutters
    elevation={0}
    {...props}
  />
))(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'var(--color-paper-bg)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  // padding: theme.spacing(2),
  // borderTop: '1px solid rgba(0, 0, 0, .125)',
  borderTop: `1px solid ${theme.palette.divider}`
  // backgroundColor: 'var(--color-card-bg)',
}));


//   type CalcMode = 'calc' | 'manual';
//   const [calcMode, setCalcMode] = useState<CalcMode>('calc');

//   const calcModeChange = (
//     event: MouseEvent<HTMLElement>,
//     newAlignment: CalcMode | null,
//   ) => {
//     newAlignment && setCalcMode(newAlignment);
//   };

//   const formik = useFormik({
//     enableReinitialize: true,
//     initialValues: {},
//     onSubmit: (values) => {

//     }
//   });

//   return (
//     <CustomizedCard className={styles.itemCard}>
//       <FormikProvider value={formik}>
//         <Form id="contactForm" onSubmit={formik.handleSubmit}>
//           <Stack
//             direction="row"
//             spacing={2}
//             alignItems="center"
//           >
//             <TextField
//               label="Над чем вы работали?"
//               style={{
//                 flex: 1
//               }}
//               InputProps={{
//                 startAdornment:
//                 <InputAdornment position="start">
//                   <TextField
//                     select
//                     InputProps={{
//                       disableUnderline: true
//                     }}
//                     variant="standard"
//                     defaultValue={'Консультация'}
//                   >
//                     {['Консультация', 'Доработка', 'Внедрение'].map((option) => (
//                       <MenuItem key={option} value={option}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                 </InputAdornment>,
//               }}
//             />
//             {/* <CustomerSelect
//               style={{
//                 maxWidth: '300px'
//               }}
//             /> */}
//             <div>Select_customer_and_task</div>
//             <DatePicker
//               className={styles.selectDate}
//               // label="Сегодня"
//               // format="DD.MM.YY"
//               slotProps={{ textField: { placeholder: 'Сегодня' } }}

//             />
//             <Stack direction="row" alignItems="center" spacing={0.5}>
//               <TimePicker className={styles.selectTime} />
//               <div>-</div>
//               <TimePicker className={styles.selectTime} slotProps={{ openPickerButton: { size: 'small' } }} />
//             </Stack>
//             <Box display="inline-flex" alignSelf="center">
//               <Button
//                 variant="contained"
//                 startIcon={<PlayCircleFilledWhiteIcon />}
//               >
//               Начать
//               </Button>
//             </Box>
//             {/* <Box display="inline-flex" alignSelf="center"> */}
//             <ToggleButtonGroup
//             // orientation="vertical"

//               exclusive
//               size="small"
//               value={calcMode}
//               onChange={calcModeChange}
//             >
//               <Tooltip arrow title="Таймер">
//                 <ToggleButton value="calc" style={{ padding: 5 }}>
//                   <AccessTimeFilledIcon />
//                 </ToggleButton>
//               </Tooltip>
//               <Tooltip arrow title="Вручную">
//                 <ToggleButton value="manual" style={{ padding: 5 }}>
//                   <EditNoteIcon />
//                 </ToggleButton>
//               </Tooltip>
//             </ToggleButtonGroup>
//             {/* </Box> */}
//           </Stack>
//         </Form>
//       </FormikProvider>
//     </CustomizedCard>
//   )
// };
export function TimeTracker() {
  const {
    data: timeTrackGroup = [],
    isFetching,
    isLoading,
    refetch
  } = useGetTimeTrackingByDateQuery();
  const {
    data: activeTimeTrack,
    refetch: refetchTimeTrackingInProgress
  } = useGetTimeTrackingInProgressQuery();
  const [addTimeTrack] = useAddTimeTrackingMutation();
  const [updateTimeTrack] = useUpdateTimeTrackingMutation();
  const [deleteTimeTrack] = useDeleteTimeTrackingMutation();

  const Header = useMemo(() => {
    return (
      <CustomizedCard
        direction="row"
        className={styles.headerCard}
      >
        <Typography variant="pageHeader">Учёт времени</Typography>
        <Box flex={1} />
        <Box
          pr={1}
        >
          <SearchBar
            disabled
            // disabled={isLoading}
            // onCancelSearch={cancelSearch}
            // onRequestSearch={requestSearch}
            cancelOnEscape
            // fullWidth
            placeholder="Поиск"
            // iconPosition="start"
          // value={
          //   filterData && filterData.name
          //     ? filterData.name[0]
          //     : undefined
          // }
          />
        </Box>
        <CustomLoadingButton
          hint="Обновить данные"
          loading={isFetching}
          onClick={() => {
            refetch();
            refetchTimeTrackingInProgress();
          }}
        />
      </CustomizedCard>
    );
  }, [isFetching, refetch, refetchTimeTrackingInProgress]);

  const handleSubmit = (value: ITimeTrack, mode: 'add' | 'update') => {
    if (mode === 'update') {
      updateTimeTrack(value);
      return;
    }
    addTimeTrack(value);
  };

  const onDelete = (id: number) => () => {
    deleteTimeTrack(id);
  };

  return (
    <Stack flex={1} spacing={3}>
      {Header}
      <AddItem
        initial={activeTimeTrack}
        onSubmit={handleSubmit}
      />
      {isLoading ?
        <CircularIndeterminate open size={70} /> :
        <CustomizedScrollBox container={{ style: { marginRight: '-16px' } }}>
          <Stack spacing={2} mr={2}>
            {timeTrackGroup.map(({ date, duration, items }, idx) => {
              return (
                <CustomizedCard key={idx}>
                  <Accordion defaultExpanded={true}>
                    <AccordionSummary>
                      <Stack
                        direction="row"
                        spacing={1}
                        flex={1}
                        alignItems="center"
                      >
                        <Typography fontWeight={600} textTransform="capitalize" >
                          {dayjs(date).format('MMM D, YYYY')}
                        </Typography>
                        <Box flex={1} />
                        <Typography variant="caption">
                          Итого:
                        </Typography>
                        <Typography fontWeight={600} width={60}>
                          {duration
                            ? dayjs
                              .duration(duration)
                              .format('HH:mm:ss')
                              .split('.')[0]
                            : '00:00:00'}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails style={{ padding: '0 16px' }}>
                      {items.map(({ ID, customer, workProject, description, startTime, endTime, duration }) => {
                        return (
                          <Stack
                            key={ID}
                            direction="row"
                            spacing={2}
                            alignItems={'center'}
                            sx={{
                              borderBottom: '1px solid',
                              borderBottomColor: 'divider',
                              padding: '8px 0px',
                              ':last-child': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <Stack flex={1}>
                              <Typography variant={'caption'}>{customer?.NAME}</Typography>
                              <Typography>{`${workProject?.NAME}: ${description}`}</Typography>
                            </Stack>
                            <Divider orientation="vertical" flexItem />
                            <Typography>{`${dayjs(startTime).format('HH:mm')} - ${dayjs(endTime).format('HH:mm')}`}</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography fontWeight={600} width={60}>
                              {duration
                                ? dayjs
                                  .duration(duration)
                                  .format('HH:mm:ss')
                                  .split('.')[0]
                                : '00:00:00'}
                            </Typography>
                            <MenuBurger
                              items={[
                                <ItemButtonDelete
                                  key="delete"
                                  label="Удалить"
                                  text={'Вы действительно хотите удалить запись ?'}
                                  onClick={onDelete(ID)}
                                />
                              ]}
                            />
                          </Stack>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                </CustomizedCard>
              );
            })}
          </Stack>
        </CustomizedScrollBox>}

    </Stack>
  );
};
