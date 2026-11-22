import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = [
    { slug: "district-oversized-hoodie", title: "District Oversized Hoodie", description: "Heavyweight everyday streetwear essential.", category: "Clothing", subcategory: "Men", images: [], colours: ["Black"], sizes: ["S","M","L","XL"], variants: [{ deliveryRegion: "UK" as const, pricePence: 8999, stock: 12 }, { deliveryRegion: "CHINA" as const, pricePence: 6999, stock: 20 }] },
    { slug: "district-crossbody-bag", title: "District Crossbody Bag", description: "A clean utility accessory for everyday carry.", category: "Accessories", subcategory: "Men", images: [], colours: ["Black"], sizes: [], variants: [{ deliveryRegion: "UK" as const, pricePence: 3999, stock: 10 }] }
  ];
  for (const p of products) {
    const { variants, ...data } = p;
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: { ...data, variants: { create: variants } } });
  }
}
main().finally(() => prisma.$disconnect());
