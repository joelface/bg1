import { Queue } from '/api/vq';

export default function HowToEnter({ queue }: { queue: Queue }) {
  return (
    <>
      {queue.howToEnterMessage.split('\n\n').map((graf, i) => (
        <p key={i}>{graf}</p>
      ))}
    </>
  );
}
