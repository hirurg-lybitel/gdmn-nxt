import { INLPSentence, INLPToken } from '@gsbelarus/util-api-types';
import { Edge as DagreEdge, graphlib, layout } from 'dagre';
import styles from './nlpsentence-tree.module.less';

interface IRectProps {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly className: string;
};

const Rect = ({ x, y, width, height, text, className }: IRectProps) => {
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g>
      <rect x={x} y={y} rx={4} ry={4} width={width} height={height} className={styles["outerRect"]} />
      <rect x={x + 1} y={y + 1} rx={4} ry={4} width={width - 2} height={height - 2} className={styles[className]} />
      <text x={cx} y={cy + 4} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

interface IEdgeProps {
  points: Array<{ x: number; y: number }>;
};

const Edge = ({ points }: IEdgeProps) => {
  const d = points.reduce((prev, p, idx) => prev + (idx ? 'L ' : 'M ') + p.x + ' ' + p.y + ' ', '');
  return <path d={d} markerStart="url(#arrow2)" />;
};

/* eslint-disable-next-line */
export interface NLPSentenceTreeProps {
  nlpSentence: INLPSentence;
}

export function NLPSentenceTree({ nlpSentence }: NLPSentenceTreeProps) {

  // Create a new directed graph
  const g = new graphlib.Graph();

  // Set an object for the graph label
  g.setGraph({});

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => {
    return {};
  });

  const recurs = (token?: INLPToken) => {
    if (token) {
      const label = token.token;
      g.setNode(token.id.toString(), {
        label,
        width: label.length * 9 + 8,
        height: 26,
        className: 'word'
      });
      nlpSentence.tokens
        .filter( t => t.head?.id === token.id )
        .forEach( t => {
          g.setEdge(token.id.toString(), t.id.toString());
          recurs(t);
        });
    }
  };

  recurs(nlpSentence.tokens.find( t => t.dep === 'ROOT' ));

  g.graph().ranksep = 36;
  g.graph().marginx = 2;
  g.graph().marginy = 2;
  layout(g);

  const makeRect = (n: string, idx: number) => {
    const nd = g.node(n) as any;
    if (!nd) return null;

    const x = nd.x - nd.width / 2;
    const y = nd.y - nd.height / 2;
    return (
      <Rect key={idx} x={x} y={y} width={nd.width} height={nd.height} text={nd.label} className={nd.className} />
    );
  };

  const makeEdge = (e: DagreEdge, idx: number) => <Edge key={idx} points={g.edge(e).points} />;

  return (
    <div className={styles["CommandAndGraph"]}>
      {g.graph() ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={g.graph().width}
          height={g.graph().height}
          viewBox={'0 0 ' + g.graph().width + ' ' + g.graph().height}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" style={{ strokeWidth: '1' }} />
            </marker>
            <marker
              id="arrow2"
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 10 0 L 0 5 L 10 10 Z" style={{ strokeWidth: '1' }} />
            </marker>
          </defs>
          <g>
            {g.nodes().map((n, idx) => makeRect(n, idx))}
            {g.edges().map((e, idx) => makeEdge(e, idx))}
          </g>
        </svg>
      ) : null}
    </div>
  );
};
