
exports.up = async function up(knex) {
    return await knex.schema.createTable('services', table => {
      table.string('service').notNullable();
      table.string('version').notNullable();
      table.string('containerVersion').notNullable();
      table.text('providedApis');
      table.text('consumedApis');
      table.index(['service', 'version', 'containerVersion'], 'service_version_containerVersion_index');
    });
  };
  
  exports.down = async function down(knex) {
    await knex.schema.alterTable('services', table => {
      table.dropIndex(['service', 'version', 'containerVersion'], 'service_version_containerVersion_index');
    });
    return await knex.schema.dropTable('services');
  };