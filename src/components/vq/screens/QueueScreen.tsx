import { Queue } from '@/api/vq';
import Screen from '@/components/Screen';

export default function QueueScreen({
  queue,
  title,
  children,
}: {
  queue: Queue;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Screen title={title} theme={queue.park?.theme}>
      <h2>{queue.name}</h2>
      {children}
    </Screen>
  );
}
