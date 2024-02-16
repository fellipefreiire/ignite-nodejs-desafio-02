// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      meal_date: string
      on_diet: boolean
      user_id: string
      created_at: string
      updated_at: string
    }
    users: {
      id: string
      username: string
      password: string
      created_at: string
      updated_at: string
    }
  }
}
