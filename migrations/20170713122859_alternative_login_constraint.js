exports.up = (knex, Promise) => knex.schema.alterTable('alternative_login', (t) => {
  t.unique(['group_id', 'hashed_key'])
});

exports.down = (knex, Promise) => knex.schema.alterTable('alternative_login', (t) => {
  t.dropUnique(['group_id', 'hashed_key']);
});
