
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function Page() {
  const s = await getSession();

  if (s?.role !== 'ADMIN') {
    return (
      <main className="wrap section">
        <h1>ADMIN</h1>
        <Link href="/admin/login">Admin login</Link>
      </main>
    );
  }

  const ps = await prisma.product.findMany({
    include: { variants: true },
  });

  return (
    <main className="wrap section">
      <h1>DRIP DISTRICT ADMIN</h1>
      <p>Product inventory summary</p>

      <Link className="btn" href="/admin/products">
        MANAGE PRODUCTS
      </Link>

      <table className="adminTable">
        <thead>
          <tr>
            <th>Product</th>
            <th>Variants</th>
            <th>Featured</th>
          </tr>
        </thead>

        <tbody>
          {ps.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.variants.length}</td>
              <td>{p.featured ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action="/api/auth/logout" method="post">
        <button className="btn dark">SIGN OUT</button>
      </form>
    </main>
  );
}
