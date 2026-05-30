import { Hono } from 'hono'
import {jwt} from 'hono/jwt'
import admin from './routes/admin'
import { cors } from "hono/cors";
import auth from './routes/auth'


const app = new Hono()

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);


app.get("/", (c) => {
  return c.json({ message: "API BISAAA" });
})
app.route('/admin', admin) // Import route admin dengan cara require karena menggunakan export default
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
  hostname: "0.0.0.0",
  fetch: app.fetch, 
} 
