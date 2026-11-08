import { createFileRoute, Link } from '@tanstack/react-router';
import { Sprout } from 'lucide-react';
import { useApp } from '@/components/app-context';
import { PageHeader } from '@/components/site-layout';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/ecozone')({
  head: () => pageHead('EcoZone', 'Ruang aktivitas dan perjalanan ramah lingkungan PilahBali.'),
  component: EcoZone,
});

function EcoZone() {
  const { t } = useApp();
  return <>
    <PageHeader eyebrow="EcoZone" title={t('Langkah kecil untuk Bali.', 'Small steps for Bali.')} desc={t('EcoZone masih dalam pengembangan. Poin, kuis, tantangan, dan riwayat scan belum tersedia.', 'EcoZone is still in development. Points, quizzes, challenges and scan history are not yet available.')} />
    <section className="page-wrap py-12">
      <Sprout className="mb-5 h-10 w-10 text-primary" />
      <Button asChild><Link to="/scanner">{t('Identifikasi sampah', 'Identify waste')}</Link></Button>
    </section>
  </>;
}