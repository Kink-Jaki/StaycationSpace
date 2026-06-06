import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  bookings,
  payments,
  promos,
  spaceImages,
  spaces,
  users,
} from "./schema";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum diisi.");
}

const client = postgres(databaseUrl);
const db = drizzle(client, { schema });

type SpaceSeed = typeof spaces.$inferInsert;
type PromoSeed = typeof promos.$inferInsert;

const demoUser = {
  username: "demo_user",
  email: "demo@staycationspace.test",
  password: bcrypt.hashSync("password123", 10),
  address: "Jl. Melati No. 21, Bandung",
  phone: "081234567890",
  role: "user" as const,
};

const spaceSeeds: SpaceSeed[] = [
  {
    name: "Sunrise Creative Studio",
    type: "studio",
    description: "Studio foto indoor dengan cahaya natural, backdrop, dan area makeup.",
    pricePerHour: "150000.00",
    capacity: 8,
    status: "active",
    address: "Jl. Braga No. 12, Bandung",
    deposit: "300000.00",
  },
  {
    name: "Lembang Garden Villa",
    type: "villa",
    description: "Villa sejuk untuk staycation keluarga, gathering kecil, dan sesi foto outdoor.",
    pricePerHour: "450000.00",
    capacity: 20,
    status: "active",
    address: "Jl. Kolonel Masturi No. 88, Lembang",
    deposit: "1000000.00",
  },
  {
    name: "Urban Meeting Hall",
    type: "hall",
    description: "Hall modern untuk workshop, seminar, meeting kantor, dan acara komunitas.",
    pricePerHour: "300000.00",
    capacity: 60,
    status: "active",
    address: "Jl. Asia Afrika No. 45, Bandung",
    deposit: "750000.00",
  },
  {
    name: "Minimalist Podcast Room",
    type: "studio",
    description: "Ruangan podcast kedap suara dengan meja host, lighting, dan koneksi internet stabil.",
    pricePerHour: "125000.00",
    capacity: 5,
    status: "active",
    address: "Jl. Dipatiukur No. 31, Bandung",
    deposit: "250000.00",
  },
  {
    name: "Rooftop Sunset Space",
    type: "other",
    description: "Area rooftop untuk private dinner, mini showcase, dan event santai sore hari.",
    pricePerHour: "275000.00",
    capacity: 35,
    status: "inactive",
    address: "Jl. Cihampelas No. 77, Bandung",
    deposit: "500000.00",
  },
];

const promoSeeds: PromoSeed[] = [
  {
    code: "HEMAT10",
    type: "percent",
    value: "10.00",
    maxUsage: 100,
    usedCount: 0,
    expiresAt: "2026-12-31",
    isActive: true,
  },
  {
    code: "WEEKDAY25",
    type: "percent",
    value: "25.00",
    maxUsage: 50,
    usedCount: 1,
    expiresAt: "2026-09-30",
    isActive: true,
  },
  {
    code: "NEWUSER50K",
    type: "fixed",
    value: "50000.00",
    maxUsage: 75,
    usedCount: 2,
    expiresAt: "2026-10-31",
    isActive: true,
  },
  {
    code: "EVENT100K",
    type: "fixed",
    value: "100000.00",
    maxUsage: 30,
    usedCount: 0,
    expiresAt: "2026-08-31",
    isActive: true,
  },
  {
    code: "EXPIRED20",
    type: "percent",
    value: "20.00",
    maxUsage: 10,
    usedCount: 10,
    expiresAt: "2026-01-31",
    isActive: false,
  },
];

