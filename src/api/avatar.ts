const ID_TO_NAME: { [id: string]: string } = {
  48199: 'Mr-Incredible',
  48200: 'Mrs-Incredible',
  261227: 'Nemo',
  339625: 'Russell',
  339626: 'Carl',
  364907: 'Jack-Skellington',
  431014: 'Princess-Tiana',
  431065: 'Darth_Vader',
  15549505: 'Rapunzel',
  15655408: 'Default_SignedIn',
  15675686: 'Crush',
  15831168: 'Wall-E',
  16453979: 'Merida',
  16726412: 'Stormtrooper',
  16818199: 'Violet',
  16869301: 'Jack-Jack',
  17345357: 'R2-D2',
  17345359: 'C-3PO',
  17532220: 'Bruce',
  17532224: 'Green-Alien',
  17532227: 'Kermit',
  17532228: 'Sorcerer-Mickey',
  17577168: 'Elsa',
  17577169: 'Anna',
  17813977: 'Olaf',
  17888784: 'Yoda',
  18101167: 'Captain-Mickey',
  18368743: '-Nick',
  18368747: '-Judy',
  18393706: '-Flash',
  18403761: 'kion',
  18405224: '-Moana',
  18405236: '-Elena',
  19633995: '50th_Mickey',
  19633996: '50th_Minnie',
  90003819: 'Alice',
  90003846: 'Ariel',
  90003898: 'Belle',
  90003967: 'Buzz',
  90003976: 'Captain-Hook',
  90004004: 'Chesire-Cat',
  90004017: 'Cinderella',
  90004068: 'Daisy',
  90004076: 'Dash',
  90004104: 'Donald',
  90004228: 'Goofy',
  90004260: 'Hamm',
  90004328: 'Princess-Jasmine',
  90004340: 'Jiminy',
  90004395: 'Lady',
  90004482: 'Mickey-Mouse',
  90004486: 'Minnie',
  90004537: 'Mulan',
  90004605: 'Peter-Pan',
  90004625: 'Pluto',
  90004626: 'Pocahontas',
  90004642: 'Princess-Aurora',
  90004682: 'Rex',
  90004772: 'Snow-White',
  90004778: 'Sparky',
  90004846: 'TinkerBell',
  90004860: 'Tramp',
  90004939: 'Zero',
};

const URL_PREFIX =
  'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/90/90/75/dam/';
const URL_DEFAULT =
  URL_PREFIX + 'wdpro-assets/avatars/180x180/RetAvatar_180x180_';
const URL_HYPHEN =
  URL_PREFIX + 'wdpro-assets/avatars/180x180/RetAvatar-180x180';
const URL_50TH =
  URL_PREFIX + 'disney-world/50th-anniversary/avatars/RetAvatar_180x180_';
const FIRST_LETTER_TO_URL: { [key: string]: string } = {
  '-': URL_HYPHEN,
  '5': URL_50TH,
};

export function avatarUrl(characterId: string | undefined): string | undefined {
  const name = ID_TO_NAME[characterId || ''];
  if (!name) return;
  return (FIRST_LETTER_TO_URL[name[0]] || URL_DEFAULT) + name + '.png';
}
