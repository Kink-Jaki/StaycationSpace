import { Hono } from "hono";
import { db } from "../db";
import { spaces } from "../db/schema/spaces";
import { spaceImages } from "../db/schema/space_images";
import { eq } from "drizzle-orm";

import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { adminOnly } from "../middleware/role";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();


// =========================
// CREATE SPACE
// =========================
app.post("/", authMiddleware, adminOnly, async (c) => {
  const body = await c.req.parseBody();

  const result = await db.insert(spaces).values([{
    name: body.name as string,
    type: body.type as "studio" | "villa" | "hall" | "other",
    description: body.description as string,
    pricePerHour: body.pricePerHour as string,
    capacity: body.capacity ? Number(body.capacity) : null,
    address: body.address as string,
    deposit: body.deposit as string,
    status: "active",
  }]).returning();

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
app.put("/:id", authMiddleware, adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();

  const updated = await db
    .update(spaces)
    .set({
      name: body.name as string,
      type: body.type as "studio" | "villa" | "hall" | "other",
      description: body.description as string,
      capacity: body.capacity ? Number(body.capacity) : null,
      status: body.status as "active" | "inactive",
      address: body.address as string,
      deposit: body.deposit as string,
      updatedAt: new Date(),
    })
    .where(eq(spaces.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// DELETE SPACE
// =========================
app.delete("/:id", authMiddleware, adminOnly, async (c) => {
  const id = Number(c.req.param("id"));

  await db.delete(spaces).where(eq(spaces.id, id));

  return c.json({ message: "Space deleted" });
});


// =========================
// UPDATE PRICE ONLY
// =========================
app.patch("/:id/price", authMiddleware, adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();

  const updated = await db
    .update(spaces)
    .set({
      pricePerHour: body.pricePerHour as string,
      updatedAt: new Date(),
    })
    .where(eq(spaces.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// UPLOAD IMAGE (LOCAL STORAGE)
// =========================
app.post(
  "/:id/images",
  authMiddleware,
  adminOnly,
  async (c) => {

    const spaceId = Number(
      c.req.param("id")
    );

    // cek space ada atau tidak
    const existingSpace = await db
      .select()
      .from(spaces)
      .where(eq(spaces.id, spaceId));

    if (!existingSpace[0]) {
      return c.json(
        { message: "Space tidak ditemukan" },
        404
      );
    }

    const form = await c.req.formData();

    // support multiple upload
    const files = form.getAll("files") as File[];

    if (!files.length) {
      return c.json(
        { message: "File tidak ditemukan" },
        400
      );
    }

    // bikin folder uploads otomatis
    await mkdir("uploads", {
      recursive: true,
    });

    const uploadedImages = [];

    for (const file of files) {

      // validasi image
      if (
        !file.type.startsWith("image/")
      ) {
        continue;
      }

      const ext = file.name
        .split(".")
        .pop();

      const fileName =
        `${randomUUID()}.${ext}`;

      const filePath = path.join(
        "uploads",
        fileName
      );

      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      await writeFile(
        filePath,
        buffer
      );

      // path frontend
      const imageUrl =
        `/uploads/${fileName}`;

      // save database
      const image =
        await db
          .insert(spaceImages)
          .values({
            spaceId,
            imageUrl,
          })
          .returning();

      uploadedImages.push(
        image[0]
      );
    }

    return c.json({
      message:
        "Upload berhasil",
      data: uploadedImages,
    });
  }
);

// =========================
// GET IMAGES BY SPACE ID
// =========================
app.get("/:id/images", async (c) => {
  const spaceId = Number(c.req.param("id"));

  const images = await db
    .select()
    .from(spaceImages)
    .where(eq(spaceImages.spaceId, spaceId));

  return c.json(images);
});

export default app;