const imageSeedsBySpaceName: Record<string, string[]> = {
  "Sunrise Creative Studio": [
    "/uploads/abd88372-c6f4-481f-9628-4f5cadd84855.jpg",
    "/uploads/a37598d0-d9f5-4ba0-8014-359d88f28a6a.jpg",
  ],
  "Lembang Garden Villa": [
    "/uploads/a37598d0-d9f5-4ba0-8014-359d88f28a6a.jpg",
    "/uploads/720a65f5-bd63-4dc6-b5b8-e0adf778c288.jpg",
  ],
  "Urban Meeting Hall": [
    "/uploads/720a65f5-bd63-4dc6-b5b8-e0adf778c288.jpg",
    "/uploads/abd88372-c6f4-481f-9628-4f5cadd84855.jpg",
  ],
  "Minimalist Podcast Room": [
    "/uploads/abd88372-c6f4-481f-9628-4f5cadd84855.jpg",
  ],
  "Rooftop Sunset Space": [
    "/uploads/a37598d0-d9f5-4ba0-8014-359d88f28a6a.jpg",
  ],
};

async function upsertUser() {
  const existing = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, demoUser.email),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db.insert(users).values(demoUser).returning();
  return created;
}

async function upsertSpace(seed: SpaceSeed) {
  const existing = await db.query.spaces.findFirst({
    where: (space, { eq }) => eq(space.name, seed.name),
  });

  if (existing) {
    const [updated] = await db
      .update(spaces)
      .set({ ...seed, updatedAt: new Date() })
      .where(eq(spaces.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db.insert(spaces).values(seed).returning();
  return created;
}

async function upsertPromo(seed: PromoSeed) {
  const [promo] = await db
    .insert(promos)
    .values(seed)
    .onConflictDoUpdate({
      target: promos.code,
      set: {
        type: seed.type,
        value: seed.value,
        maxUsage: seed.maxUsage,
        usedCount: seed.usedCount,
        expiresAt: seed.expiresAt,
        isActive: seed.isActive,
      },
    })
    .returning();

  return promo;
}

async function replaceSpaceImages(space: typeof spaces.$inferSelect) {
  const imageUrls = imageSeedsBySpaceName[space.name] ?? [];

  await db.delete(spaceImages).where(eq(spaceImages.spaceId, space.id));

  if (!imageUrls.length) {
    return;
  }

  await db.insert(spaceImages).values(
    imageUrls.map((imageUrl, index) => ({
      spaceId: space.id,
      imageUrl,
      sortOrder: index,
    })),
  );
}

function calculatePrice(
  pricePerHour: string,
  hours: number,
  promo?: typeof promos.$inferSelect,
) {
  let total = Number(pricePerHour) * hours;

  if (promo?.type === "percent") {
    total -= (total * Number(promo.value)) / 100;
  }

  if (promo?.type === "fixed") {
    total -= Number(promo.value);
  }

  return Math.max(total, 0).toFixed(2);
}

async function seedBookings(
  userId: number,
  seededSpaces: (typeof spaces.$inferSelect)[],
  seededPromos: (typeof promos.$inferSelect)[],
) {
  const promoByCode = new Map(seededPromos.map((promo) => [promo.code, promo]));
  const spaceByName = new Map(seededSpaces.map((space) => [space.name, space]));

  const bookingSeeds = [
    {
      space: "Sunrise Creative Studio",
      promo: "HEMAT10",
      startTime: new Date("2026-07-06T09:00:00+07:00"),
      endTime: new Date("2026-07-06T12:00:00+07:00"),
      status: "verified" as const,
      notes: "Sesi foto katalog produk.",
      paymentMethod: "transfer" as const,
      paymentStatus: "verified" as const,
      proofUrl: "https://example.com/proofs/demo-transfer-001.jpg",
    },
    {
      space: "Lembang Garden Villa",
      promo: "NEWUSER50K",
      startTime: new Date("2026-07-10T14:00:00+07:00"),
      endTime: new Date("2026-07-10T20:00:00+07:00"),
      status: "paid" as const,
      notes: "Gathering keluarga kecil.",
      paymentMethod: "qris" as const,
      paymentStatus: "uploaded" as const,
      proofUrl: "https://example.com/proofs/demo-qris-002.jpg",
    },
    {
      space: "Urban Meeting Hall",
      promo: "EVENT100K",
      startTime: new Date("2026-07-15T08:00:00+07:00"),
      endTime: new Date("2026-07-15T17:00:00+07:00"),
      status: "pending" as const,
      notes: "Workshop tim internal.",
      paymentMethod: "transfer" as const,
      paymentStatus: "pending" as const,
      proofUrl: null,
    },
    {
      space: "Minimalist Podcast Room",
      promo: undefined,
      startTime: new Date("2026-07-18T13:00:00+07:00"),
      endTime: new Date("2026-07-18T16:00:00+07:00"),
      status: "verified" as const,
      notes: "Rekaman podcast episode pilot.",
      paymentMethod: "cash" as const,
      paymentStatus: "verified" as const,
      proofUrl: null,
    },
    {
      space: "Urban Meeting Hall",
      promo: "WEEKDAY25",
      startTime: new Date("2026-07-22T10:00:00+07:00"),
      endTime: new Date("2026-07-22T14:00:00+07:00"),
      status: "cancelled" as const,
      notes: "Dibatalkan karena perubahan jadwal.",
      paymentMethod: "other" as const,
      paymentStatus: "rejected" as const,
      proofUrl: "https://example.com/proofs/demo-rejected-005.jpg",
    },
  ];

  for (const seed of bookingSeeds) {
    const space = spaceByName.get(seed.space);
    const promo = seed.promo ? promoByCode.get(seed.promo) : undefined;

    if (!space) {
      continue;
    }

    const existing = await db.query.bookings.findFirst({
      where: (booking, { and, eq }) =>
        and(
          eq(booking.userId, userId),
          eq(booking.spaceId, space.id),
          eq(booking.startTime, seed.startTime),
        ),
    });

    const hours =
      (seed.endTime.getTime() - seed.startTime.getTime()) / (1000 * 60 * 60);

    const bookingData = {
      spaceId: space.id,
      userId,
      promoId: promo?.id ?? null,
      startTime: seed.startTime,
      endTime: seed.endTime,
      totalPrice: calculatePrice(space.pricePerHour, hours, promo),
      status: seed.status,
      notes: seed.notes,
      updatedAt: new Date(),
    };

    const [booking] = existing
      ? await db
          .update(bookings)
          .set(bookingData)
          .where(eq(bookings.id, existing.id))
          .returning()
      : await db.insert(bookings).values(bookingData).returning();

    await db
      .insert(payments)
      .values({
        bookingId: booking.id,
        method: seed.paymentMethod,
        amount: booking.totalPrice,
        proofUrl: seed.proofUrl,
        status: seed.paymentStatus,
        paidAt: new Date(seed.startTime.getTime() - 24 * 60 * 60 * 1000),
      })
      .onConflictDoUpdate({
        target: payments.bookingId,
        set: {
          method: seed.paymentMethod,
          amount: booking.totalPrice,
          proofUrl: seed.proofUrl,
          status: seed.paymentStatus,
          paidAt: new Date(seed.startTime.getTime() - 24 * 60 * 60 * 1000),
        },
      });
  }
}

async function main() {
  const user = await upsertUser();
  const seededPromos = [];
  const seededSpaces = [];

  for (const promoSeed of promoSeeds) {
    seededPromos.push(await upsertPromo(promoSeed));
  }

  for (const spaceSeed of spaceSeeds) {
    seededSpaces.push(await upsertSpace(spaceSeed));
  }

  for (const space of seededSpaces) {
    await replaceSpaceImages(space);
  }

  await seedBookings(user.id, seededSpaces, seededPromos);

  console.log("Seed dummy data selesai:");
  console.log(`- User demo: ${demoUser.email} / password123`);
  console.log(`- Spaces: ${seededSpaces.length}`);
  console.log("- Space images: 8");
  console.log(`- Promos: ${seededPromos.length}`);
  console.log("- Bookings + payments: 5");
}

main()
  .catch((error) => {
    console.error("Seed dummy data gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
