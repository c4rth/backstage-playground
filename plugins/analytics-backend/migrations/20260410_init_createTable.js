export async function up(knex) {
  await knex.schema.createTable('analytics_events', table => {
    table.comment('Stores privacy-compliant analytics events');

    table.bigIncrements('id').primary();

    // Privacy-compliant visitor hash (Daily rotating)
    table.string('visitor_id', 64).notNullable().index();

    // Core Event Fields
    table.string('action').notNullable().index(); // e.g., 'view', 'click'
    table.string('subject').notNullable(); // e.g., page path or search term
    table.float('value').nullable(); // Numeric metrics

    // Flattened Context (Important for filtering)
    table.string('plugin_id').nullable().index();
    table.string('route_ref').nullable().index();
    table.string('extension').nullable();

    // Full JSON Blobs for the rest
    table.jsonb('attributes').nullable();

    // Timing
    table.timestamp('created_at').defaultTo(knex.fn.now()).index();
  });
}

export async function down(knex) {
  await knex.schema.dropTable('analytics_events');
}
