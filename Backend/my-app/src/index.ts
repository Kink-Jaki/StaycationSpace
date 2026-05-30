import { Hono } from 'hono'
import {jwt} from 'hono/jwt'

import auth from './routes/auth'

const app = new Hono()

app.route('/auth', auth)

app.use("/profile", jwt({
  secret: "my-super-secret-key",
  alg : "HS256",
}))

app.get('/profile', (c) => {
  const payload = c.get("jwtPayload")
  return c.json(payload)
})

export default { 
  port: 3000, 
  fetch: app.fetch, 
} 
