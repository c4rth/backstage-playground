exports.up = async function up(knex) {
  await knex.schema.createTable('mca_metadata', table => {
    table.string('key').notNullable();
    table.string('value').notNullable();
    table.index(['key'], 'mca_metadata_index');
    table.unique(['key'], 'mca_metadata_unique');
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('mca_metadata', table => {
    table.dropIndex(['key'], 'mca_metadata_index');
    table.dropUnique(['key'], 'mca_metadata_unique');
  });
  await knex.schema.dropTable('mca_metadata');
};
