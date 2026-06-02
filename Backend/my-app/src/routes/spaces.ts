import { Hono } from "hono";
import { db } from "../db";
import { spaces } from "../db/schema/spaces";
import { spaceImages } from "../db/schema/space_images";
import { eq } from "drizzle-orm";

import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const app = new Hono();


// =========================
// CREATE SPACE
// =========================
app.post("/", async (c) => {
  const body = await c.req.json();

  const result = await db.insert(spaces).values({
    name: body.name,
    type: body.type,
    description: body.description,
    pricePerHour: body.pricePerHour,
    capacity: body.capacity,
    status: "active",
  }).returning();

  return c.json(result[0]);
});


// =========================
// GET ALL SPACES
// =========================
app.get("/", async (c) => {
  const data = await db.select().from(spaces);
  return c.json(data);
});


// =========================
// GET SPACE BY ID
// =========================
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const data = await db
    .select()
    .from(spaces)
    .where(eq(spaces.id, id));

  return c.json(data[0]);
});


// =========================
// UPDATE SPACE
// =========================
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const updated = await db
    .update(spaces)
    .set({
      name: body.name,
      type: body.type,
      description: body.description,
      capacity: body.capacity,
      status: body.status,
      updatedAt: new Date(),
    })
    .where(eq(spaces.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// DELETE SPACE
// =========================
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  await db.delete(spaces).where(eq(spaces.id, id));

  return c.json({ message: "Space deleted" });
});


// =========================
// UPDATE PRICE ONLY
// =========================
app.patch("/:id/price", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const updated = await db
    .update(spaces)
    .set({
      pricePerHour: body.pricePerHour,
      updatedAt: new Date(),
    })
    .where(eq(spaces.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// UPLOAD IMAGE (LOCAL STORAGE)
// =========================
app.post("/:id/images", async (c) => {
  const spaceId = Number(c.req.param("id"));

  const form = await c.req.formData();
  const file = form.get("file") as File;

  if (!file) {
    return c.json({ message: "File tidak ditemukan" }, 400);
  }

  await mkdir("uploads", { recursive: true }); //cek folder uploads

  const ext = file.name.split(".").pop();
  const fileName = `${randomUUID()}.${ext}`;

  const filePath = path.join("uploads", fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const imageUrl = `http://localhost:3000/uploads/${fileName}`;

  const image = await db.insert(spaceImages).values({
    spaceId,
    imageUrl,
  }).returning();

  return c.json(image[0]);
});

export default app;