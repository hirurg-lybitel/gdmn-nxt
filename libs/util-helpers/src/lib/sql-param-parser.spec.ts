import { parseParams } from './sql-param-parser';

describe('Parameters parser tests', () => {
	test('no params in sql', () => {
		[
			'SELECT id FROM some_table WHERE id > 0',
			'',
			'\n',
			'\n\n',
			'SELECT \':this_is_not_param\' FROM some_table WHERE id > 0',
			'SELECT /* :this_is_not_param */ FROM some_table WHERE id > 0',
			'SELECT id FROM some_table WHERE id > 0 --:this_is_not_param'
		].forEach( q => {
			expect(parseParams(q).paramNames).toBeUndefined();
			expect(parseParams(q).sqlStmt).toEqual(q);
		});
	});

	test('named params', () => {
		let p = parseParams('SELECT id FROM some_table WHERE id = :id');
		expect(p.paramNames).toEqual(['id']);
		expect(p.sqlStmt).toEqual('SELECT id FROM some_table WHERE id = ?');

		p = parseParams('SELECT :id FROM some_table WHERE id = :id');
		expect(p.paramNames).toEqual(['id', 'id']);
		expect(p.sqlStmt).toEqual('SELECT ? FROM some_table WHERE id = ?');

		p = parseParams('SELECT :name FROM some_table WHERE id > :start_id AND id < :end_id');
		expect(p.paramNames).toEqual(['name', 'start_id', 'end_id']);
		expect(p.sqlStmt).toEqual('SELECT ? FROM some_table WHERE id > ? AND id < ?');

		p = parseParams(`
      EXECUTE BLOCK (ID INTEGER = :ID)
      RETURNS(
        NAME TYPE OF COLUMN GD_CONTACT.NAME
      )
      AS
      BEGIN
        FOR SELECT NAME
        FROM GD_CONTACT
        WHERE ID != :ID
        ROWS 10
        INTO :NAME
        DO
          SUSPEND;
      END`);
		expect(p.paramNames).toEqual(['ID']);
		expect(p.sqlStmt).toEqual(`
      EXECUTE BLOCK (ID INTEGER = ?)
      RETURNS(
        NAME TYPE OF COLUMN GD_CONTACT.NAME
      )
      AS
      BEGIN
        FOR SELECT NAME
        FROM GD_CONTACT
        WHERE ID != :ID
        ROWS 10
        INTO :NAME
        DO
          SUSPEND;
      END`);

		p = parseParams(`EXECUTE BLOCK(ID INTEGER=:ID,ID2 INTEGER=:ID,LB INTEGER=:LB) AS BEGIN SUSPEND;END`);
		expect(p.paramNames).toEqual(['ID', 'ID', 'LB']);
		expect(p.sqlStmt).toEqual(`EXECUTE BLOCK(ID INTEGER=?,ID2 INTEGER=?,LB INTEGER=?) AS BEGIN SUSPEND;END`);
	});
});
