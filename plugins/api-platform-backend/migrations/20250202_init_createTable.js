exports.up = async function up(knex) {
  return await knex.schema.createTable('services', table => {
    table.string('applicationCode').notNullable();
    table.string('service').notNullable();
    table.string('version').notNullable();
    table.string('imageVersion').notNullable();
    table.string('repository').notNullable();
    table.string('sonarQubeProjectKey').notNullable();
    table.text('providedApis');
    table.text('consumedApis');
    table.index(['applicationCode', 'service', 'version', 'imageVersion'], 'defl_service_version_imageVersion_index');
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('services', table => {
    table.dropIndex(['applicationCode', 'service', 'version', 'imageVersion'], 'defl_service_version_imageVersion_index');
  });
  return await knex.schema.dropTable('services');
};