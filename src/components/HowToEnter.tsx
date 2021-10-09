import { h } from 'preact';

import { Queue } from '../virtual-queue';

export default function HowToEnter({ queue }: { queue: Queue }): h.JSX.Element {
  return (
    <div>
      {queue.howToEnterMessage.split('\n\n').map((graf, i) => (
        <p key={i}>{graf}</p>
      ))}
    </div>
  );
}
