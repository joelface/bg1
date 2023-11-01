import { Drops, Experience, Experiences } from '../data';

const mk = {
  id: '80007944',
  name: 'Magic Kingdom',
  icon: '🏰',
  geo: {
    n: 28.422,
    s: 28.415,
    e: -81.575,
    w: -81.586,
  },
  theme: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-600' },
};
const ep = {
  id: '80007838',
  name: 'EPCOT',
  icon: '🌐',
  geo: {
    n: 28.377,
    s: 28.366,
    e: -81.545,
    w: -81.555,
  },
  theme: { bg: 'bg-indigo-600', text: 'text-indigo-600' },
};
const hs = {
  id: '80007998',
  name: 'Hollywood Studios',
  icon: '🎬',
  geo: {
    n: 28.362,
    s: 28.353,
    e: -81.557,
    w: -81.564,
  },
  theme: { bg: 'bg-orange-600', text: 'text-orange-600' },
};
const ak = {
  id: '80007823',
  name: 'Animal Kingdom',
  icon: '🌳',
  geo: {
    n: 28.369,
    s: 28.354,
    e: -81.585,
    w: -81.597,
  },
  theme: { bg: 'bg-green-600', text: 'text-green-600' },
};

export const parks = new Map([mk, ep, hs, ak].map(p => [p.id, p]));

// MK Lands
const mainStreet = {
  name: 'Main Street, USA',
  sort: 1,
  theme: { bg: 'bg-red-600', text: 'text-red-700' },
};
const adventureland = {
  name: 'Adventureland',
  sort: 2,
  theme: { bg: 'bg-green-600', text: 'text-green-700' },
};
const frontierland = {
  name: 'Frontierland',
  sort: 3,
  theme: { bg: 'bg-yellow-600', text: 'text-yellow-700' },
};
const libertySquare = {
  name: 'Liberty Square',
  sort: 4,
  theme: { bg: 'bg-indigo-600', text: 'text-indigo-700' },
};
const fantasyland = {
  name: 'Fantasyland',
  sort: 5,
  theme: { bg: 'bg-pink-600', text: 'text-pink-700' },
};
const tomorrowland = {
  name: 'Tomorrowland',
  sort: 6,
  theme: { bg: 'bg-cyan-600', text: 'text-cyan-700' },
};

// EPCOT Lands
const celebration = {
  name: 'World Celebration',
  sort: 1,
  theme: { bg: 'bg-indigo-600', text: 'text-indigo-700' },
};
const discovery = {
  name: 'World Discovery',
  sort: 2,
  theme: { bg: 'bg-red-600', text: 'text-red-700' },
};
const nature = {
  name: 'World Nature',
  sort: 3,
  theme: { bg: 'bg-green-600', text: 'text-green-700' },
};
const showcase = {
  name: 'World Showcase',
  sort: 4,
  theme: { bg: 'bg-yellow-600', text: 'text-yellow-700' },
};

// Hollywood Studios Lands
const hollywood = {
  name: 'Hollywood & Sunset',
  sort: 1,
  theme: { bg: 'bg-orange-600', text: 'text-orange-700' },
};
const toyStory = {
  name: 'Toy Story Land',
  sort: 2,
  theme: { bg: 'bg-green-600', text: 'text-green-700' },
};
const starWars = {
  name: "Star Wars: Galaxy's Edge",
  sort: 3,
  theme: { bg: 'bg-gray-600', text: 'text-gray-700' },
};
const echoLake = {
  name: 'Echo Lake',
  sort: 4,
  theme: { bg: 'bg-indigo-600', text: 'text-indigo-700' },
};
const otherStudios = {
  name: 'Miscellaneous',
  sort: 5,
  theme: { bg: 'bg-red-600', text: 'text-red-700' },
};

