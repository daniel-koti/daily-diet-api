import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'

export async function checkAuthUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  let { 'user-id': userId } = request.headers

  if (!userId) {
    const userIdAuthenticated = request.cookies.userId
    userId = userIdAuthenticated

    if (!userIdAuthenticated) {
      return reply.status(401).send({
        error: 'User not authenticated',
      })
    }
  }

  const isUserAlreadyExist = await knex('users')
    .select('*')
    .where({ id: String(userId) })
    .first()

  if (!isUserAlreadyExist) {
    return reply.status(404).send({
      error: 'User not founded',
    })
  }

  reply.cookie('userId', String(userId), {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}
