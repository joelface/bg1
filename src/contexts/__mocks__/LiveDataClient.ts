import * as data from '@/api/data/wdw';
import { Resort } from '@/api/resort';

const wdw = new Resort('WDW', data);
const ccp = wdw.experience('8074');

const client = {
  shows: async () =>
    [ccp].map(exp => ({
      ...exp,
      type: 'ENTERTAINMENT',
      park: wdw.park('80007944'),
      standby: { available: true },
      displayNextShowTime: '10:30',
      displayAdditionalShowTimes: ['11:15', '12:00', '12:45'],
    })),
};

export const useLiveDataClient = () => client;
