import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.timestamp('dateHour').notNullable()
    table.boolean('isDiet').defaultTo(false)

    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.uuid('userId').notNullable()
    table.foreign('userId').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
