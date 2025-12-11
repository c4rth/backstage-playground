exports.up = async function up(knex) {
  await knex.schema.alterTable('services', table => {
    table.text('dependencies');
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('services', table => {
    table.dropColumn('dependencies');
  });
};
