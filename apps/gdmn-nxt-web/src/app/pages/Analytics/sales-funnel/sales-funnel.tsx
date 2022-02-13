import './sales-funnel.module.less';
import React from 'react';
import { useSelector } from 'react-redux';
import { customersSelectors } from '../../../features/customer/customerSlice';
import { ResponsiveFunnel } from '@nivo/funnel'
import MainCard from '../../../components/main-card/main-card';

/* eslint-disable-next-line */
export interface SalesFunnelProps {}

/**Guid for @nivo/funnel https://nivo.rocks/funnel/ */
export function SalesFunnel(props: SalesFunnelProps) {
  const funnelData = [
      {
        id: "step_sent",
        value: 66303,
        label: "Sent"
      },
      {
        id: "step_viewed",
        value: 55213,
        label: "Viewed"
      },
      {
        id: "step_clicked",
        value: 40714,
        label: "Clicked"
      },
      {
        id: "step_add_to_card",
        value: 35944,
        label: "Add To Card"
      },
      {
        id: "step_purchased",
        value: 28944,
        label: "Purchased"
      }
  ]


  return (

    <MainCard border boxShadow style={{height: '800px' }}>
    <ResponsiveFunnel
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
    />
    </MainCard>
  )
}

export default SalesFunnel;
