import { h, Fragment } from 'preact';

import FloatingButton from './FloatingButton';

export default function WrongPage(): h.JSX.Element {
  return (
    <>
      <h1 className="text-xl font-semibold">Unable to Load BG1</h1>
      <p>
        BG1 can only be loaded from a resource on Disney's virtual queue server.
        Run the bookmarklet again after clicking the button below.
      </p>
      <FloatingButton href="https://vqguest-svc-wdw.wdprapps.disney.com/application/v1/guest/getQueues">
        Go to Virtual Queue Page
      </FloatingButton>
    </>
  );
}
