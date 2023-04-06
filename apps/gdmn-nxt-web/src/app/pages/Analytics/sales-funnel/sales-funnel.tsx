import './sales-funnel.module.less';
import React from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { CardHeader, Typography, useTheme } from '@mui/material';

/* eslint-disable-next-line */
export interface SalesFunnelProps {}

/** Guid for @nivo/funnel https://nivo.rocks/funnel/ */
export function SalesFunnel(props: SalesFunnelProps) {
  const { data: stages, isFetching } = useGetKanbanDealsQuery({ userId: -1 });

  const theme = useTheme();

  const colors = [
    theme.color.purple[500],
    theme.color.red.A200,
    theme.color.yellow['800'],
    theme.color.green.A400,
    theme.color.blueGrey[400]
  ];

  const funnelData = stages?.map(stage => ({
    id: stage.ID,
    label: stage.USR$NAME,
    value: stage.CARDS.length
  })) ?? [];

  return (
    <CustomizedCard borders boxShadows style={{ height: 'calc(100vh - 130px)', flex: 1 }}>
      <CardHeader style={{ paddingBottom:'15px',paddingTop:'15px'}} title={<Typography variant="h3">Воронка продаж</Typography>} />
      {isFetching
        ? <></>
        : <ResponsiveFunnel
          theme={{
            // fontSize: 20,
            labels: {
              text: {
                fontSize: '1.5em',
                fontWeight: 600
              }
            },
            tooltip: {
              container: {
                background: theme.palette.background.paper,
                color: theme.textColor
              }
            }
          }}
          data={funnelData}
          margin={{ top: 30, right: 20, bottom: 20, left: 20 }}
          // valueFormat=">-.4s"
          colors={colors}
          // colors={{ scheme: 'set2' }}
          borderWidth={20}
          labelColor={{
            from: 'color',
            modifiers: [
              [
                'brighter',
                2
              ]
            ],
          }}

          beforeSeparatorLength={100}
          beforeSeparatorOffset={20}
          afterSeparatorLength={100}
          afterSeparatorOffset={20}
          currentPartSizeExtension={10}
          currentBorderWidth={40}
          motionConfig="wobbly"
        />}
    </CustomizedCard>
  );
};

export default SalesFunnel;
