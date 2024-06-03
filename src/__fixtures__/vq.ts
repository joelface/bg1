import * as data from '@/api/data/wdw';
import { Resort } from '@/api/resort';
import { Guest, Queue, VQClient } from '@/api/vq';

export const wdw = new Resort('WDW', data);

export const rotr: Queue = {
  id: '3720fcab-537c-4b2b-b3b2-37918ac7df8f',
  name: 'Star Wars: Rise of the Resistance',
  nextScheduledOpenTime: '07:00:00',
  nextScheduledPartyCreationOpenTime: '06:00:00',
  isAcceptingJoins: false,
  isAcceptingPartyCreation: true,
  maxPartySize: 3,
  howToEnterMessage: 'lol nm just stand in line',
  categoryContentId: 'attraction',
  park: wdw.park('80007998'),
};
export const mtwr: Queue = {
  id: 'mtwr',
  name: "Mr. Toad's Wild Ride",
  nextScheduledOpenTime: null,
  nextScheduledPartyCreationOpenTime: null,
  isAcceptingJoins: false,
  isAcceptingPartyCreation: false,
  maxPartySize: 3,
  howToEnterMessage: 'Go to Disneyland or reverse the flow of time.',
  categoryContentId: 'attraction',
};
export const santa: Queue = {
  id: 'santa',
  name: 'Meet Santa Claus',
  nextScheduledOpenTime: null,
  nextScheduledPartyCreationOpenTime: null,
  isAcceptingJoins: true,
  isAcceptingPartyCreation: true,
  maxPartySize: 10,
  howToEnterMessage: '',
  categoryContentId: 'character',
};
export const queues = [santa, mtwr, rotr];

export const mickey: Guest = {
  id: 'mickey',
  name: 'Mickey Mouse',
  avatarImageUrl: 'https://example.com/mickey.png',
  primary: true,
  preselected: true,
};
export const minnie: Guest = {
  id: 'minnie',
  name: 'Minnie Mouse',
  avatarImageUrl: 'https://example.com/minnie.png',
  primary: false,
  preselected: true,
};
export const fifi: Guest = {
  id: 'fifi',
  name: 'Fifi',
  avatarImageUrl: 'https://example.com/fifi.png',
  primary: false,
  preselected: false,
};
export const pluto: Guest = {
  id: 'pluto',
  name: 'Pluto',
  avatarImageUrl: 'https://example.com/pluto.png',
  primary: false,
  preselected: false,
};
export const guests = [mickey, minnie, fifi, pluto];

export const client = jest.mocked(
  new VQClient(wdw, {
    getData: () => ({ swid: '', accessToken: '' }),
    setData: () => null,
    deleteData: () => null,
    onUnauthorized: () => null,
  })
);
jest.spyOn(client, 'getQueues').mockResolvedValue(queues);
jest.spyOn(client, 'getLinkedGuests').mockResolvedValue(guests);
jest.spyOn(client, 'joinQueue').mockResolvedValue({
  boardingGroup: 33,
  conflicts: {},
  closed: false,
});
