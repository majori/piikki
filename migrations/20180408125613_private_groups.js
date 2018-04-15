exports.up = (knex, Promise) => {
  return knex.schema.alterTable('groups', (t) => {
    t.boolean('private')
      .defaultTo(false);
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('groups', (t) => {
    t.dropColumn('private');
  });
};
