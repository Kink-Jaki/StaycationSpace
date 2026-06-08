import { Hono } from 'hono';
import { db } from '../db'; // Sesuaikan dengan path file konfigurasi db Anda
import { users } from '../db/schema'; // Sesuaikan dengan path file skema Anda
import { eq } from 'drizzle-orm';

const CustomersRoute = new Hono();

//get daa user
CustomersRoute.get('/', async (c) => {
  try {
    const allUsers = await db.select().from(users);
    return c.json(allUsers);
  } catch (error) {
    return c.json({ error: "Gagal mengambil data user" }, 500);
  }
});

//menghapus data user dari id
CustomersRoute.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  try {
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return c.json({ error: "User tidak ditemukan" }, 404);
    }

    return c.json({ message: "User berhasil dihapus", user: deletedUser[0] });
  } catch (error) {
    return c.json({ error: "Gagal menghapus user" }, 500);
  }
});

export default CustomersRoute;