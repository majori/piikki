const constraintName = 'alternative_login_group_id_hashed_key_unique';

// For some reason mssql set constraint type to "Index"
// if table.unique(['group_id', 'hashed_key']) is used
exports.up = (knex, Promise) => knex.schema.raw(
  `ALTER TABLE alternative_login
  ADD CONSTRAINT ${constraintName}
  UNIQUE (group_id, hashed_key)`
);

exports.down = (knex, Promise) => knex.schema.alterTable('alternative_login', (t) => {
  t.dropUnique(['group_id', 'hashed_key'], constraintName);
});
