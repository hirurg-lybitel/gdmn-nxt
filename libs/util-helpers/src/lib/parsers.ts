import { FindOperator } from '@gsbelarus/util-api-types';

export const adjustRelationName = (r: string) => r ? r.replaceAll('$', '_') : '';


export const prepareClause = (clause: object, opt?: { prefix?: (fieldName: string) => string; operator?: 'AND' | 'OR'; }): { clauseString: string, whereClause: object; } => {
  let whereClause = {};
  const getPrefix = opt?.prefix ?? (f => 'z');
  const operator = opt?.operator ?? 'AND';

  const clauseString = Object
    .keys({ ...clause })
    .map(f => {
      const value = clause[f];
      if (typeof value === 'object') {
        if (f === '$OR') {
          let orWhereClause = {};
          let orsql = '';
          value.forEach((item) => {
            const { clauseString, whereClause } = prepareClause(item, { prefix: getPrefix, operator: 'OR' });
            orsql += `(${clauseString})`;
            orWhereClause = { ...orWhereClause, ...whereClause };
          });
          whereClause = { ...whereClause, ...orWhereClause };
          return orsql;
        }
        if ('operator' in value) {
          const expression = value as FindOperator;
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
            case 'NotEqual': {
              whereClause[adjustRelationName(f)] = expression.value;
              return `${getPrefix(f)}.${f} != :${adjustRelationName(f)}`;
            }
            case 'IsNotNull':
              return `${getPrefix(f)}.${f} IS NOT NULL`;
            case 'IsNull':
              return `${getPrefix(f)}.${f} IS NULL`;
            default:
              return `${getPrefix(f)}.${f} ${expression.value}`;
          }
        }
      }

      whereClause[adjustRelationName(f)] = value;
      return `${getPrefix(f)}.${f} = :${adjustRelationName(f)}`;
    })
    .join(` ${operator} `);

  return { clauseString, whereClause };
};
