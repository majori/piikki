exports.up = (knex, Promise) => knex.schema.alterTable('alternative_login', (t) => {
  t.integer('group_id').nullable().alter();
});

exports.down = (knex, Promise) => knex.schema.alterTable('alternative_login', (t) => {
  t.integer('group_id').notNullable().alter();
});
