import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkAuthUser } from '../middlewares/check-auth-user'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkAuthUser] }, async (request) => {
    const userId = request.cookies.userId

    const meals = await knex('meals').select('*').where({
      userId,
    })

    return {
      meals,
    }
  })

  app.delete('/', { preHandler: [checkAuthUser] }, async (request, reply) => {
    const deleteMealBodySchema = z.object({
      id: z.string(),
    })

    const userId = request.cookies.userId

    const { id } = deleteMealBodySchema.parse(request.body)

    const isUserAuthorizedToDelete = await knex('meals')
      .select('*')
      .where({
        id,
        userId,
      })
      .first()

    if (!isUserAuthorizedToDelete) {
      return reply.status(401).send({
        error: 'Meal not found',
      })
    }

    await knex('meals').delete().where({
      id: isUserAuthorizedToDelete.id,
    })

    return reply.status(200).send()
  })

  app.put('/', { preHandler: [checkAuthUser] }, async (request, reply) => {
    const updateMealBodySchema = z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      dateHour: z.string(),
      isDiet: z.number(),
    })

    const userId = request.cookies.userId

    const { id, name, description, dateHour, isDiet } =
      updateMealBodySchema.parse(request.body)

    const isUserAuthorizedToDelete = await knex('meals')
      .select('*')
      .where({
        id,
        userId,
      })
      .first()
      .update({
        id,
        name,
        description,
        dateHour,
        isDiet,
      })

    if (!isUserAuthorizedToDelete) {
      return reply.status(401).send({
        error: 'Meal not found',
      })
    }

    return reply.status(200).send()
  })

  app.post('/', { preHandler: [checkAuthUser] }, async (request, reply) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateHour: z.string(),
      isDiet: z.number(),
    })

    const { name, description, dateHour, isDiet } = createMealsBodySchema.parse(
      request.body,
    )

    const userId = request.cookies.userId

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      dateHour,
      isDiet,
      userId,
    })

    return reply.status(201).send()
  })

  app.get('/:id', { preHandler: [checkAuthUser] }, async (request) => {
    const getMealParamSchema = z.object({
      id: z.string(),
    })

    const userId = request.cookies.userId
    const { id } = getMealParamSchema.parse(request.params)

    const meal = await knex('meals')
      .select('*')
      .where({
        id,
        userId,
      })
      .first()

    return {
      meal,
    }
  })

  app.get('/metrics', { preHandler: [checkAuthUser] }, async (request) => {
    const userId = request.cookies.userId

    const meals = await knex('meals').select('*').where({
      userId,
    })

    const mealsAmount = meals.length

    const mealsInDiet = meals.filter((meal) => {
      return meal.isDiet === 1
    }).length

    const mealsNotInDiet = meals.filter((meal) => meal.isDiet === 0).length

    return {
      mealsAmount,
      mealsInDiet,
      mealsNotInDiet,
    }
  })
}
