import './sales-funnel.module.less';
import React from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { CardHeader, Typography, useMediaQuery, useTheme } from '@mui/material';

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

  const mobile = useMediaQuery('(pointer: coarse)');

  return (
    <CustomizedCard
      style={{ height: `calc(100vh - ${mobile ? 80 : 50}px)`, flex: 1 }}
    >
      <CardHeader title={<Typography variant="pageHeader">Воронка продаж</Typography>} />
      {isFetching
        ? <></>
        : <div style={{ flex: 1, position: 'relative', overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ position: 'absolute', minWidth: '600px', inset: 0 }}>
            <ResponsiveFunnel
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
              margin={{ top: 0, right: 20, bottom: 40, left: 20 }}
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
            />
          </div>
        </div>}
    </CustomizedCard>
  );
};

export default SalesFunnel;
