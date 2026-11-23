'use client';
import { ServiceDetail } from '@/components/ServiceDetail';
import { useParams } from 'next/navigation';

export default function DynamicServicePage() {
  const params = useParams();
  return <ServiceDetail slug={params?.slug} />;
}
