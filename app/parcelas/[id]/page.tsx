export const dynamic = 'force-dynamic';
import DetalleParcela from './DetalleParcela';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <DetalleParcela id={id} />;
}