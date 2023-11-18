import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('accounts', (table) => {
    table.increments('id').primary();
    table.string('alias').notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.decimal('balance', 14, 3).defaultTo(0);
    table.string('account_number').unique().index();
    table.string('pin');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('accounts');
}
