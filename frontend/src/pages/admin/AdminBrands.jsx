import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, Badge, EmptyState } from '../../components/UI';
import api from '../../lib/api';
import { Building2 } from 'lucide-react';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/brands').then(r => setBrands(r.data.brands)).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Brands">
      <div className="section-header">
        <div>
          <h2 className="section-title">All Brands</h2>
          <p className="text-secondary text-sm">{brands.length} brand profiles</p>
        </div>
      </div>
      {loading ? <LoadingCenter /> : brands.length === 0 ? (
        <EmptyState icon={Building2} title="No brands yet" desc="Brands will appear here once registered" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Brand Name</th><th>Contact</th><th>Email</th><th>Mobile</th><th>Valuation</th><th>Status</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id}>
                  <td><span style={{ fontWeight: 600 }}>{b.companyName}</span></td>
                  <td className="text-secondary">{b.user?.name}</td>
                  <td className="text-secondary">{b.user?.email}</td>
                  <td className="text-secondary">{b.user?.mobile}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(b.valuation || 0).toLocaleString()}</td>
                  <td><Badge status={b.user?.status || 'pending'} /></td>
                  <td className="text-secondary text-sm">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
