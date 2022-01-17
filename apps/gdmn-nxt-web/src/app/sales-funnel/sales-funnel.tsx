import './sales-funnel.module.less';
import { FunnelGraph } from '@trutoo/funnel-graph';
import React from 'react';
import { useSelector } from 'react-redux';
import { customersSelectors } from '../features/customer/customerSlice';

/* eslint-disable-next-line */
export interface SalesFunnelProps {}

export function SalesFunnel(props: SalesFunnelProps) {

  const customersTotal = useSelector(customersSelectors.selectTotal);

  const myFunnelGraph = new FunnelGraph({
    container: '.funnel', // or reference to an Element
    data: {
      labels: ['Impressions', 'Add To Cart', 'Buy'],
      colors: ['orange', 'red'],
      values: [12000, 5700, 360],
    },
  });
  console.log('char', myFunnelGraph);

  const html = '<h1>Hello, world!</h1>'

//   function iframe() {
//     return {
//         __html: '<iframe src="D:/Git/funnel-graph/examples/example.html" width="10040" height="850"></iframe>'
//     }
// }

//   return (
//     <div dangerouslySetInnerHTML={iframe()} />
//     //React.createElement("h1", {dangerouslySetInnerHTML: {__html: html}})
//   );

const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
}



  return (
    <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
      <svg id="d3-funnel-iChT-gyE5G_C_qzWubqfZ" width="320" height="400" >
		<g>
		  <path fill="#1f77b4" d="M0,0 L320,0 L261.84397163120565,205 L58.15602836879433,205 L0,0"></path>
      <text x="160" y="102.5" fill="#fff" font-size="14px" text-anchor="middle" dominant-baseline="middle" pointer-events="none">
        <tspan x="160" dy="-10">Клиенты</tspan>
        <tspan x="160" dy="20">{getRandom(20000, 50000).toLocaleString()}</tspan>
      </text>
		</g>
		<g>
		  <path fill="#ff7f0e" d="M58.15602836879433,205 L261.84397163120565,205 L237.73049645390068,290 L82.26950354609929,290 L58.15602836879433,205"></path>
      <text x="160" y="247.5" fill="#fff" font-size="14px" text-anchor="middle" dominant-baseline="middle" pointer-events="none">
        <tspan x="160" dy="-10">Связались</tspan>
        <tspan x="160" dy="20">{getRandom(3600, 10000).toLocaleString()}</tspan>
      </text>
    </g>
		<g>
      <path fill="#2ca02c" d="M82.26950354609929,290 L237.73049645390068,290 L219.99999999999997,352.5 L100,352.5 L82.26950354609929,290"></path>
      <text x="160" y="321.25" fill="#fff" font-size="14px" text-anchor="middle" dominant-baseline="middle" pointer-events="none">
        <tspan x="160" dy="-10">Запросили счёт</tspan>
        <tspan x="160" dy="20">{getRandom(2100, 3500).toLocaleString()}</tspan>
      </text>
    </g>
		<g>
      <path fill="#d62728" d="M100,352.5 L219.99999999999997,352.5 L219.99999999999997,400 L100,400 L100,352.5"></path>
      <text x="160" y="376.25" fill="#fff" font-size="14px" text-anchor="middle" dominant-baseline="middle" pointer-events="none">
        <tspan x="160" dy="-10">Оплачено</tspan>
        <tspan x="160" dy="20">{getRandom(900, 2000).toLocaleString()}</tspan>
      </text>
		</g>
		</svg>
    </div>
  );
}

export default SalesFunnel;
