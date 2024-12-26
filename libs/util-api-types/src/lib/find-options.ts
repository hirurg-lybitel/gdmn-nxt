export type FindOperator = ExpressionLike;

interface BaseExpression {
  operator:
    'LIKE' |
    'IsNull' |
    'IsNotNull' |
    'IN' |
    'MoreThan' |
    'MoreThanOrEqual' |
    'LessThan' |
    'LessThanOrEqual';
};

interface ExpressionWithValue extends BaseExpression {
  value: string
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

export const MoreThan = (value: string): ExpressionWithValue => ({
  operator: 'MoreThan',
  value: `> '${value}'`
});

export const MoreThanOrEqual = (value: string): ExpressionWithValue => ({
  operator: 'MoreThanOrEqual',
  value: `>= '${value}'`
});

export const LessThan = (value: string): ExpressionWithValue => ({
  operator: 'LessThan',
  value: `< '${value}'`
});

export const LessThanOrEqual = <T>(value: T): ExpressionWithValue => ({
  operator: 'LessThanOrEqual',
  value: `<= '${value}'`
});
