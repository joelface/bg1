const pdts = (start: number, gap = 150, count = 3) =>
  [431, ...[...Array(count).keys()].map(i => start + i * gap)].map(m =>
    new Date(new Date().setHours(m / 60, m % 60, 0)).toTimeString().slice(0, 5)
  );

export default {
  parks: [
    {
      id: '80007944',
      name: 'Magic Kingdom',
      abbr: 'MK',
      theme: {
        bg: 'bg-fuchsia-600',
        // text-fuchsia-600
      },
    },
    {
      id: '80007838',
      name: 'EPCOT',
      abbr: 'EP',
      theme: {
        bg: 'bg-indigo-600',
        // text-indigo-600
      },
    },
    {
      id: '80007998',
      name: 'Hollywood Studios',
      abbr: 'HS',
      theme: {
        bg: 'bg-orange-600',
        // text-orange-600
      },
    },
    {
      id: '80007823',
      name: 'Animal Kingdom',
      abbr: 'AK',
      theme: {
        bg: 'bg-green-600',
        // text-green-600
      },
    },
  ],
  experiences: {
    // Magic Kingdom
    '16491297': { name: 'Barnstormer' },
    '80010110': { name: 'Big Thunder Mountain Railroad', priority: 2.2 },
    '80010114': { name: "Buzz Lightyear's Space Ranger Spin", priority: 3.2 },
    '80010129': { name: 'Dumbo the Flying Elephant' },
    '17718925': { name: 'Festival of Fantasy Parade' },
    '80010208': { name: 'Haunted Mansion', priority: 2.3 },
    '80010149': { name: "it's a small world", priority: 3.3 },
    '80010153': { name: 'Jungle Cruise', priority: 1.1 },
    '80010162': { name: 'Mad Tea Party' },
    '80010210': { name: 'Magic Carpets of Aladdin' },
    '80010213': { name: 'Many Adventures of Winnie the Pooh', priority: 3.1 },
    '80010170': { name: "Mickey's PhilharMagic" },
    '136550': { name: 'Monsters Inc. Laugh Floor' },
    '80010176': { name: "Peter Pan's Flight", priority: 1.2 },
    '80010177': { name: 'Pirates of the Caribbean', priority: 3.0 },
    '15850196': { name: 'Meet Mickey @ Town Square Theater' },
    '18498503': { name: 'Meet Cinderella @ Princess Fairytale Hall' },
    '17505397': { name: 'Meet Tiana @ Princess Fairytale Hall' },
    '16767284': { name: 'Seven Dwarfs Mine Train', priority: 1.0 },
    '80010190': { name: 'Space Mountain', priority: 2.1 },
    '80010192': { name: 'Splash Mountain', priority: 2.0 },
    '80010222': { name: 'Tomorrowland Speedway' },
    '16767263': { name: 'Under the Sea' },
    // Epcot
    '18269694': { name: 'Disney & Pixar Short Film Festival' },
    '18375495': { name: 'Frozen Ever After', priority: 1.2 },
    '80010152': { name: 'Journey Into Imagination' },
    '80010161': { name: 'Living with the Land' },
    '80010173': { name: 'Mission: SPACE', priority: 4.0 },
    '19497835': { name: "Remy's Ratatouille Adventure", priority: 1.0 },
    '107785': { name: 'Seas with Nemo & Friends' },
    '20194': { name: "Soarin' Around the World", priority: 3.0 },
    '80010191': { name: 'Spaceship Earth', priority: 4.1 },
    '80010199': { name: 'Test Track', priority: 1.1 },
    '62992': { name: 'Turtle Talk With Crush' },
    // Hollywood Studios
    '18904172': { name: 'Alien Swirling Saucers', priority: 3.0 },
    '80010848': { name: 'Beauty & The Beast Live on Stage' },
    '19583373': { name: 'Disney Junior Play and Dance' },
    '136': { name: 'Indiana Jones Epic Stunt Spectacular' },
    '17842841': { name: 'Frozen Sing-Along' },
    '19259335': { name: "Mickey & Minnie's Runaway Railway", priority: 2.2 },
    '19263735': { name: 'Millennium Falcon: Smugglers Run', priority: 2.0 },
    '80010151': { name: 'Muppet*Vision 3D' },
    '80010182': { name: "Rock 'n' Roller Coaster", priority: 2.1 },
    '18368386': { name: 'Meet Disney Stars @ Red Carpet Dreams' },
    '18368385': { name: 'Meet Olaf @ Celebrity Spotlight' },
    '18904138': { name: 'Slinky Dog Dash', priority: 1.1 },
    '80010193': { name: 'Star Tours', priority: 4.0 },
    '19263736': { name: 'Rise of the Resistance', priority: 1.0 },
    '209857': { name: 'Toy Story Mania', priority: 3.1 },
    '80010218': { name: 'Twilight Zone Tower of Terror', priority: 1.2 },
    // Animal Kingdom
    '19330300': { name: 'Animation Experience' },
    '18665186': { name: 'Avatar Flight of Passage', priority: 1.0 },
    '80010123': { name: 'DINOSAUR', priority: 3.0 },
    '26068': { name: 'Expedition Everest', priority: 3.1 },
    '19581372': { name: 'Feathered Friends in Flight' },
    '12432': { name: 'Festival of the Lion King' },
    '80010150': { name: "It's Tough to be a Bug" },
    '80010154': { name: 'Kali River Rapids', priority: 2.0 },
    '80010157': { name: 'Kilimanjaro Safaris', priority: 1.2 },
    '18665185': { name: "Na'vi River Journey", priority: 1.1 },
  },
  pdts: {
    '80007944': pdts(647),
    '80007838': pdts(767, 120, 4),
    '80007998': pdts(647),
    '80007823': pdts(617),
  },
};
