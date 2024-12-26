import { FindOperator } from '@gsbelarus/util-api-types';

export const adjustRelationName = (r: string) => r ? r.replaceAll('$', '_') : '';


export const prepareClause = (clause: object, opt?: { prefix?: string }): { clauseString: string, whereClause: object} => {
  const whereClause = {};
  const prefix = opt?.prefix || 'z';

  const clauseString = Object
    .keys({ ...clause })
    .map(f => {
      if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
        const expression = clause[f] as FindOperator;
        switch (expression.operator) {
          case 'LIKE':
            return ` UPPER(${prefix}.${f}) ${expression.value} `;
          case 'LessThanOrEqual':
            return `${prefix}.${f} ${expression.value}`;
          case 'LessThan':
            return `${prefix}.${f} ${expression.value}`;
          case 'MoreThanOrEqual':
            return `${prefix}.${f} ${expression.value}`;
          case 'MoreThan':
            return `${prefix}.${f} ${expression.value}`;
        }
      }

      whereClause[adjustRelationName(f)] = clause[f];
      return ` z.${f} = :${adjustRelationName(f)}`;
    })
    .join(' AND ');

  return { clauseString, whereClause };
};
