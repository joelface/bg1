import { Guest, Queue } from '/api/vq';

export const rotr: Queue = {
  id: '3720fcab-537c-4b2b-b3b2-37918ac7df8f',
  name: 'Star Wars: Rise of the Resistance',
  nextScheduledOpenTime: '13:00:00',
  isAcceptingJoins: false,
  isAcceptingPartyCreation: true,
  maxPartySize: 3,
  howToEnterMessage: 'lol nm just stand in line',
  categoryContentId: 'attraction',
};
export const mtwr: Queue = {
  id: 'mtwr',
  name: "Mr. Toad's Wild Ride",
  nextScheduledOpenTime: null,
  isAcceptingJoins: false,
  isAcceptingPartyCreation: false,
  maxPartySize: 3,
  howToEnterMessage: 'Go to Disneyland or reverse the flow of time.',
  categoryContentId: 'attraction',
};
export const santa: Queue = {
  id: 'santa',
  name: 'Meet Santa Claus',
  nextScheduledOpenTime: '10:00:00',
  isAcceptingJoins: false,
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
  isPrimaryGuest: true,
  isPreselected: true,
};
export const minnie: Guest = {
  id: 'minnie',
  name: 'Minnie Mouse',
  avatarImageUrl: 'https://example.com/minnie.png',
  isPrimaryGuest: false,
  isPreselected: true,
};
export const fifi: Guest = {
  id: 'fifi',
  name: 'Fifi',
  avatarImageUrl: 'https://example.com/fifi.png',
  isPrimaryGuest: false,
  isPreselected: false,
};
export const pluto: Guest = {
  id: 'pluto',
  name: 'Pluto',
  avatarImageUrl: 'https://example.com/pluto.png',
  isPrimaryGuest: false,
  isPreselected: false,
};
export const guests = [mickey, minnie, fifi, pluto];
