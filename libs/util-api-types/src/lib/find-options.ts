export type FindOperator = ExpressionLike;

interface BaseExpression {
  operator: 'LIKE' | 'IsNull' | 'IsNotNull';
};

interface ExpressionLike extends BaseExpression {
  value: string
};

interface ExpressionIsNull extends BaseExpression {};
interface ExpressionIsNotNull extends BaseExpression {};


export const Like = (value: string): ExpressionLike => ({
  operator: 'LIKE',
  value: ` LIKE '%${value.toUpperCase()}%'`
});

export const IsNull = (): ExpressionIsNull => ({
  operator: 'IsNull'
});

export const IsNotNull = (): ExpressionIsNotNull => ({
  operator: 'IsNotNull'
});
