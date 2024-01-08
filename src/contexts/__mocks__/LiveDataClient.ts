import * as wdw from '@/api/data/wdw';

const ccp = wdw.experiences[8074];

const client = {
  shows: async () =>
    [ccp].map(exp => ({
      ...exp,
      type: 'ENTERTAINMENT',
      park: wdw.parks.get('80007944'),
      standby: { available: true },
      displayNextShowTime: '10:30',
      displayAdditionalShowTimes: ['11:15', '12:00', '12:45'],
    })),
};

export const useLiveDataClient = () => client;
