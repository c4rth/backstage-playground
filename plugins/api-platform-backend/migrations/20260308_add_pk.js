exports.up = async function up(knex) {
  // Clean up duplicate records before altering the table
  await knex.raw(`
    DELETE FROM services
    WHERE ctid NOT IN (
      SELECT MAX(ctid)
      FROM services
      GROUP BY "applicationCode", "service", "version", "imageVersion"
    )
  `);

  // Now that the data is clean, alter the table
  await knex.schema.table('services', table => {
    table.dropIndex(
      ['applicationCode', 'service', 'version', 'imageVersion'],
      'defl_service_version_imageVersion_index',
    );
    table.primary(['applicationCode', 'service', 'version', 'imageVersion']);
  });
};

exports.down = async function (knex) {
  await knex.schema.table('services', table => {
    // To undo, drop the primary key and recreate the index
    table.dropPrimary();
    table.index(
      ['applicationCode', 'service', 'version', 'imageVersion'],
      'defl_service_version_imageVersion_index',
    );
  });
};
