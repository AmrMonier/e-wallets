import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table
      .integer('account_id')
      .unsigned()
      .references('id')
      .inTable('accounts')
      .notNullable();
    table.enum('type', ['deposit', 'withdrawal', 'transfer']).notNullable();
    table.enum('direction', ['in', 'out']);
    table.decimal('amount', 14, 3).notNullable();
    table.string('notes').nullable();
    table
      .integer('related_account_id')
      .unsigned()
      .references('id')
      .inTable('accounts')
      .nullable(); // For transfers
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
