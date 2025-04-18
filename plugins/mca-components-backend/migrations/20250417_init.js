exports.up = async function up(knex) {
  return await knex.schema.createTable('mca', table => {
    table.string('component').notNullable();
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
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('mca', table => {
    table.dropIndex(['component'], 'mca_component_index');
    table.dropUnique(['component'], 'mca_component_unique');
  });
  return await knex.schema.dropTable('mca');
};