// Animal Kingdom Lands
const discIsland = {
  name: 'Discovery Island',
  sort: 1,
  theme: { bg: 'bg-green-600', text: 'text-green-700' },
};
const pandora = {
  name: 'Pandora',
  sort: 2,
  theme: { bg: 'bg-cyan-600', text: 'text-cyan-700' },
};
const africa = {
  name: 'Africa',
  sort: 3,
  theme: { bg: 'bg-yellow-600', text: 'text-yellow-700' },
};
const rafikis = {
  name: "Rafiki's Planet Watch",
  sort: 4,
  theme: { bg: 'bg-orange-600', text: 'text-orange-700' },
};
const asia = {
  name: 'Asia',
  sort: 5,
  theme: { bg: 'bg-red-600', text: 'text-red-700' },
};
const dinoland = {
  name: 'Dinoland USA',
  sort: 6,
  theme: { bg: 'bg-purple-600', text: 'text-purple-700' },
};

let [fea, rra, tt, sdd, tsm, tot, ee, krr]: Experience[] = [];

export const experiences: Experiences = {
  // Magic Kingdom
  80010107: {
    id: '80010107',
    name: 'Astro Orbiter',
    land: tomorrowland,
    sort: 3,
  },
  16491297: {
    id: '16491297',
    name: 'Barnstormer',
    land: fantasyland,
    geo: [28.4208394, -81.5784733],
    sort: 5,
  },
  80010110: {
    id: '80010110',
    name: 'Big Thunder Mountain Railroad',
    land: frontierland,
    geo: [28.4197486, -81.5845092],
    priority: 3.0,
    sort: 1,
  },
  80010114: {
    id: '80010114',
    name: "Buzz Lightyear's Space Ranger Spin",
    land: tomorrowland,
    geo: [28.418446, -81.5796479],
    priority: 3.5,
    sort: 2,
  },
  80010232: {
    id: '80010232',
    name: 'Carousel of Progress',
    land: tomorrowland,
    sort: 7,
  },
  80069748: {
    id: '80069748',
    name: 'Country Bear Jamboree',
    land: frontierland,
  },
  8075: {
    id: '8075',
    name: 'Dapper Dans',
    land: mainStreet,
  },
  411550122: {
    id: '411550122',
    name: 'Disney Adventure Friends Cavalcade',
    land: mainStreet,
  },
  80010129: {
    id: '80010129',
    name: 'Dumbo the Flying Elephant',
    land: fantasyland,
    geo: [28.4206047, -81.5789092],
    sort: 6,
  },
  16767276: {
    id: '16767276',
    name: 'Enchanted Tales with Belle',
    land: fantasyland,
    geo: [28.4207354, -81.5807867],
    priority: 3.2,
  },
  16124144: {
    id: '16124144',
    name: 'Enchanted Tiki Room',
    land: adventureland,
  },
  17718925: {
    id: '17718925',
    name: 'Festival of Fantasy Parade',
    land: mainStreet,
    geo: [28.4189018, -81.5812001],
  },
  80069754: {
    id: '80069754',
    name: 'Hall of Presidents',
    land: libertySquare,
  },
  18672598: {
    id: '18672598',
    name: 'Happily Ever After',
    land: mainStreet,
  },
  80010208: {
    id: '80010208',
    name: 'Haunted Mansion',
    land: libertySquare,
    geo: [28.4208771, -81.5830102],
    priority: 2.0,
    sort: 1,
  },
  80010149: {
    id: '80010149',
    name: "it's a small world",
    land: fantasyland,
    geo: [28.4205055, -81.582156],
    sort: 4,
    priority: 4.0,
  },
  80010153: {
    id: '80010153',
    name: 'Jungle Cruise',
    land: adventureland,
    geo: [28.4180339, -81.5834548],
    priority: 1.2,
    sort: 1,
  },
  80010160: {
    id: '80010160',
    name: 'Liberty Square Riverboat',
    land: libertySquare,
  },
  80010162: {
    id: '80010162',
    name: 'Mad Tea Party',
    land: fantasyland,
    geo: [28.4200602, -81.5799004],
    sort: 7,
  },
  80010210: {
    id: '80010210',
    name: 'Magic Carpets of Aladdin',
    land: adventureland,
    geo: [28.4183166, -81.5835006],
    sort: 4,
  },
  80010213: {
    id: '80010213',
    name: 'Many Adventures of Winnie the Pooh',
    land: fantasyland,
    geo: [28.4202297, -81.5801966],
    priority: 3.4,
    sort: 3,
  },
  16874126: {
    id: '16874126',
    name: "Meet Ariel (Ariel's Grotto)",
    land: fantasyland,
    geo: [28.4208803, -81.5796853],
    type: 'CHARACTER',
    priority: 2.2,
  },
  15850196: {
    id: '15850196',
    name: 'Meet Mickey (Town Square Theater)',
    land: mainStreet,
    geo: [28.4167334, -81.5803937],
    type: 'CHARACTER',
    priority: 3.1,
  },
  18498503: {
    id: '18498503',
    name: 'Meet Cinderella (Princess Fairytale Hall)',
    land: fantasyland,
    geo: [28.4199771, -81.5808316],
    type: 'CHARACTER',
    priority: 2.1,
  },
  387133: {
    id: '387133',
    name: "Meet Donald/Goofy (Pete's Silly Side Show)",
    land: fantasyland,
    type: 'CHARACTER',
  },
  15743682: {
    id: '15743682',
    name: "Meet Minnie/Daisy (Pete's Silly Side Show)",
    land: fantasyland,
    type: 'CHARACTER',
  },
  17505397: {
    id: '17505397',
    name: 'Meet Tiana (Princess Fairytale Hall)',
    land: fantasyland,
    geo: [28.4199771, -81.5808316],
    type: 'CHARACTER',
    priority: 3.3,
  },
  19579538: {
    id: '19579538',
    name: "Mickey's Celebration Cavalcade",
    land: mainStreet,
  },
  18381020: {
    id: '18381020',
    name: "Mickey's Magical Friendship Faire",
    land: mainStreet,
  },
  80010170: {
    id: '80010170',
    name: "Mickey's PhilharMagic",
    land: fantasyland,
    geo: [28.4200575, -81.5814156],
  },
  136550: {
    id: '136550',
    name: 'Monsters Inc. Laugh Floor',
    land: tomorrowland,
    geo: [28.4179954, -81.5800854],
    sort: 6,
  },
  80010224: {
    id: '80010224',
    name: 'PeopleMover',
    land: tomorrowland,
    sort: 5,
  },
  80010176: {
    id: '80010176',
    name: "Peter Pan's Flight",
    land: fantasyland,
    geo: [28.4203332, -81.5818676],
    priority: 1.3,
    sort: 2,
  },
  80010177: {
    id: '80010177',
    name: 'Pirates of the Caribbean',
    land: adventureland,
    geo: [28.4180994, -81.5842719],
    priority: 3.6,
    sort: 2,
  },
  80010117: {
    id: '80010117',
    name: 'Prince Charming Regal Carrousel',
    land: fantasyland,
    sort: 8,
  },
  8515: {
    id: '8515',
    name: 'See Buzz/Stitch (Rocket Tower Plaza Stage)',
    land: tomorrowland,
    type: 'CHARACTER',
  },
  16767284: {
    id: '16767284',
    name: 'Seven Dwarfs Mine Train',
    land: fantasyland,
    geo: [28.4204112, -81.5805506],
    priority: 1.1,
    sort: 1,
  },
  80010190: {
    id: '80010190',
    name: 'Space Mountain',
    land: tomorrowland,
    geo: [28.4187869, -81.5782063],
    priority: 2.3,
    sort: 1,
  },
  80010196: {
    id: '80010196',
    name: 'Swiss Family Treehouse',
    land: adventureland,
  },
  80010220: {
    id: '80010220',
    name: "Tom Sawyer's Island",
    land: frontierland,
  },
  80010222: {
    id: '80010222',
    name: 'Tomorrowland Speedway',
    land: tomorrowland,
    geo: [28.4194062, -81.5793505],
    sort: 4,
  },
  411504498: {
    id: '411504498',
    name: 'TRON Lightcycle / Run',
    land: tomorrowland,
    geo: [28.4202075, -81.577053],
    priority: 1.0,
    sort: 8,
  },
  16767263: {
    id: '16767263',
    name: 'Under the Sea',
    land: fantasyland,
    geo: [28.4210351, -81.5799673],
    sort: 4,
  },
  // EPCOT
  78700: {
    id: '78700',
    name: 'Alberta Bound',
    land: showcase,
  },
  80010200: {
    id: '80010200',
    name: 'American Adventure',
    land: showcase,
    type: 'ENTERTAINMENT',
  },
  19473173: {
    id: '19473173',
    name: 'Awesome Planet',
    land: nature,
  },
  19463785: {
    id: '19463785',
    name: 'Beauty & the Beast Sing-Along',
    land: showcase,
  },
  80010174: {
    id: '80010174',
    name: 'Canada Far and Wide',
    land: showcase,
  },
  19036653: {
    id: '19036653',
    name: 'Canada Mill Stage Entertainment',
    land: showcase,
  },
  18269694: {
    id: '18269694',
    name: 'Disney & Pixar Short Film Festival',
    land: celebration,
    geo: [28.3720463, -81.5508243],
  },
  19242311: {
    id: '19242311',
    name: 'Germany Gazebo Entertainment',
    land: showcase,
  },
  19258170: {
    id: '19258170',
    name: 'Epcot Forever',
    land: showcase,
  },
  18375495: (fea = {
    id: '18375495',
    name: 'Frozen Ever After',
    land: showcase,
    geo: [28.3706716, -81.5465556],
    priority: 1.2,
    sort: 2,
  }),
  207395: {
    id: '207395',
    name: 'Gran Fiesta Tour',
    land: showcase,
    sort: 3,
  },
  18923661: {
    id: '18923661',
    name: "Groovin' Alps",
    land: showcase,
  },
  411499845: {
    id: '411499845',
    name: 'Guardians of the Galaxy: Cosmic Rewind',
    land: discovery,
    geo: [28.3747479, -81.5478405],
    priority: 1.0,
    sort: 3,
  },
  13507: {
    id: '13507',
    name: 'Jammitors',
    land: celebration,
  },
  80010152: {
    id: '80010152',
    name: 'Journey Into Imagination',
    land: celebration,
    geo: [28.372896, -81.5512292],
    sort: 2,
  },
  411794307: {
    id: '411794307',
    name: 'Journey of Water, Inspired by Moana',
    land: nature,
  },
  19516307: {
    id: '19516307',
    name: 'Julia Scheeser & Band',
    land: showcase,
  },
  411928911: {
    id: '411928911',
    name: 'Les Raftsmen',
    land: showcase,
  },
  80010161: {
    id: '80010161',
    name: 'Living with the Land',
    land: nature,
    geo: [28.3739368, -81.5526389],
    sort: 2,
  },
  19322758: {
    id: '19322758',
    name: 'Mariachi Cobre',
    land: showcase,
  },
  80010865: {
    id: '80010865',
    name: 'Matsuriza',
    land: showcase,
  },
  15695444: {
    id: '15695444',
    name: 'Meet Mary Poppins (UK)',
    land: showcase,
    type: 'CHARACTER',
  },
  15574092: {
    id: '15574092',
    name: 'Meet Princess Aurora (France)',
    land: showcase,
    type: 'CHARACTER',
  },
  80010173: {
    id: '80010173',
    name: 'Mission: SPACE',
    land: discovery,
    geo: [28.3739368, -81.5526389],
    priority: 4.0,
    sort: 2,
  },
  18780200: {
    id: '18780200',
    name: 'Raffy',
    land: showcase,
  },
  80010180: {
    id: '80010180',
    name: 'Reflections of China',
    land: showcase,
  },
  19497835: (rra = {
    id: '19497835',
    name: "Remy's Ratatouille Adventure",
    land: showcase,
    geo: [28.3680021, -81.5534178],
    priority: 1.1,
    sort: 1,
  }),
  107785: {
    id: '107785',
    name: 'Seas with Nemo & Friends',
    land: nature,
    geo: [28.3748995, -81.5507208],
    sort: 3,
  },
  20194: {
    id: '20194',
    name: "Soarin' Around the World",
    land: nature,
    geo: [28.3735924, -81.5522783],
    priority: 3.0,
    sort: 1,
  },
  412001587: {
    id: '412001587',
    name: "Soarin' Over California",
    land: nature,
    geo: [28.3735924, -81.5522783],
    priority: 2.0,
    sort: 1,
  },
  80010191: {
    id: '80010191',
    name: 'Spaceship Earth',
    land: celebration,
    geo: [28.3754661, -81.5493961],
    priority: 4.1,
    sort: 1,
  },
  80010199: (tt = {
    id: '80010199',
    name: 'Test Track',
    land: discovery,
    geo: [28.3733374, -81.5474931],
    priority: 1.3,
    sort: 1,
  }),
  62992: {
    id: '62992',
    name: 'Turtle Talk With Crush',
    land: nature,
    geo: [28.3753989, -81.5511449],
    sort: 4,
  },
  80010879: {
    id: '80010879',
    name: 'Voices of Liberty',
    land: showcase,
  },
  // Hollywood Studios
  18904172: {
    id: '18904172',
    name: 'Alien Swirling Saucers',
    land: toyStory,
    geo: [28.3553702, -81.5624558],
    priority: 3.1,
    sort: 3,
  },
  80010848: {
    id: '80010848',
    name: 'Beauty & the Beast Live on Stage',
    land: hollywood,
    geo: [28.3591529, -81.5597641],
  },
  19583373: {
    id: '19583373',
    name: 'Disney Junior Play and Dance',
    land: otherStudios,
    geo: [28.3579409, -81.5607914],
  },
  18693119: {
    id: '18693119',
    name: 'Disney Movie Magic',
    land: hollywood,
  },
  80010887: {
    id: '80010887',
    name: 'Fantasmic!',
    land: hollywood,
    geo: [28.3599166, -81.5592299],
  },
  136: {
    id: '136',
    name: 'Indiana Jones Epic Stunt Spectacular',
    land: echoLake,
    geo: [28.3567464, -81.5588053],
  },
  17842841: {
    id: '17842841',
    name: 'Frozen Sing-Along',
    land: echoLake,
    geo: [28.3566155, -81.5594812],
  },
  19276204: {
    id: '19276204',
    name: "Lightning McQueen's Racing Academy",
    land: hollywood,
  },
  411926516: {
    id: '411926516',
    name: 'Meet Ariel (Walt Disney Presents)',
    land: otherStudios,
    type: 'CHARACTER',
  },
  18189394: {
    id: '18189394',
    name: 'Meet Chewbacca (Launch Bay)',
    land: otherStudios,
    type: 'CHARACTER',
  },
  224093: {
    id: '224093',
    name: 'Meet Disney Junior Pals (Animation Courtyard)',
    land: otherStudios,
    type: 'CHARACTER',
  },
  18368386: {
    id: '18368386',
    name: 'Meet Disney Stars (Red Carpet Dreams)',
    land: otherStudios,
    geo: [28.3560952, -81.5594433],
    type: 'CHARACTER',
  },
  19205017: {
    id: '19205017',
    name: 'Meet Edna Mode (Edna Mode Experience)',
    land: otherStudios,
    type: 'CHARACTER',
  },
  18368385: {
    id: '18368385',
    name: 'Meet Olaf (Celebrity Spotlight)',
    land: echoLake,
    geo: [28.3562836, -81.55906],
    type: 'CHARACTER',
  },
  19259335: {
    id: '19259335',
    name: "Mickey & Minnie's Runaway Railway",
    land: hollywood,
    geo: [28.3567406, -81.5606842],
    priority: 2.0,
    sort: 1,
  },
  19263735: {
    id: '19263735',
    name: 'Millennium Falcon: Smugglers Run',
    land: starWars,
    geo: [28.353862, -81.5616967],
    priority: 2.2,
    sort: 2,
  },
  80010151: {
    id: '80010151',
    name: 'Muppet*Vision 3D',
    land: otherStudios,
    geo: [28.3550576, -81.5595],
  },
  80010182: {
    id: '80010182',
    name: "Rock 'n' Roller Coaster",
    land: hollywood,
    geo: [28.3597607, -81.5606022],
    priority: 2.1,
    sort: 3,
  },
  18904138: (sdd = {
    id: '18904138',
    name: 'Slinky Dog Dash',
    land: toyStory,
    geo: [28.3562472, -81.5628474],
    priority: 1.1,
    sort: 1,
  }),
  80010193: {
    id: '80010193',
    name: 'Star Tours',
    land: echoLake,
    geo: [28.3557799, -81.5588696],
    priority: 4.0,
    sort: 1,
  },
  19263736: {
    id: '19263736',
    name: 'Rise of the Resistance',
    land: starWars,
    geo: [28.3548829, -81.5604682],
    priority: 1.0,
    sort: 1,
  },
  209857: (tsm = {
    id: '209857',
    name: 'Toy Story Mania',
    land: toyStory,
    geo: [28.3563865, -81.5619019],
    priority: 3.0,
    sort: 2,
  }),
  80010218: (tot = {
    id: '80010218',
    name: 'Twilight Zone Tower of Terror',
    land: hollywood,
    geo: [28.3595812, -81.5597695],
    priority: 2.3,
    sort: 2,
  }),
  // Animal Kingdom
  19330300: {
    id: '19330300',
    name: 'Animation Experience',
    land: rafikis,
    geo: [28.3652134, -81.5885522],
  },
  18665186: {
    id: '18665186',
    name: 'Avatar Flight of Passage',
    land: pandora,
    geo: [28.3555698, -81.592292],
    priority: 1.0,
    sort: 1,
  },
  80010123: {
    id: '80010123',
    name: 'DINOSAUR',
    land: dinoland,
    geo: [28.3552805, -81.5884492],
    priority: 3.1,
    sort: 1,
  },
  26068: (ee = {
    id: '26068',
    name: 'Expedition Everest',
    land: asia,
    geo: [28.3584979, -81.587395],
    priority: 3.0,
    sort: 1,
  }),
  19581372: {
    id: '19581372',
    name: 'Feathered Friends in Flight',
    land: asia,
    geo: [28.3586675, -81.5900411],
  },
  12432: {
    id: '12432',
    name: 'Festival of the Lion King',
    land: africa,
    geo: [28.3581957, -81.5925823],
  },
  411550125: {
    id: '411550125',
    name: 'Finding Nemo: The Big Blue and Beyond',
    land: dinoland,
    geo: [28.3574008, -81.5874145],
  },
  80010175: {
    id: '80010175',
    name: 'Gorilla Falls Exploration Trail',
    land: africa,
  },
  80010150: {
    id: '80010150',
    name: "It's Tough to be a Bug",
    land: discIsland,
    geo: [28.3574356, -81.5900851],
  },
  80010154: (krr = {
    id: '80010154',
    name: 'Kali River Rapids',
    land: asia,
    geo: [28.3592076, -81.5883195],
    priority: 3.2,
  }),
  80010157: {
    id: '80010157',
    name: 'Kilimanjaro Safaris',
    land: africa,
    geo: [28.3592779, -81.5921478],
    priority: 2.1,
    sort: 1,
  },
  80010164: {
    id: '80010164',
    name: 'Maharajah Jungle Trek',
    land: asia,
  },
  17421326: {
    id: '17421326',
    name: 'Meet Disney Pals (Adventurers Outpost)',
    land: discIsland,
    geo: [28.3579455, -81.5898647],
    type: 'CHARACTER',
    priority: 2.0,
  },
  411921961: {
    id: '411921961',
    name: 'Meet Moana (Character Landing)',
    land: discovery,
    type: 'CHARACTER',
  },
  18665185: {
    id: '18665185',
    name: "Na'vi River Journey",
    land: pandora,
    geo: [28.3551663, -81.591708],
    priority: 1.1,
    sort: 2,
  },
  80010228: {
    id: '80010228',
    name: 'Triceratop Spin',
    land: dinoland,
    sort: 2,
  },
};

export const drops: Drops = {
  [ep.id]: [
    {
      time: '11:47',
      experiences: [fea],
    },
    {
      time: '12:47',
      experiences: [tt],
    },
    {
      time: '13:47',
      experiences: [rra],
    },
    {
      time: '14:47',
      experiences: [tt],
    },
    {
      time: '15:47',
      experiences: [rra],
    },
    {
      time: '16:47',
      experiences: [fea, tt],
    },
    {
      time: '18:47',
      experiences: [fea, rra],
    },
  ],
  [hs.id]: [
    {
      time: '13:17',
      experiences: [sdd, tot, tsm],
    },
    {
      time: '15:47',
      experiences: [sdd, tot, tsm],
    },
  ],
  [ak.id]: [
    {
      time: '12:47',
      experiences: [ee, krr],
    },
    {
      time: '15:17',
      experiences: [krr],
    },
  ],
};
