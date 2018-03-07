exports.up = (knex, Promise) => {
  return knex.schema.alterTable('users', (t) => {
    t.integer('default_group')
      .references('id')
      .inTable('groups')
      .nullable();
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('users', (t) => {
    t.dropForeign('default_group');
  });
};
