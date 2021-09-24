import { h, Fragment } from 'preact';

import { Queue } from '../virtual-queue';

export default function HowToEnter({ queue }: { queue: Queue }): h.JSX.Element {
  return (
    <>
      {queue.howToEnterMessage.split('\n\n').map((graf, i) => (
        <p key={i}>{graf}</p>
      ))}
    </>
  );
}
