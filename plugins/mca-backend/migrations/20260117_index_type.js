exports.up = async function up(knex) {
  await knex.schema.alterTable('mca_components', table => {
    table.index(['type'], 'mca_component_type_index');
    table.index(['type', 'application_code'], 'mca_component_type_app_index');
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('mca_components', table => {
    table.dropIndex(['type', 'application_code'], 'mca_component_type_app_index');
    table.dropIndex(['type'], 'mca_component_type_index');
  });
};