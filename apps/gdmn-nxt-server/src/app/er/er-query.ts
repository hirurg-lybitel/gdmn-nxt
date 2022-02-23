import { Expression, IERModel, IERModelQuery } from "@gsbelarus/util-api-types";

const expression2str = (e: Expression) => {
  if ('type' in e) {
    switch (e.type) {
      case 'FIELD': 
        return `${e.alias}.${e.fieldName}`;

      case 'LIST':  
        if (typeof e.values[0] === 'string') {
          return e.values.map( s => "'" + s + "'" ).join(','); 
        } else {
          return e.values.map( n => n.toString() ).join(',');           
        }
        
      case 'VALUE':
        if (typeof e.value === 'string') {
          return "'" + e.value + "'"; 
        } else {
          return e.value.toString();           
        }        

      case 'QUERY':
        return e.query;        
    }
  }

  switch (e.operator) {
    case 'IN':
    case 'NOT IN':  
      return `${expression2str(e.left)} ${e.operator} (${expression2str(e.right)})`;

    case 'EQ':  
      return `${expression2str(e.left)}=${expression2str(e.right)}`;

    case 'LIKE':  
    case 'AND':  
    case '+':  
      return `${expression2str(e.left)} ${e.operator} ${expression2str(e.right)}`;

    case 'IS NULL':  
    case 'IS NOT NULL':
      return `${expression2str(e.left)} ${e.operator}`;

    case 'EXISTS':
      return `${e.operator} (${expression2str(e.right)})`;
  }
};

export const execQuery = async (q: IERModelQuery, erModel: IERModel) => {
  const fromEntity = erModel.entities[q.from.entityName];

  if (!fromEntity) {
    return {
      error: `Unknown entity ${q.from.entityName}`
    }
  }

  if (!fromEntity.adapter) {
    return {
      error: `No adapter for entity ${q.from.entityName}`
    }
  }

  const fromStrings: string[] = [`${fromEntity.adapter.name} ${fromEntity.adapter.alias}`];

  if (fromEntity.adapter.join) {
    fromEntity.adapter.join?.forEach( j => {
      let s = `${j.type} JOIN ${j.name} ${j.alias}`;
      if (j.condition) {
        s += ` ON ${expression2str(j.condition)}`;
      }
      fromStrings.push(s);
    });
  }
};