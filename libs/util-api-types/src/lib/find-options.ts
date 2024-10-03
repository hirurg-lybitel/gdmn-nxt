export type FindOperator = ExpressionLike;

interface BaseExpression {
  operator: 'LIKE' | 'IsNull' | 'IsNotNull' | 'IN';
};

interface ExpressionLike extends BaseExpression {
  value: string
};

interface ExpressionIn extends BaseExpression {
  value: string
};


interface ExpressionIsNull extends BaseExpression {};
interface ExpressionIsNotNull extends BaseExpression {};


export const Like = (value: string): ExpressionLike => ({
  operator: 'LIKE',
  value: ` LIKE '%${value.toUpperCase()}%'`
});

export const In = (value: string[]): ExpressionIn => ({
  operator: 'IN',
  value: ` IN (${value.map(element => element.toUpperCase()).join(',')})`
});

export const IsNull = (): ExpressionIsNull => ({
  operator: 'IsNull'
});

export const IsNotNull = (): ExpressionIsNotNull => ({
  operator: 'IsNotNull'
});
