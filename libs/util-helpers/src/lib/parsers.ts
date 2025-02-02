import { FindOperator } from '@gsbelarus/util-api-types';

export const adjustRelationName = (r: string) => r ? r.replaceAll('$', '_') : '';


export const prepareClause = (clause: object, opt?: { prefix?: (fieldName: string) => string }): { clauseString: string, whereClause: object} => {
  const whereClause = {};
  const getPrefix = opt?.prefix ?? (f => 'z');

  const clauseString = Object
    .keys({ ...clause })
    .map(f => {
      if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
        const expression = clause[f] as FindOperator;
        switch (expression.operator) {
          case 'LIKE':
            return ` UPPER(${getPrefix(f)}.${f}) ${expression.value} `;
          case 'LessThanOrEqual':
            return `${getPrefix(f)}.${f} ${expression.value}`;
          case 'LessThan':
            return `${getPrefix(f)}.${f} ${expression.value}`;
          case 'MoreThanOrEqual':
            return `${getPrefix(f)}.${f} ${expression.value}`;
          case 'MoreThan':
            return `${getPrefix(f)}.${f} ${expression.value}`;
          case 'IN':
            return `${getPrefix(f)}.${f} ${expression.value}`;
          case 'Between':
            return `${getPrefix(f)}.${f} ${expression.value}`;
          default:
            return `${getPrefix(f)}.${f} ${expression.value}`;
        }
      }

      whereClause[adjustRelationName(f)] = clause[f];
      return `${getPrefix(f)}.${f} = :${adjustRelationName(f)}`;
    })
    .join(' AND ');

  return { clauseString, whereClause };
};
