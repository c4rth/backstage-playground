exports.up = async function up(knex) {

  await knex.schema.createTable('mca_components', table => {
    table.string('component').notNullable();
    table.string('type').notNullable();
    table.string('prd_version').notNullable();
    table.string('p1_version').notNullable();
    table.string('p2_version').notNullable();
    table.string('p3_version').notNullable();
    table.string('p4_version').notNullable();
    table.string('application_code').notNullable();
    table.string('package_name').notNullable();
    table.index(['component'], 'mca_component_index');
    table.unique(['component'], 'mca_component_unique');
  });

  await knex.schema.createTable('mca_versions', table => {
    table.string('version').notNullable();
    table.string('p1_version').notNullable();
    table.string('p2_version').notNullable();
    table.string('p3_version').notNullable();
    table.string('p4_version').notNullable();
    table.index(['version'], 'mca_versions_index');
    table.unique(['version'], 'mca_versions_unique');
  });

  await knex.schema.createTable('mca_basetypes', table => {
    table.string('base_type').notNullable();
    table.string('package_name').notNullable();
    table.index(['base_type'], 'mca_basetypes_index');
    table.unique(['base_type'], 'mca_basetypes_unique');
  });

};

exports.down = async function down(knex) {

  await knex.schema.alterTable('mca_components', table => {
    table.dropIndex(['component'], 'mca_component_index');
    table.dropUnique(['component'], 'mca_component_unique');
  });
  await knex.schema.dropTable('mca_components');

  await knex.schema.alterTable('mca_versions', table => {
    table.dropIndex(['version'], 'mca_versions_index');
    table.dropUnique(['version'], 'mca_versions_unique');
  });
  await knex.schema.dropTable('mca_basetypes');

  await knex.schema.alterTable('mca_basetypes', table => {
    table.dropIndex(['base_type'], 'mca_basetypes_index');
    table.dropUnique(['base_type'], 'mca_basetypes_unique');
  });
  await knex.schema.dropTable('mca_basetypes');

};