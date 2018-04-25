exports.up = (knex, Promise) => {
  return knex.schema.alterTable('groups', (t) => {
    t.string('password')
      .notNullable()
      .defaultTo('0000');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('groups', (t) => {
    t.dropColumn('password');
  });
};
