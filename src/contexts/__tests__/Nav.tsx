import Screen from '@/components/Screen';
import { click as _click, render, see, waitFor } from '@/testing';

import { Nav, useNav } from '../Nav';

function Screen1() {
  const { goTo } = useNav();
  return (
    <Screen heading="Screen 1">
      <button onClick={() => goTo(<Screen2 sub={1} />)}>Screen 2.1</button>
    </Screen>
  );
}

function Screen2({ sub }: { sub: number }) {
  const { goTo } = useNav();
  return (
    <Screen heading={`Screen 2.${sub}`}>
      <button onClick={() => goTo(<Screen3 />)}>Screen 3</button>
    </Screen>
  );
}

function Screen3() {
  const { goTo, goBack } = useNav();
  return (
    <Screen heading="Screen 3">
      <button onClick={() => goBack({ screen: Screen1 })}>Screen 1</button>
      <button onClick={() => goBack()}>Screen 2.1</button>
      <button onClick={() => goTo(<Screen4 />, { replace: true })}>
        Screen 4
      </button>
    </Screen>
  );
}

function Screen4() {
  const { goBack } = useNav();
  return (
    <Screen heading="Screen 4">
      <button onClick={() => goBack({ screen: Screen2, props: { sub: 2 } })}>
        Screen 2.2
      </button>
    </Screen>
  );
}

function renderComponent() {
  render(
    <Nav>
      <Screen1 />
    </Nav>
  );
}

async function click(screenNum: number, sub?: number) {
  const heading = `Screen ${screenNum}.${sub ?? ''}`.replace(/\.$/, '');
  _click(heading);
  await see.screen(heading);
  if (screenNum > 1) see('Go Back');
}

describe('Nav', () => {
  it('renders nav', async () => {
    renderComponent();
    await see.screen('Screen 1');
    await click(2, 1);
    await click(3);
    await click(2, 1);
    await click(3);
    await click(4);
    await click(2, 2);
    await click(3);
    await click(1);

    location.hash = '#999';
    await waitFor(() => expect(location.hash).toBe('#0'));

    const beforeUnload = new Event('beforeunload');
    beforeUnload.preventDefault = jest.fn();
    dispatchEvent(beforeUnload);
    expect(beforeUnload.preventDefault).toBeCalled();
  });
});
