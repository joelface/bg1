import { Guest, Queue } from '../virtual-queue';

export const rotr: Queue = {
  queueId: '3720fcab-537c-4b2b-b3b2-37918ac7df8f',
  name: 'Star Wars: Rise of the Resistance',
  nextScheduledOpenTime: null,
  isAcceptingJoins: false,
  howToEnterMessage: 'lol nm just stand in line',
};
export const mtwr: Queue = {
  queueId: 'mtwr',
  name: "Mr. Toad's Wild Ride",
  nextScheduledOpenTime: null,
  isAcceptingJoins: false,
  howToEnterMessage: 'Go to Disneyland or reverse the flow of time.',
};
export const queues = [rotr, mtwr];

export const mickey: Guest = {
  guestId: 'mickey',
  firstName: 'Mickey',
  lastName: 'Mouse',
  avatarImageUrl: 'https://example.com/mickey.png',
  isPrimaryGuest: true,
  isPreselected: true,
};
export const minnie: Guest = {
  guestId: 'minnie',
  firstName: 'Minnie',
  lastName: 'Mouse',
  avatarImageUrl: 'https://example.com/minnie.png',
  isPrimaryGuest: false,
  isPreselected: true,
};
export const fifi: Guest = {
  guestId: 'fifi',
  firstName: 'Fifi',
  lastName: '',
  isPrimaryGuest: false,
  isPreselected: false,
};
export const pluto: Guest = {
  guestId: 'pluto',
  firstName: 'Pluto',
  lastName: '',
  avatarImageUrl: 'https://example.com/pluto.png',
  isPrimaryGuest: false,
  isPreselected: false,
};
export const guests = [mickey, minnie, fifi, pluto];
