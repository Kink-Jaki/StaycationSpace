import { Hono } from 'hono'
import {jwt} from 'hono/jwt'
import { cors } from "hono/cors";
import auth from './routes/auth'
import analytics from './routes/analytics'
import spaces from './routes/spaces'
import { serveStatic } from 'hono/serve-static'
import { promises as fs } from 'fs'
import { join } from 'path'
import bookings from "./routes/bookings";
import payments from "./routes/payments";
import reviews from "./routes/reviews";
import promos from "./routes/promos";
import profile from "./routes/profile";
import customers from "./routes/customers";
import report from "./routes/report";


const app = new Hono()

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);


app.get("/", (c) => {
  return c.json({ message: "API BISAAA" });
})
app.route('/auth', auth)
app.route('/spaces', spaces)
app.route('/bookings', bookings)
app.route('/payments', payments)
app.route('/reviews', reviews)
app.route('/promos', promos)
app.route("/analytics", analytics)
app.route("/profile", profile)
app.route("/users", customers)
app.route("/reports", report)
app.use("/uploads/*", serveStatic({
  root: "./",
  getContent: async (path) => {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path
    const filePath = join(process.cwd(), normalizedPath)
    const publicFilePath = join(process.cwd(), "public", normalizedPath)
    try {
      return await fs.readFile(filePath)
    } catch {
      try {
        return await fs.readFile(publicFilePath)
      } catch {
        return null
      }
    }
  },
}));
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
