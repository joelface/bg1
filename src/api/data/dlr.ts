import { Drops, Experiences, Parks } from '../data';

const dl = {
  id: '330339',
  name: 'Disneyland',
  icon: '🏰',
  geo: {
    n: 33.8163919,
    s: 33.8091255,
    e: -117.9155825,
    w: -117.9243814,
  },
  theme: { bg: 'bg-pink-600', text: 'text-pink-600' },
};
const ca = {
  id: '336894',
  name: 'California Adventure',
  icon: '🎡',
  geo: {
    n: 33.8091255,
    s: 33.8037845,
    e: -117.9155825,
    w: -117.9243814,
  },
  theme: { bg: 'bg-yellow-600', text: 'text-yellow-600' },
};

export const parks: Parks = new Map([dl, ca].map(p => [p.id, p]));

// DL Lands
const mainStreet = {
  name: 'Main Street, USA',
  sort: 1,
  theme: { bg: 'bg-red-600', text: 'text-red-700' },
};
const adventureland = {
  name: 'Adventureland',
  sort: 2,
  theme: { bg: 'bg-lime-600', text: 'text-lime-700' },
};
const newOrleans = {
  name: 'New Orleans Square',
  sort: 3,
  theme: { bg: 'bg-indigo-600', text: 'text-indigo-700' },
};
const critter = {
  name: 'Critter Country',
  sort: 4,
  theme: { bg: 'bg-orange-600', text: 'text-orange-700' },
};
const starWars = {
  name: "Star Wars: Galaxy's Edge",
  sort: 5,
  theme: { bg: 'bg-gray-600', text: 'text-gray-700' },
};
const frontierland = {
  name: 'Frontierland',
  sort: 6,
  theme: { bg: 'bg-yellow-600', text: 'text-yellow-700' },
};
const fantasyland = {
  name: 'Fantasyland',
  sort: 7,
  theme: { bg: 'bg-pink-600', text: 'text-pink-700' },
};
const toontown = {
  name: "Mickey's Toontown",
  sort: 8,
  theme: { bg: 'bg-purple-600', text: 'text-purple-700' },
};
const tomorrowland = {
  name: 'Tomorrowland',
  sort: 9,
  theme: { bg: 'bg-cyan-600', text: 'text-cyan-700' },
};

// DCA Lands
const buenaVista = {
  name: 'Buena Vista Street',
  sort: 1,
  theme: { bg: 'bg-orange-600', text: 'text-orange-700' },
};
const hollywood = {
  name: 'Hollywood Land',
  sort: 2,
  theme: { bg: 'bg-pink-600', text: 'text-pink-700' },
};
const avengers = {
  name: 'Avengers Campus',
  sort: 3,
  theme: { bg: 'bg-gray-600', text: 'text-gray-700' },
};
const cars = {
  name: 'Cars Land',
  sort: 4,
  theme: { bg: 'bg-red-600', text: 'text-red-700' },
};
const pacific = {
  name: 'Pacific Wharf',
  sort: 5,
  theme: { bg: 'bg-cyan-600', text: 'text-cyan-700' },
};
const pixar = {
  name: 'Pixar Pier',
  sort: 6,
  theme: { bg: 'bg-yellow-600', text: 'text-yellow-700' },
};
const grizzly = {
  name: 'Grizzly Peak',
  sort: 7,
  theme: { bg: 'bg-[#c4602c]', text: 'text-[#c4602c]' },
};
const paradise = {
  name: 'Paradise Gardens Park',
  sort: 8,
  theme: { bg: 'bg-lime-600', text: 'text-lime-700' },
};

