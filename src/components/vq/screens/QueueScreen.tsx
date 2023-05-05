import { Queue } from '@/api/vq';
import Screen from '@/components/Screen';

export default function QueueScreen({
  queue,
  heading,
  children,
}: {
  queue: Queue;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Screen heading={heading} theme={queue.park?.theme}>
      <h2>{queue.name}</h2>
      {children}
    </Screen>
  );
}
