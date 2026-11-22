
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function Page() {
  const s = await getSession();

  if (s?.role !== 'ADMIN') {
    return <Link href="/admin/login">Sign in</Link>;
  }

  const ps = await prisma.product.findMany({
    include: { variants: true },
  });

  return (
    <main className="wrap section">
      <Link href="/admin">← ADMIN</Link>

      <h1>PRODUCTS</h1>

      <p>
        Product management API available at /api/admin/products.
        Use the API for CRUD operations or extend this dashboard form.
      </p>

      <table className="adminTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Featured</th>
          </tr>
        </thead>

        <tbody>
          {ps.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>{p.category}</td>
              <td>{p.featured ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
