import './sales-funnel.module.less';
import React from 'react';
import { useSelector } from 'react-redux';
import { customersSelectors } from '../../../features/customer/customerSlice';
import { ResponsiveFunnel } from '@nivo/funnel'
import CustomizedCard from '../../../components/customized-card/customized-card';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';

/* eslint-disable-next-line */
export interface SalesFunnelProps {}

/**Guid for @nivo/funnel https://nivo.rocks/funnel/ */
export function SalesFunnel(props: SalesFunnelProps) {
  const { data: stages, isFetching } = useGetKanbanDealsQuery();

  const funnelData = stages?.map(stage => ({
    id: stage.ID,
    label: stage.USR$NAME,
    value: stage.CARDS.length
  })) ?? [];

  return (
    <CustomizedCard borders boxShadows style={{height: '800px', flex: 1 }}>
      {isFetching
        ? <></>
        : <ResponsiveFunnel
            theme={{
              //fontSize: 20,
              labels: {
                text: {
                  fontSize: '1.5em',
                  fontWeight: 600
                }
              }
            }}
            data={funnelData}
            margin={{ top: 30, right: 20, bottom: 20, left: 20 }}
            valueFormat=">-.4s"
            colors={{ scheme: 'set2' }}
            borderWidth={20}
            labelColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        3
                    ]
                ]
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
  )
};

export default SalesFunnel;
