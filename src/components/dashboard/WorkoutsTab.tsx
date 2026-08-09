import { CalendarDays } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { workoutsTab as styles } from './styles';

export default function WorkoutsTab() {
  return (
    <div className={styles.root} style={styles.rootMinHeight}>
      <div className={styles.iconWrap}>
        <CalendarDays className="w-12 h-12 text-[#7f0df2]" />
      </div>
      <div className={styles.textWrap}>
        <Heading as="h3" size="xl" className="mb-2">Registros</Heading>
        <Text size="sm" color="muted">Esta sección está en camino.</Text>
      </div>
    </div>
  );
}
