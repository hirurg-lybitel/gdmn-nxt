import { Expression, Entity, IEntities, IERModel, Operand, IEntityAdapter, IJoinAdapter } from "@gsbelarus/util-api-types";
import { getReadTransaction, releaseReadTransaction } from "../db-connection";
import { loadAtFields, loadAtRelationFields, loadAtRelations } from "./at-utils";
import gdbaseRaw from "./gdbase.json";
import { loadRDBFields, loadRDBRelationFields, loadRDBRelations } from "./rdb-utils";

const str2cond = (s: string): (Expression | undefined) => {

  const extractOperand = (s: string): (Operand | Expression) => {
    const expPlus = /(\w+)\s*\+\s*((-{0,1}\d+)|('(.*)'))/ig;
    let res = expPlus.exec(s);

    if (res) {
      return {
        operator: '+',
        left: {
          type: 'FIELD',
          alias: 'z',
          fieldName: res[1]
        },
        right: {
          type: 'VALUE',
          value: res[3] ? Number(res[3]) : res[5]
        }
      }
    } else {
      return {
        type: 'FIELD',
        alias: 'z',
        fieldName: s
      };
    }
  };

  // logical expressions with AND
  const expAnd = /((.+|.+\))\s*)AND(\s*(\(.+|.+))/ig;
  let res = expAnd.exec(s);

  if (res) {
    const left = str2cond(res[2]);
    const right = str2cond(res[4]);
    if (left && right) {
      return {
        operator: 'AND',
        left,
        right
      };
    }
  }

  s = s.trim();

  if (s.charAt(0) === '(' && s.charAt(s.length - 1) === ')') {
    s = s.slice(1, s.length - 1).trim();
  }

  // expressions of equation
  // z.field_name = <NUMBER>
  // z.field_name = <QUOTED STRING>
  const expEqValue = /z\.(\w+)\s*=\s*((-{0,1}\d+)|'(.*)')/ig;
  res = expEqValue.exec(s);
  
  if (res) {
    return {
      operator: 'EQ',
      left: {
        type: 'FIELD',
        alias: 'z',
        fieldName: res[1]
      },
      right: {
        type: 'VALUE',
        value: res[3] ? Number(res[3]) : res[4]
      }
    };
  }
  
  // expressions with IN, NOT IN operators
  // tested set is defined as constants list
  // or result of a query
  const expInValue = /z\.(\w+)\s+(IN|NOT\s+IN)\s*\(\s*(.+)\s*\)/ig;
  res = expInValue.exec(s);
  
  if (res) {
    if (res[3].slice(0, 7).toUpperCase() === 'SELECT ') {
      return {
        operator: res[2].toUpperCase() === 'IN' ? 'IN' : 'NOT IN',
        left: {
          type: 'FIELD',
          alias: 'z',
          fieldName: res[1]
        },
        right: {
          type: 'QUERY',
          query: res[3]
        }
      };
    } else {
      const arr = res[3].split(',').map( i => i.trim() );
      let values;
  
      if (arr[0].charAt(0) === "'") {
        values = arr.map( i => i.slice(1, i.length - 1) );
      } else {
        values = arr.map( i => Number(i) );
      };
  
      return {
        operator: res[2].toUpperCase() === 'IN' ? 'IN' : 'NOT IN',
        left: {
          type: 'FIELD',
          alias: 'z',
          fieldName: res[1]
        },
        right: {
          type: 'LIST',
          values
        }
      };
    }
  }

  // expressions with EXISTS
  const expExists = /EXISTS\s*\((.+)\)/ig;
  res = expExists.exec(s);

  if (res) {
    return {
      operator: 'EXISTS',
      query: res[1]
    };
  }

  const expLikeValue = /z\.(\w+)\s+LIKE\s+'(.+)'/ig;
  res = expLikeValue.exec(s);
  
  if (res) {
    return {
      operator: 'LIKE',
      left: {
        type: 'FIELD',
        alias: 'z',
        fieldName: res[1]
      },
      right: {
        type: 'VALUE',
        value: res[2]
      }
    };
  }

  // expressions IS NULL, IS NOT NULL
  const expIsNULL = /z\.(.+)\s+((IS\s+NOT)|(IS))\s+NULL/ig;
  res = expIsNULL.exec(s);
  
  if (res) {
    if (res[3]) {
      return {
        operator: 'IS NOT NULL',
        left: {
          type: 'FIELD',
          alias: 'z',
          fieldName: res[1]
        },
      };
    } else {
      return {
        operator: 'IS NULL',
        left: extractOperand(res[1])
      };
    }
  }

  console.warn(`unknown condition ${s}`);
  return undefined;
};

interface IgdbaseImport {
  className: string;
  subType?: string;
  abstract?: boolean;
  displayName?: string;
  listTable?: { name: string; pk?: string };
  distinctRelation?: { name: string; pk?: string };
  restrictCondition?: string;
  semCategory?: string;
  children?: IgdbaseImport[];
};

export const importERModel = async () => {
  const t = new Date().getTime();
  const { attachment, transaction } = await getReadTransaction('rdb');
  try {
    const [f, r, rf, af, ar, arf] = await Promise.all([
      loadRDBFields(attachment, transaction), 
      loadRDBRelations(attachment, transaction),
      loadRDBRelationFields(attachment, transaction),
      loadAtFields(attachment, transaction),
      loadAtRelations(attachment, transaction),
      loadAtRelationFields(attachment, transaction),
    ]);

    const gdbase = gdbaseRaw as IgdbaseImport;
    const entities: IEntities = {};

    const importGdbase = (g: IgdbaseImport, depth = 0, parent?: Entity) => {
      const rdbRelation = g.listTable ? r[g.listTable.name] : undefined;

      let adapter: IEntityAdapter;

      if (g.listTable) {        
        adapter = {
          name: g.listTable.name, 
          alias: 'z'
        };

        if (parent?.adapter?.join) {
          adapter.join = [...parent.adapter.join];
        }

        if (g.distinctRelation) {
          const j = {
            type: 'INNER',
            name: g.distinctRelation.name,
            alias: `z${depth}`
          } as IJoinAdapter;

          if (adapter.join) {
            adapter.join.push(j);
          } else {
            adapter.join = [j];
          }
        }

        if (g.restrictCondition) {
          adapter.condition = str2cond(g.restrictCondition);
        }
      }

      const e: Entity = {
        parent: parent?.name,
        name: g.className,
        abstract: g.abstract,
        attributes: [],
        adapter
      };

      entities[e.name] = e;

      if (g.children) {
        for (const ch of g.children) {
          importGdbase(ch, g.abstract ? 1 : (depth + 1), e);
        }
      }
    };

    importGdbase(gdbase);

    console.log(`ERModel imported in ${new Date().getTime() - t}ms`);

    return { entities } as IERModel;
  } finally {
    releaseReadTransaction('rdb');
  }  
};