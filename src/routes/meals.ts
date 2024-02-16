import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const meals = await knex('meals')
        .where({
          user_id: sessionId,
        })
        .select()

      return {
        meals,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals').where({ id, user_id: sessionId }).first()

      return {
        meal,
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        mealDate: z.string(),
        onDiet: z.boolean(),
      })

      const { name, description, mealDate, onDiet } =
        createMealBodySchema.parse(request.body)

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        meal_date: mealDate,
        on_diet: onDiet,
        user_id: sessionId,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = updateMealParamsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        mealDate: z.string(),
        onDiet: z.boolean(),
      })

      const { name, description, mealDate, onDiet } =
        updateMealBodySchema.parse(request.body)

      await knex('meals').where({ id, user_id: sessionId }).update({
        name,
        description,
        meal_date: mealDate,
        on_diet: onDiet,
      })

      return reply.status(200).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = deleteMealParamsSchema.parse(request.params)

      await knex('meals').where({ id, user_id: sessionId }).delete()

      return reply.status(200).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const meals = await knex('meals').where({ user_id: sessionId })

      const metrics = meals.reduce(
        (acc, curr) => {
          if (curr.on_diet) {
            acc.totalMealsOnDiet += 1
          } else {
            acc.totalMealsNotOnDiet += 1
          }

          acc.totalMeals += 1

          return acc
        },
        {
          totalMeals: 0,
          totalMealsOnDiet: 0,
          totalMealsNotOnDiet: 0,
        },
      )

      return { metrics }
    },
  )
}
