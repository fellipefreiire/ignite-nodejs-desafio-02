import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const { username, password } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      username,
      password,
    })

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginUserBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const { username, password } = loginUserBodySchema.parse(request.body)

    const user = await knex('users').where({ username, password }).first()

    if (!user) {
      return reply.status(401).send()
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = user.id

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return reply.status(200).send()
  })

  app.post(
    '/logout',
    {
      preHandler: [checkSessionIdExists],
    },
    async (_, reply) => {
      reply.clearCookie('sessionId', {
        path: '/',
      })

      return reply.status(200).send()
    },
  )
}
