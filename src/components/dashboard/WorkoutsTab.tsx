import { CalendarDays } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export default function WorkoutsTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 lg:max-w-[800px] lg:mx-auto lg:w-full" style={{ minHeight: 'calc(100dvh - 160px)' }}>
      <div className="bg-[rgba(127,13,242,0.1)] rounded-full p-6">
        <CalendarDays className="w-12 h-12 text-[#7f0df2]" />
      </div>
      <div className="text-center">
        <Heading as="h3" size="xl" className="mb-2">Registros</Heading>
        <Text size="sm" color="muted">Esta sección está en camino.</Text>
      </div>
    </div>
  );
}
