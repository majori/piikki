exports.up = (knex, Promise) => {
  return knex.schema.alterTable('tokens', (t) => {
    t.boolean('active')
      .defaultTo(true);
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('tokens', (t) => {
    t.dropColumn('active');
  });
};
