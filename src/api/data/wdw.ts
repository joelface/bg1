import { ResortData } from '../genie';

const pdts = (start: number, gap = 150, count = 3) =>
  [...Array(count).keys()]
    .map(i => start + i * gap)
    .map(m =>
      new Date(new Date().setHours(m / 60, m % 60, 0))
        .toTimeString()
        .slice(0, 5)
    );

const data: ResortData = {
  parks: [
    {
      id: '80007944',
      name: 'Magic Kingdom',
      icon: '🏰',
      geo: {
        n: 28.422,
        s: 28.415,
        e: -81.575,
        w: -81.586,
      },
      theme: {
        bg: 'bg-fuchsia-600',
        // text-fuchsia-600
      },
    },
    {
      id: '80007838',
      name: 'EPCOT',
      icon: '🌐',
      geo: {
        n: 28.377,
        s: 28.366,
        e: -81.545,
        w: -81.555,
      },
      theme: {
        bg: 'bg-indigo-600',
        // text-indigo-600
      },
    },
    {
      id: '80007998',
      name: 'Hollywood Studios',
      icon: '🎬',
      geo: {
        n: 28.362,
        s: 28.353,
        e: -81.557,
        w: -81.564,
      },
      theme: {
        bg: 'bg-orange-600',
        // text-orange-600
      },
    },
    {
      id: '80007823',
      name: 'Animal Kingdom',
      icon: '🌳',
      geo: {
        n: 28.369,
        s: 28.354,
        e: -81.585,
        w: -81.597,
      },
      theme: {
        bg: 'bg-green-600',
        // text-green-600
      },
    },
  ],
  experiences: {
    // Magic Kingdom
    16491297: {
      name: 'Barnstormer',
      geo: [28.4208394, -81.5784733],
    },
    80010110: {
      name: 'Big Thunder Mountain Railroad',
      geo: [28.4197486, -81.5845092],
      priority: 2.2,
    },
    80010114: {
      name: "Buzz Lightyear's Space Ranger Spin",
      geo: [28.418446, -81.5796479],
      priority: 3.2,
    },
    80010129: {
      name: 'Dumbo the Flying Elephant',
      geo: [28.4206047, -81.5789092],
    },
    17718925: {
      name: 'Festival of Fantasy Parade',
      geo: [28.4189018, -81.5812001],
    },
    80010208: {
      name: 'Haunted Mansion',
      geo: [28.4208771, -81.5830102],
      priority: 2.3,
    },
    80010149: {
      name: "it's a small world",
      geo: [28.4205055, -81.582156],
      priority: 3.3,
    },
    80010153: {
      name: 'Jungle Cruise',
      geo: [28.4180339, -81.5834548],
      priority: 1.1,
    },
    80010162: {
      name: 'Mad Tea Party',
      geo: [28.4200602, -81.5799004],
    },
    80010210: {
      name: 'Magic Carpets of Aladdin',
      geo: [28.4183166, -81.5835006],
    },
    80010213: {
      name: 'Many Adventures of Winnie the Pooh',
      geo: [28.4202297, -81.5801966],
      priority: 3.1,
    },
    80010170: {
      name: "Mickey's PhilharMagic",
      geo: [28.4200575, -81.5814156],
    },
    136550: {
      name: 'Monsters Inc. Laugh Floor',
      geo: [28.4179954, -81.5800854],
    },
    80010176: {
      name: "Peter Pan's Flight",
      geo: [28.4203332, -81.5818676],
      priority: 1.2,
    },
    80010177: {
      name: 'Pirates of the Caribbean',
      geo: [28.4180994, -81.5842719],
      priority: 3.0,
    },
    15850196: {
      name: 'Meet Mickey @ Town Square Theater',
      geo: [28.4167334, -81.5803937],
    },
    18498503: {
      name: 'Meet Cinderella @ Princess Fairytale Hall',
      geo: [28.4199771, -81.5808316],
    },
    17505397: {
      name: 'Meet Tiana @ Princess Fairytale Hall',
      geo: [28.4199771, -81.5808316],
    },
    16767284: {
      name: 'Seven Dwarfs Mine Train',
      geo: [28.4204112, -81.5805506],
      priority: 1.0,
    },
    80010190: {
      name: 'Space Mountain',
      geo: [28.4187869, -81.5782063],
      priority: 2.1,
    },
    80010192: {
      name: 'Splash Mountain',
      geo: [28.4196223, -81.584991],
      priority: 2.0,
    },
    80010222: {
      name: 'Tomorrowland Speedway',
      geo: [28.4194062, -81.5793505],
    },
    16767263: {
      name: 'Under the Sea',
      geo: [28.4210351, -81.5799673],
    },
    // Epcot
    18269694: {
      name: 'Disney & Pixar Short Film Festival',
      geo: [28.3720463, -81.5508243],
    },
    18375495: {
      name: 'Frozen Ever After',
      geo: [28.3706716, -81.5465556],
      priority: 1.2,
    },
    80010152: {
      name: 'Journey Into Imagination',
      geo: [28.372896, -81.5512292],
    },
    80010161: {
      name: 'Living with the Land',
      geo: [28.3739368, -81.5526389],
    },
    80010173: {
      name: 'Mission: SPACE',
      geo: [28.3739368, -81.5526389],
      priority: 4.0,
    },
    19497835: {
      name: "Remy's Ratatouille Adventure",
      geo: [28.3680021, -81.5534178],
      priority: 1.0,
    },
    107785: {
      name: 'Seas with Nemo & Friends',
      geo: [28.3748995, -81.5507208],
    },
    20194: {
      name: "Soarin' Around the World",
      geo: [28.3735924, -81.5522783],
      priority: 3.0,
    },
    80010191: {
      name: 'Spaceship Earth',
      geo: [28.3754661, -81.5493961],
      priority: 4.1,
    },
    80010199: {
      name: 'Test Track',
      geo: [28.3733374, -81.5474931],
      priority: 1.1,
    },
    62992: {
      name: 'Turtle Talk With Crush',
      geo: [28.3753989, -81.5511449],
    },
    // Hollywood Studios
    18904172: {
      name: 'Alien Swirling Saucers',
      priority: 3.1,
      geo: [28.3553702, -81.5624558],
    },
    80010848: {
      name: 'Beauty & The Beast Live on Stage',
      geo: [28.3591529, -81.5597641],
    },
    19583373: {
      name: 'Disney Junior Play and Dance',
      geo: [28.3579409, -81.5607914],
    },
    136: {
      name: 'Indiana Jones Epic Stunt Spectacular',
      geo: [28.3567464, -81.5588053],
    },
    17842841: {
      name: 'Frozen Sing-Along',
      geo: [28.3566155, -81.5594812],
    },
    19259335: {
      name: "Mickey & Minnie's Runaway Railway",
      priority: 2.2,
      geo: [28.3567406, -81.5606842],
    },
    19263735: {
      name: 'Millennium Falcon: Smugglers Run',
      priority: 2.0,
      geo: [28.353862, -81.5616967],
    },
    80010151: {
      name: 'Muppet*Vision 3D',
      geo: [28.3550576, -81.5595],
    },
    80010182: {
      name: "Rock 'n' Roller Coaster",
      geo: [28.3597607, -81.5606022],
      priority: 2.1,
    },
    18368386: {
      name: 'Meet Disney Stars @ Red Carpet Dreams',
      geo: [28.3560952, -81.5594433],
    },
    18368385: {
      name: 'Meet Olaf @ Celebrity Spotlight',
      geo: [28.3562836, -81.55906],
    },
    18904138: {
      name: 'Slinky Dog Dash',
      geo: [28.3562472, -81.5628474],
      priority: 1.1,
    },
    80010193: {
      name: 'Star Tours',
      geo: [28.3557799, -81.5588696],
      priority: 4.0,
    },
    19263736: {
      name: 'Rise of the Resistance',
      priority: 1.0,
      geo: [28.3548829, -81.5604682],
    },
    209857: {
      name: 'Toy Story Mania',
      geo: [28.3563865, -81.5619019],
      priority: 3.0,
    },
    80010218: {
      name: 'Twilight Zone Tower of Terror',
      geo: [28.3595812, -81.5597695],
      priority: 1.2,
    },
    // Animal Kingdom
    19330300: {
      name: 'Animation Experience',
      geo: [28.3652134, -81.5885522],
    },
    18665186: {
      name: 'Avatar Flight of Passage',
      geo: [28.3555698, -81.592292],
      priority: 1.0,
    },
    80010123: {
      name: 'DINOSAUR',
      priority: 3.0,
      geo: [28.3552805, -81.5884492],
    },
    26068: {
      name: 'Expedition Everest',
      geo: [28.3584979, -81.587395],
      priority: 3.1,
    },
    19581372: {
      name: 'Feathered Friends in Flight',
      geo: [28.3586675, -81.5900411],
    },
    12432: {
      name: 'Festival of the Lion King',
      geo: [28.3581957, -81.5925823],
    },
    411550125: {
      name: 'Finding Nemo: The Big Blue and Beyond',
      geo: [28.3574008, -81.5874145],
    },
    80010150: {
      name: "It's Tough to be a Bug",
      geo: [28.3574356, -81.5900851],
    },
    80010154: {
      name: 'Kali River Rapids',
      geo: [28.3592076, -81.5883195],
      priority: 2.0,
    },
    80010157: {
      name: 'Kilimanjaro Safaris',
      geo: [28.3592779, -81.5921478],
      priority: 1.2,
    },
    17421326: {
      name: 'Meet Disney Pals @ Adventurers Outpost',
      geo: [28.3579455, -81.5898647],
    },
    18665185: {
      name: "Na'vi River Journey",
      geo: [28.3551663, -81.591708],
      priority: 1.1,
    },
  },
  pdts: {
    80007944: pdts(647),
    80007838: pdts(767, 120, 4),
    80007998: pdts(647),
    80007823: pdts(617),
  },
};
export default data;
