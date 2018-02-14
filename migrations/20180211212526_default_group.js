exports.up = (knex, Promise) => {
  return knex.schema.alterTable('users', (t) => {
    t.foreign('default_group')
      .nullable()
      .references('id')
      .inTable('groups')
      .defaultTo(null);
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('users', (t) => {
    t.dropForeign('default_group');
  });
};
