import { das, hm, jc, mk, renderResort, sm } from '@/__fixtures__/das';
import { Experience } from '@/api/das';
import { click, loading, see, setTime } from '@/testing';

import DasExperienceList from '../DasExperienceList';

setTime('10:00');
jest.spyOn(das, 'experiences');
const onSelect = jest.fn();

const waitTimeLabel = (exp: Experience) => exp.time.slice(3, 5) + ' min.';

async function renderComponent() {
  const view = renderResort(
    <DasExperienceList park={mk} onSelect={onSelect} />
  );
  await loading();
  return view;
}

describe('DasExperienceList', () => {
  it('shows available DAS experiences', async () => {
    const exps = [hm, jc, sm];
    das.experiences.mockResolvedValueOnce(exps);
    const { container } = await renderComponent();
    for (const exp of exps) {
      expect(container).toHaveTextContent(exp.name + waitTimeLabel(exp));
    }
    click(waitTimeLabel(jc));
    expect(onSelect).toHaveBeenLastCalledWith(jc);
  });

  it('shows message if no experiences', async () => {
    das.experiences.mockResolvedValueOnce([]);
    await renderComponent();
    see('No DAS experiences available');
  });
});