export const experiences: Experiences = {
  // Disneyland
  367495: {
    id: '367495',
    name: 'Alice in Wonderland',
    land: fantasyland,
    sort: 3,
  },
  353291: {
    id: '353291',
    name: 'Astro Orbitor',
    land: tomorrowland,
  },
  353293: {
    id: '353293',
    name: 'Autopia',
    land: tomorrowland,
    geo: [33.8126634, -117.9167994],
  },
  424945: {
    id: '424945',
    name: 'Believe… in Holiday Magic Fireworks',
    land: mainStreet,
  },
  353295: {
    id: '353295',
    name: 'Big Thunder Mountain Railroad',
    land: frontierland,
    geo: [33.8124801, -117.9205132],
    priority: 3.1,
    sort: 1,
  },
  353301: {
    id: '353301',
    name: 'Buzz Lightyear Astro Blasters',
    land: tomorrowland,
    geo: [33.8122751, -117.9181819],
    sort: 2,
  },
  353305: {
    id: '353305',
    name: 'Casey Jr. Circus Train',
    land: fantasyland,
  },
  353337: {
    id: '353337',
    name: "Chip 'n' Dale's GADGETcoaster",
    land: toontown,
  },
  3908469: {
    id: '3908469',
    name: 'Christmas Fantasy Parade',
    land: mainStreet,
  },
  401463: {
    id: '401463',
    name: 'Dapper Dans',
    land: mainStreet,
  },
  353311: {
    id: '353311',
    name: "Davy Crockett's Explorer Canoes",
    land: frontierland,
  },
  353461: {
    id: '353461',
    name: 'Disneyland Story presenting Great Moments with Mr. Lincoln',
    land: mainStreet,
  },
  353323: {
    id: '353323',
    name: 'Dumbo the Flying Elephant',
    land: fantasyland,
  },
  353325: {
    id: '353325',
    name: 'Enchanted Tiki Room',
    land: adventureland,
  },
  401483: {
    id: '401483',
    name: 'Fantasmic!',
    land: frontierland,
  },
  353327: {
    id: '353327',
    name: 'Finding Nemo Submarine Voyage',
    land: tomorrowland,
  },
  353347: {
    id: '353347',
    name: 'Haunted Mansion',
    land: newOrleans,
    geo: [33.811616, -117.9218924],
    priority: 3.0,
    sort: 1,
  },
  18249927: {
    id: '18249927',
    name: 'Haunted Mansion Holiday',
    land: newOrleans,
    geo: [33.811616, -117.9218924],
    priority: 1.1,
    sort: 1,
  },
  353355: {
    id: '353355',
    name: 'Indiana Jones Adventure',
    land: adventureland,
    geo: [33.8114097, -117.9204077],
    priority: 1.2,
    sort: 1,
  },
  367492: {
    id: '367492',
    name: "it's a small world",
    land: fantasyland,
    geo: [33.8144167, -117.9181268],
  },
  18237232: {
    id: '18237232',
    name: "it's a small world Holiday",
    land: fantasyland,
    geo: [33.8144167, -117.9181268],
    sort: 4,
  },
  353363: {
    id: '353363',
    name: 'Jungle Cruise',
    land: adventureland,
    sort: 2,
  },
  353365: {
    id: '353365',
    name: 'King Arthur Carrousel',
    land: fantasyland,
  },
  353369: {
    id: '353369',
    name: 'Mad Tea Party',
    land: fantasyland,
  },
  19444352: {
    id: '19444352',
    name: 'Magic Happens Parade',
    land: mainStreet,
  },
  353449: {
    id: '353449',
    name: 'Many Adventures of Winnie the Pooh',
    land: critter,
    sort: 2,
  },
  353377: {
    id: '353377',
    name: 'Matterhorn Bobsleds',
    land: fantasyland,
    geo: [33.8127838, -117.9182386],
    priority: 2.0,
    sort: 1,
  },
  18738682: {
    id: '18738682',
    name: 'Meet Disney Princesses (Royal Hall)',
    land: fantasyland,
    type: 'CHARACTER',
  },
  401526: {
    id: '401526',
    name: "Meet Mickey (Mickey's House)",
    land: toontown,
    type: 'CHARACTER',
  },
  401524: {
    id: '401524',
    name: 'Meet Tinker Bell (Pixie Hollow)',
    land: fantasyland,
    type: 'CHARACTER',
  },
  411821333: {
    id: '411821333',
    name: "Mickey and Minnie's Runaway Railway",
    land: toontown,
    geo: [33.8154852, -117.9183938],
    priority: 3.0,
    sort: 1,
  },
  19193459: {
    id: '19193459',
    name: 'Millennium Falcon: Smugglers Run',
    land: starWars,
    geo: [33.8153228, -117.922197],
    priority: 2.1,
    sort: 2,
  },
  353389: {
    id: '353389',
    name: "Mr. Toad's Wild Ride",
    land: fantasyland,
  },
  353399: {
    id: '353399',
    name: "Peter Pan's Flight",
    land: fantasyland,
    sort: 2,
  },
  353401: {
    id: '353401',
    name: "Pinocchio's Daring Journey",
    land: fantasyland,
  },
  353403: {
    id: '353403',
    name: "Pirate's Lair on Tom Sawyer Island",
    land: frontierland,
  },
  353405: {
    id: '353405',
    name: 'Pirates of the Caribbean',
    land: newOrleans,
    geo: [33.811295, -117.9209785],
    sort: 2,
  },
  19193461: {
    id: '19193461',
    name: 'Rise of the Resistance',
    land: starWars,
    geo: [33.8135671, -117.9236346],
    priority: 1.0,
    sort: 1,
  },
  353421: {
    id: '353421',
    name: "Roger Rabbit's Car Toon Spin",
    land: toontown,
    geo: [33.8155682, -117.9181205],
    sort: 2,
    priority: 2.2,
  },
  353429: {
    id: '353429',
    name: "Snow White's Enchanted Wish",
    land: fantasyland,
  },
  353435: {
    id: '353435',
    name: 'Space Mountain',
    land: tomorrowland,
    geo: [33.8112647, -117.9175892],
    priority: 1.3,
    sort: 1,
  },
  18237368: {
    id: '18237368',
    name: 'Hyperspace Mountain',
    land: tomorrowland,
    geo: [33.8112647, -117.9175892],
    priority: 1.2,
    sort: 1,
  },
  353439: {
    id: '353439',
    name: 'Star Tours',
    land: tomorrowland,
    geo: [33.8119436, -117.9182118],
  },
  353443: {
    id: '353443',
    name: 'Storybook Land Canal Boats',
    land: fantasyland,
  },
  17346575: {
    id: '17346575',
    name: 'Storytelling at Royal Theatre',
    land: fantasyland,
  },
  19319963: {
    id: '19319963',
    name: 'Tale of the Lion King',
    land: fantasyland,
  },
  // California Adventure
  19630108: {
    id: '19630108',
    name: 'Amazing Spider-Man',
    land: avengers,
  },
  19630107: {
    id: '19630107',
    name: 'Avengers Assemble!',
    land: avengers,
  },
  18781959: {
    id: '18781959',
    name: 'Coco Musical Celebration',
    land: paradise,
  },
  18708628: {
    id: '18708628',
    name: 'Disney Junior Dance Party',
    land: hollywood,
  },
  19630109: {
    id: '19630109',
    name: 'Dr. Strange: Mystic Arts',
    land: avengers,
  },
  16633170: {
    id: '16633170',
    name: 'Five & Dime',
    land: buenaVista,
  },
  353341: {
    id: '353341',
    name: 'Golden Zephyr',
    land: paradise,
    sort: 4,
  },
  15822029: {
    id: '15822029',
    name: "Goofy's Sky School",
    land: paradise,
    geo: [33.8062523, -117.9228425],
    priority: 3.2,
    sort: 1,
  },
  353345: {
    id: '353345',
    name: 'Grizzly River Run',
    land: grizzly,
    geo: [33.8069638, -117.9212689],
    priority: 3.1,
    sort: 2,
  },
  353451: {
    id: '353451',
    name: 'Guardians of the Galaxy - Mission: BREAKOUT',
    land: avengers,
    geo: [33.8068606, -117.9172434],
    priority: 1.1,
    sort: 1,
  },
  18774860: {
    id: '18774860',
    name: 'Guardians of the Galaxy - Monsters After Dark',
    land: avengers,
    geo: [33.8068606, -117.9172434],
    priority: 1.1,
    sort: 1,
  },
  18614009: {
    id: '18614009',
    name: 'Hurry Home - Lunar New Year Celebration',
    land: paradise,
  },
  353303: {
    id: '353303',
    name: 'Incredicoaster',
    land: pixar,
    geo: [33.8046948, -117.9207725],
    priority: 3.3,
    sort: 2,
  },
  19285637: {
    id: '19285637',
    name: 'Inside Out Emotional Whirlwind',
    land: pixar,
    sort: 4,
  },
  353367: {
    id: '353367',
    name: "Jessie's Critter Carousel",
    land: pixar,
    sort: 6,
  },
  353361: {
    id: '353361',
    name: "Jumpin' Jellyfish",
    land: pixar,
    sort: 5,
  },
  15575069: {
    id: '15575069',
    name: "Little Mermaid - Ariel's Undersea Adventure",
    land: paradise,
    sort: 2,
  },
  18343088: {
    id: '18343088',
    name: "Luigi's Rollickin' Roadsters",
    land: cars,
    sort: 2,
  },
  18752877: {
    id: '18752877',
    name: "Luigi's Honkin' Haul-O-Ween",
    land: cars,
    sort: 2,
  },
  18848246: {
    id: '18848246',
    name: "Luigi's Joy to the Whirl",
    land: cars,
    sort: 2,
  },
  15559914: {
    id: '15559914',
    name: 'Mariachi Divas',
    land: pacific,
  },
  16514431: {
    id: '16514431',
    name: "Mater's Junkyard Jamboree",
    land: cars,
    sort: 3,
  },
  18752875: {
    id: '18752875',
    name: "Mater's Graveyard JamBOOree",
    land: cars,
    sort: 3,
  },
  18848247: {
    id: '18848247',
    name: "Mater's Jingle Jamboree",
    land: cars,
    sort: 3,
  },
  19259687: {
    id: '19259687',
    name: "Mickey's Mix Magic (Fireworks)",
    land: mainStreet,
  },
  19299875: {
    id: '19299875',
    name: "Mickey's PhilharMagic",
    land: hollywood,
  },
  353387: {
    id: '353387',
    name: 'Monsters, Inc.',
    land: hollywood,
    geo: [33.8081471, -117.9175137],
    priority: 3.0,
    sort: 1,
  },
  353379: {
    id: '353379',
    name: 'Pixar Pal-A-Round - Swinging',
    land: pixar,
    sort: 3,
  },
  16514416: {
    id: '16514416',
    name: 'Radiator Springs Racers',
    land: cars,
    geo: [33.8052475, -117.9198715],
    priority: 1.0,
    sort: 1,
  },
  353413: {
    id: '353413',
    name: 'Redwood Creek Challenge Trail',
    land: grizzly,
  },
  15510732: {
    id: '15510732',
    name: 'Silly Symphony Swings',
    land: paradise,
    sort: 3,
  },
  353431: {
    id: '353431',
    name: "Soarin' Around the World",
    land: grizzly,
    geo: [33.8085516, -117.9204917],
    priority: 2.0,
    sort: 1,
  },
  19324604: {
    id: '19324604',
    name: "Soarin' Over California",
    land: grizzly,
    geo: [33.8085516, -117.9204917],
    priority: 2.0,
    sort: 1,
  },
  353453: {
    id: '353453',
    name: 'Toy Story Midway Mania',
    land: pixar,
    geo: [33.804614, -117.9216383],
    priority: 1.2,
    sort: 1,
  },
  353457: {
    id: '353457',
    name: 'Turtle Talk with Crush',
    land: hollywood,
    type: 'ENTERTAINMENT',
  },
  19531124: {
    id: '19531124',
    name: 'WEB SLINGERS',
    land: avengers,
    geo: [33.8067598, -117.91849],
    priority: 1.3,
    sort: 2,
  },
  411805943: {
    id: '411805943',
    name: 'Wondrous Journeys (Fireworks)',
    land: mainStreet,
  },
  411805942: {
    id: '411805942',
    name: 'Wondrous Journeys (Projections)',
    land: mainStreet,
  },
  401479: {
    id: '401479',
    name: 'World of Color',
    land: paradise,
  },
  411805933: {
    id: '411805933',
    name: 'World of Color - ONE',
    land: paradise,
  },
  18492231: {
    id: '18492231',
    name: 'World of Color - Season of Light',
    land: paradise,
  },
  18407713: null,
};

export const drops: Drops = {};
