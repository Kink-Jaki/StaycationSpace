import { Hono } from "hono";
import { db } from "../db";
import { spaces } from "../db/schema/spaces";
import { spaceImages } from "../db/schema/space_images";
import { eq } from "drizzle-orm";
import { writeFile, unlink, mkdir } from "fs/promises";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { adminOnly } from "../middleware/role";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// Mendefinisikan folder uploads dengan path absolut agar tidak menumpuk di tempat yang salah
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
 
// Helper: Menghapus file fisik dari server
async function deleteImageFiles(images: { imageUrl: string }[]) {
  for (const img of images) {
    try {
      // Mengambil nama file dari path (misal: "/uploads/xyz.jpg" -> "xyz.jpg")
      const fileName = img.imageUrl.split("/").pop();
      if (!fileName) continue;

      const filePath = path.join(UPLOAD_DIR, fileName);

      // Cek eksistensi sebelum unlink
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
        console.log(`[DELETED] File fisik terhapus: ${fileName}`);
      } else {
        console.warn(`[NOT FOUND] File tidak ada di server, skip: ${fileName}`);
      }
    } catch (err) {
      console.error(`[ERROR] Gagal menghapus file: ${img.imageUrl}`, err);
    }
  }
}

// =========================
// CRUD SPACES
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

app.get("/", async (c) => {
  const data = await db.select().from(spaces);
  return c.json(data);
});

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const data = await db.select().from(spaces).where(eq(spaces.id, id));
  return c.json(data[0]);
});

app.put("/:id", authMiddleware, adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();
  const updated = await db.update(spaces).set({
    name: body.name as string,
    type: body.type as "studio" | "villa" | "hall" | "other",
    description: body.description as string,
    capacity: body.capacity ? Number(body.capacity) : null,
    status: body.status as "active" | "inactive",
    address: body.address as string,
    deposit: body.deposit as string,
    pricePerHour: body.pricePerHour as string,
    updatedAt: new Date(),
  }).where(eq(spaces.id, id)).returning();
  return c.json(updated[0]);
});

app.delete("/:id", authMiddleware, adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  // Hapus semua foto dulu agar tidak jadi orphan
  const images = await db.select().from(spaceImages).where(eq(spaceImages.spaceId, id));
  await deleteImageFiles(images);
  
  await db.delete(spaceImages).where(eq(spaceImages.spaceId, id));
  await db.delete(spaces).where(eq(spaces.id, id));

  return c.json({ message: "Space dan semua gambar terkait telah dihapus" });
});

// =========================
// UPLOAD & IMAGE MANAGEMENT
// =========================

app.post("/:id/images", authMiddleware, adminOnly, async (c) => {
  const spaceId = Number(c.req.param("id"));
  const form = await c.req.formData();
  const files = form.getAll("files") as File[];

  if (!files.length) return c.json({ message: "File tidak ditemukan" }, 400);

  // Pastikan folder ada
  await mkdir(UPLOAD_DIR, { recursive: true });
  
  const uploadedImages = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    
    const fileName = `${randomUUID()}.${file.name.split(".").pop()}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

    const image = await db.insert(spaceImages).values({
      spaceId,
      imageUrl: `/uploads/${fileName}`,
    }).returning();

    uploadedImages.push(image[0]);
  }

  return c.json({ message: "Upload berhasil", data: uploadedImages });
});

app.get("/:id/images", async (c) => {
  const spaceId = Number(c.req.param("id"));
  const images = await db.select().from(spaceImages).where(eq(spaceImages.spaceId, spaceId));
  return c.json(images);
});

app.delete("/:id/images", authMiddleware, adminOnly, async (c) => {
  const spaceId = Number(c.req.param("id"));
  const images = await db.select().from(spaceImages).where(eq(spaceImages.spaceId, spaceId));
  
  await deleteImageFiles(images);
  await db.delete(spaceImages).where(eq(spaceImages.spaceId, spaceId));

  return c.json({ message: "Semua gambar telah dihapus dari server" });
});

app.put("/:id/images", authMiddleware, adminOnly, async (c) => {
  const spaceId = Number(c.req.param("id"));

  // cek space ada atau tidak
  const space = await db
    .select()
    .from(spaces)
    .where(eq(spaces.id, spaceId));

  if (!space.length) {
    return c.json({ message: "Space tidak ditemukan" }, 404);
  }

  const form = await c.req.formData();
  const files = form.getAll("files") as File[];

  if (!files.length) {
    return c.json({ message: "Tidak ada file yang diupload" }, 400);
  }

  // =========================
  // HAPUS GAMBAR LAMA
  // =========================

  const oldImages = await db
    .select()
    .from(spaceImages)
    .where(eq(spaceImages.spaceId, spaceId));

  await deleteImageFiles(oldImages);

  await db
    .delete(spaceImages)
    .where(eq(spaceImages.spaceId, spaceId));

  // =========================
  // UPLOAD GAMBAR BARU
  // =========================

  await mkdir(UPLOAD_DIR, { recursive: true });

  const uploadedImages = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const ext = file.name.split(".").pop();

    const fileName = `${randomUUID()}.${ext}`;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    await writeFile(
      path.join(UPLOAD_DIR, fileName),
      buffer
    );

    const image = await db
      .insert(spaceImages)
      .values({
        spaceId,
        imageUrl: `/uploads/${fileName}`,
      })
      .returning();

    uploadedImages.push(image[0]);
  }

  return c.json({
    message: "Gambar berhasil diperbarui",
    data: uploadedImages,
  });
});

export default app;