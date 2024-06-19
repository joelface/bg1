import * as data from '@/api/data/wdw';
import { Experience as ExpData, Resort } from '@/api/resort';
import { ResortProvider } from '@/contexts/Resort';
import { render } from '@/testing';

(data.experiences[80010208] as ExpData).dropTimes = ['11:30', '13:30'];
(data.experiences[80010190] as ExpData).dropTimes = ['11:30', '13:30'];

class TestResort extends Resort {
  render(children: React.ReactNode) {
    return render(<ResortProvider value={this}>{children}</ResortProvider>);
  }
}

export const wdw = jest.mocked(new TestResort('WDW', data));
export const { genie, vq, das, liveData } = wdw;
export const [mk, ep, hs, ak] = wdw.parks;
