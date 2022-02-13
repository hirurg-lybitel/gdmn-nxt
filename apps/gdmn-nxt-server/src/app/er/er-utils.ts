import { Expression, Entity, IEntities, IERModel, Operand, IEntityAdapter, IJoinAdapter, IDomains, IEntity, Domain, IDomainBase } from "@gsbelarus/util-api-types";
import { userInfo } from "os";
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

const getEntityScore = (e: IEntity, refTable: string) => {
  const joinScore = e.adapter?.join?.findIndex( j => j.type === 'INNER' && j.name === refTable );

  if (joinScore !== undefined) {
    return joinScore + 1;
  }

  return e.adapter?.name === refTable ? 0 : -1;
};

const extractNumDef = (s: string | null | undefined) => {
  if (!s) {
    return undefined;
  }

  const numDef = /DEFAULT\s+(('(.+)')|(.+))/ig;
  const res = numDef.exec(s);
  const num = Number(res[3] ?? res[4]);

  if (isNaN(num)) {
    return undefined;
  }

  return num;
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
    const backwardCache = {} as { [relation: string]: string };
    const entities: IEntities = {};

    const importGdbase = (g: IgdbaseImport, depth = 0, parent?: Entity) => {
      const rdbRelation = g.listTable ? r[g.listTable.name] : undefined;
      const atRelation = rdbRelation ? ar[rdbRelation.RDB$RELATION_NAME] : undefined;

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
          backwardCache[g.distinctRelation.name] = g.className;

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
        } else {
          backwardCache[g.listTable.name] = g.className;
        }

        if (g.restrictCondition) {
          adapter.condition = str2cond(g.restrictCondition);
        }
      };

      const e: Entity = {
        parent: parent?.name,
        name: g.className,
        abstract: g.abstract,
        attributes: [],
        semCategory: atRelation?.SEMCATEGORY ?? undefined,
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

    const usrRelations = Object.values(ar).filter( r => r.RELATIONNAME.slice(0, 4) === 'USR$' );

    for (const usrRelation of usrRelations) {
      const hasID = arf[usrRelation.RELATIONNAME].find( f => f.FIELDNAME === 'ID');
      const hasLB = arf[usrRelation.RELATIONNAME].find( f => f.FIELDNAME === 'LB');
      const hasParent = arf[usrRelation.RELATIONNAME].find( f => f.FIELDNAME === 'PARENT');

      if (hasID) {
        const parent = hasLB ?
          entities['TgdcAttrUserDefinedLBRBTree']
          : hasParent ?
          entities['TgdcAttrUserDefinedTree']
          : 
          entities['TgdcAttrUserDefined'];

        if (parent) {
          const name = parent.name + usrRelation.RELATIONNAME.replaceAll('$', '_');  
  
          entities[name] = {
            parent: parent.name,
            name,
            attributes: [],
            semCategory: usrRelation.SEMCATEGORY ?? undefined,
            adapter: {
              name: usrRelation.RELATIONNAME,
              alias: 'z'
            }
          };  
        }  
      }
    }

    const domains: IDomains = {};
         
    for (const atField of Object.values(af)) {
      const { FIELDNAME, LNAME, READONLY, VISIBLE } = atField;
      const { 
        REFTABLE, REFLISTFIELD, REFCONDITION, 
        SETTABLE, SETLISTFIELD, SETCONDITION,
        GDCLASSNAME, GDSUBTYPE, NUMERATION 
      } = atField;

      let relation, listField, condition;

      if (REFTABLE) {
        relation = REFTABLE;
        listField = REFLISTFIELD ?? undefined;
        condition = REFCONDITION ?? undefined;
      } else if (SETTABLE) {
        relation = SETTABLE;
        listField = SETLISTFIELD ?? undefined;
        condition = SETCONDITION ?? undefined;
      }

      if (relation) {
        let entityName;
        
        if (GDCLASSNAME) {
          const fullGdcClassName = `${GDCLASSNAME}${GDSUBTYPE ? ('\\' + GDSUBTYPE) : ''}`;
          entityName = entities[fullGdcClassName]?.name;
        } 

        if (!entityName) {
          const found = Object.values(entities).filter( e => 
            e.adapter?.join?.find( j => j.type === 'INNER' && j.name === relation )
            ||
            e.adapter?.name === relation
          );

          if (found.length === 1) {
            entityName = found[0].name;
          } 
          else if (found.length) {
            const sorted = found.sort( 
              (a, b) => getEntityScore(a, relation) - getEntityScore(b, relation) 
            );
            entityName = sorted[0].name;
          }
        }
        
        if (entityName) {
          domains[FIELDNAME] = {
            name: FIELDNAME,
            lName: LNAME,
            type: REFTABLE ? 'ENTITY' : 'ENTITY[]',
            entityName,
            visible: VISIBLE ? true : undefined,
            readonly: READONLY ? true : undefined,
            adapter: {
              name: FIELDNAME,
              relation,
              listField,
              condition
            }
          };
        }
      } else {
        const rdbField = f[FIELDNAME];

        if (!rdbField) {
          console.warn(`Unknown domain ${FIELDNAME}`);
        } else {
          const domainBase: IDomainBase = {
            name: FIELDNAME,
            lName: LNAME,
            visible: VISIBLE ? true : undefined,
            readonly: READONLY ? true : undefined,
            required: rdbField.RDB$NULL_FLAG ? true : undefined,
            validationSource: rdbField.RDB$VALIDATION_SOURCE ?? undefined,
            adapter: {
              name: rdbField.RDB$FIELD_NAME
            }
          };

          let domain: Domain;

          if (rdbField.RDB$FIELD_PRECISION) {
            domain = {
              ...domainBase,
              type: 'NUMERIC',
              max: Number.MAX_SAFE_INTEGER,
              min: Number.MIN_SAFE_INTEGER,
              precision: rdbField.RDB$FIELD_PRECISION,
              scale: rdbField.RDB$FIELD_SCALE,
              default: extractNumDef(rdbField.RDB$DEFAULT_SOURCE)
            };
          } else if (NUMERATION) {
            domain = {
              ...domainBase,
              type: 'ENUM'
            };
          } else {
            switch (rdbField.RDB$FIELD_TYPE) {
              case 8:
                domain = {
                  ...domainBase,
                  type: 'INTEGER',
                  max: 2_147_483_647,
                  min: -2_147_483_648,
                  default: extractNumDef(rdbField.RDB$DEFAULT_SOURCE)
                };
                break;
  
              case 7:
                domain = {
                  ...domainBase,
                  type: 'INTEGER',
                  max: 32_767,
                  min: -32_768,
                  default: extractNumDef(rdbField.RDB$DEFAULT_SOURCE)
                };
                break;
  
              case 10:
                domain = {
                  ...domainBase,
                  type: 'DOUBLE',
                  max: 1.79E+38,
                  min: -1.79E+38,
                  default: extractNumDef(rdbField.RDB$DEFAULT_SOURCE)
                };
                break;
  
              case 12:
                domain = {
                  ...domainBase,
                  type: 'DATE',
                  default: rdbField.RDB$DEFAULT_SOURCE ?? undefined
                };
                break;
  
              case 13:
                domain = {
                  ...domainBase,
                  type: 'TIME',
                  default: rdbField.RDB$DEFAULT_SOURCE ?? undefined
                };
                break;
  
              case 14:
              case 37:  
                domain = {
                  ...domainBase,
                  type: 'STRING',
                  maxLen: rdbField.RDB$CHARACTER_LENGTH ?? rdbField.RDB$FIELD_LENGTH,
                  charSetId: rdbField.RDB$CHARACTER_SET_ID,
                  default: rdbField.RDB$DEFAULT_SOURCE ?? undefined
                };
                break;
  
              case 16:
                domain = {
                  ...domainBase,
                  type: 'BIGINT',
                  max: Number.MAX_SAFE_INTEGER, //TODO: need changing to BigInt class
                  min: Number.MIN_SAFE_INTEGER,
                  default: extractNumDef(rdbField.RDB$DEFAULT_SOURCE)
                };
                break;  
  
              case 27:
                domain = {
                  ...domainBase,
                  type: 'DOUBLE',
                  max: 3.40E+308,
                  min: -3.40E+308,
                  default: extractNumDef(rdbField.RDB$DEFAULT_SOURCE)
                };
                break;
  
              case 35:
                domain = {
                  ...domainBase,
                  type: 'TIMESTAMP',
                  default: rdbField.RDB$DEFAULT_SOURCE ?? undefined
                };
                break;
  
              //TODO: treat text BLOBs as strings?  
              case 261:
                domain = {
                  ...domainBase,
                  type: 'BLOB',
                  subType: rdbField.RDB$FIELD_SUB_TYPE
                };
                break;
            }
          }

          if (domain) {
            domains[FIELDNAME] = domain;
          }
        }
      }
    }

    for (const entity of Object.values(entities)) {
      if (!entity.adapter) {
        continue;
      }

      const atRelationFields = arf[entity.adapter.name];

      if (!atRelationFields) {
        console.warn(`No fields definitions for ${entity.adapter.name} found`);
        continue;
      }

      for (const fld of atRelationFields) {
        const domain = domains[fld.FIELDSOURCE];

        if (!domain) {
          console.warn(`Domain ${fld.FIELDSOURCE} has not been found for the field ${entity.adapter.name}.${fld.FIELDNAME}`);
          continue;  
        }
      }
    }

    console.log(`ERModel imported in ${new Date().getTime() - t}ms`);

    return { 
      domains,
      entities 
    } as IERModel;
  } finally {
    releaseReadTransaction('rdb');
  }  
};