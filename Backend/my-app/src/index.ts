import { Hono } from 'hono'
import {jwt} from 'hono/jwt'
import admin from './routes/admin'
import { cors } from "hono/cors";
import auth from './routes/auth'
import analytics from './routes/analytics'
import spaces from './routes/spaces'
import { serveStatic } from 'hono/serve-static'
import { promises as fs } from 'fs'
import { join } from 'path'
import bookings from "./routes/bookings";
import payments from "./routes/payments";


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
app.route('/admin', admin) 
app.route('/auth', auth)
app.route('/spaces', spaces)
app.route('/bookings', bookings)
app.route('/payments', payments)
app.use("/uploads/*", serveStatic({
  root: "./",
  getContent: async (path) => {
    const filePath = join(process.cwd(), path.startsWith("/") ? path.slice(1) : path)
    try {
      return await fs.readFile(filePath)
    } catch {
      return null
    }
  },
}));
app.use("/profile", jwt({
  secret: "my-super-secret-key",
  alg : "HS256",
}))

app.route("/analytics", analytics);

app.get('/profile', (c) => {
  const payload = c.get("jwtPayload")
  return c.json(payload)
})

export default { 
  port: 3000, 
  hostname: "0.0.0.0",
  fetch: app.fetch, 
} 
