import { createFileRoute, Link } from '@tanstack/react-router';
import { MapPin } from 'lucide-react';
import { useApp } from '@/components/app-context';
import { PageHeader } from '@/components/site-layout';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/lokasi')({
  head: () => pageHead('Lokasi Pengelolaan', 'Informasi lokasi pengelolaan sampah di Bali.'),
  component: Locations,
});

function Locations() {
  const { t } = useApp();
  return <>
    <PageHeader eyebrow={t('Lokasi', 'Locations')} title={t('Temukan langkah berikutnya.', 'Find your next step.')} desc={t('Daftar lokasi terverifikasi dan peta belum tersedia. Tanyakan penerimaan material ke desa, banjar, atau dinas lingkungan setempat sebelum membawa sampah.', 'A verified directory and map are not yet available. Ask your village, community or local environmental agency about accepted materials before taking waste there.')} />
    <section className="page-wrap py-12">
      <MapPin className="mb-5 h-10 w-10 text-primary" />
      <Button asChild><Link to="/panduan">{t('Lihat panduan pemilahan', 'View sorting guidance')}</Link></Button>
    </section>
  </>;
}