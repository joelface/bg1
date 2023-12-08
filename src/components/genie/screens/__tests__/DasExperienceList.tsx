import { hm, jc, mk, sm } from '@/__fixtures__/das';
import { Experience } from '@/api/das';
import { DasClientProvider } from '@/contexts/DasClient';
import { click, loading, render, see, setTime } from '@/testing';

import DasExperienceList from '../DasExperienceList';

setTime('10:00');
const client = { experiences: jest.fn() };
const onSelect = jest.fn();

const waitTimeLabel = (exp: Experience) =>
  exp.nextAvailableTime.slice(3, 5) + ' min.';

async function renderComponent() {
  const view = render(
    <DasClientProvider value={client as any}>
      <DasExperienceList park={mk} onSelect={onSelect} />
    </DasClientProvider>
  );
  await loading();
  return view;
}

describe('DasExperienceList', () => {
  it('shows available DAS experiences', async () => {
    const exps = [hm, jc, sm];
    client.experiences.mockResolvedValueOnce(exps);
    const { container } = await renderComponent();
    for (const exp of exps) {
      expect(container).toHaveTextContent(exp.name + waitTimeLabel(exp));
    }
    click(waitTimeLabel(jc));
    expect(onSelect).lastCalledWith(jc);
  });

  it('shows message if no experiences', async () => {
    client.experiences.mockResolvedValueOnce([]);
    await renderComponent();
    see('No DAS experiences available');
  });
});
