const D={id:"80007944",name:"Magic Kingdom",icon:"\u{1F3F0}",geo:{n:28.422,s:28.415,e:-81.575,w:-81.586},theme:{bg:"bg-fuchsia-600",text:"text-fuchsia-600"}},f={id:"80007838",name:"EPCOT",icon:"\u{1F310}",geo:{n:28.377,s:28.366,e:-81.545,w:-81.555},theme:{bg:"bg-indigo-600",text:"text-indigo-600"}},v={id:"80007998",name:"Hollywood Studios",icon:"\u{1F3AC}",geo:{n:28.362,s:28.353,e:-81.557,w:-81.564},theme:{bg:"bg-orange-600",text:"text-orange-600"}},P={id:"80007823",name:"Animal Kingdom",icon:"\u{1F333}",geo:{n:28.369,s:28.354,e:-81.585,w:-81.597},theme:{bg:"bg-green-600",text:"text-green-600"}},L=new Map([D,f,v,P].map(T=>[T.id,T])),i={name:"Main Street, USA",sort:1,theme:{bg:"bg-red-600",text:"text-red-700"}},d={name:"Adventureland",sort:2,theme:{bg:"bg-green-600",text:"text-green-700"}},h={name:"Frontierland",sort:3,theme:{bg:"bg-yellow-600",text:"text-yellow-700"}},u={name:"Liberty Square",sort:4,theme:{bg:"bg-indigo-600",text:"text-indigo-700"}},a={name:"Fantasyland",sort:5,theme:{bg:"bg-blue-600",text:"text-pink-700"}},n={name:"Tomorrowland",sort:6,theme:{bg:"bg-cyan-600",text:"text-cyan-700"}},l={name:"World Celebration",sort:1,theme:{bg:"bg-indigo-600",text:"text-indigo-700"}},s={name:"World Discovery",sort:2,theme:{bg:"bg-red-600",text:"text-red-700"}},t={name:"World Nature",sort:3,theme:{bg:"bg-green-600",text:"text-green-700"}},e={name:"World Showcase",sort:4,theme:{bg:"bg-yellow-600",text:"text-yellow-700"}},o={name:"Hollywood & Sunset",sort:1,theme:{bg:"bg-orange-600",text:"text-orange-700"}},b={name:"Toy Story Land",sort:2,theme:{bg:"bg-green-600",text:"text-green-700"}},E={name:"Star Wars: Galaxy's Edge",sort:3,theme:{bg:"bg-gray-600",text:"text-gray-700"}},m={name:"Echo Lake",sort:4,theme:{bg:"bg-indigo-600",text:"text-indigo-700"}},r={name:"Miscellaneous",sort:5,theme:{bg:"bg-red-600",text:"text-red-700"}},w={name:"Discovery Island",sort:1,theme:{bg:"bg-green-600",text:"text-green-700"}},F={name:"Pandora",sort:2,theme:{bg:"bg-cyan-600",text:"text-cyan-700"}},x={name:"Africa",sort:3,theme:{bg:"bg-yellow-600",text:"text-yellow-700"}},k={name:"Rafiki's Planet Watch",sort:4,theme:{bg:"bg-orange-600",text:"text-orange-700"}},g={name:"Asia",sort:5,theme:{bg:"bg-red-600",text:"text-red-700"}},A={name:"Dinoland USA",sort:6,theme:{bg:"bg-purple-600",text:"text-purple-700"}};let[y,c,p,C,R,S,H,M]=[];const B={80010107:{id:"80010107",name:"Astro Orbiter",land:n,sort:3},16491297:{id:"16491297",name:"Barnstormer",land:a,geo:[28.4208394,-81.5784733],sort:5},80010110:{id:"80010110",name:"Big Thunder Mountain Railroad",land:h,geo:[28.4197486,-81.5845092],priority:3,sort:1},80010114:{id:"80010114",name:"Buzz Lightyear's Space Ranger Spin",land:n,geo:[28.418446,-81.5796479],priority:3.5,sort:2},80010232:{id:"80010232",name:"Carousel of Progress",land:n,sort:7},80069748:{id:"80069748",name:"Country Bear Jamboree",land:h},8075:{id:"8075",name:"Dapper Dans",land:i},411550122:{id:"411550122",name:"Disney Adventure Friends Cavalcade",land:i},80010129:{id:"80010129",name:"Dumbo the Flying Elephant",land:a,geo:[28.4206047,-81.5789092],sort:6},16767276:{id:"16767276",name:"Enchanted Tales with Belle",land:a,geo:[28.4207354,-81.5807867],priority:3.2},16124144:{id:"16124144",name:"Enchanted Tiki Room",land:d},17718925:{id:"17718925",name:"Festival of Fantasy Parade",land:i,geo:[28.4189018,-81.5812001]},80069754:{id:"80069754",name:"Hall of Presidents",land:u},18672598:{id:"18672598",name:"Happily Ever After",land:i},80010208:{id:"80010208",name:"Haunted Mansion",land:u,geo:[28.4208771,-81.5830102],priority:2,sort:1},80010149:{id:"80010149",name:"it's a small world",land:a,geo:[28.4205055,-81.582156],sort:4,priority:4},412010035:{id:"412010035",name:"Jingle Cruise",land:d,geo:[28.4180339,-81.5834548],priority:1.2,sort:1},80010153:{id:"80010153",name:"Jungle Cruise",land:d,geo:[28.4180339,-81.5834548],priority:1.2,sort:1},80010160:{id:"80010160",name:"Liberty Square Riverboat",land:u},80010162:{id:"80010162",name:"Mad Tea Party",land:a,geo:[28.4200602,-81.5799004],sort:7},80010210:{id:"80010210",name:"Magic Carpets of Aladdin",land:d,geo:[28.4183166,-81.5835006],sort:4},80010213:{id:"80010213",name:"Many Adventures of Winnie the Pooh",land:a,geo:[28.4202297,-81.5801966],priority:3.4,sort:3},16874126:{id:"16874126",name:"Meet Ariel (Ariel's Grotto)",land:a,geo:[28.4208803,-81.5796853],type:"CHARACTER",priority:2.2},15850196:{id:"15850196",name:"Meet Mickey (Town Square Theater)",land:i,geo:[28.4167334,-81.5803937],type:"CHARACTER",priority:3.1},18498503:{id:"18498503",name:"Meet Cinderella (Princess Fairytale Hall)",land:a,geo:[28.4199771,-81.5808316],type:"CHARACTER",priority:2.1},387133:{id:"387133",name:"Meet Donald/Goofy (Pete's Silly Side Show)",land:a,type:"CHARACTER"},15743682:{id:"15743682",name:"Meet Minnie/Daisy (Pete's Silly Side Show)",land:a,type:"CHARACTER"},17505397:{id:"17505397",name:"Meet Tiana (Princess Fairytale Hall)",land:a,geo:[28.4199771,-81.5808316],type:"CHARACTER",priority:3.3},19579538:{id:"19579538",name:"Mickey's Celebration Cavalcade",land:i},18381020:{id:"18381020",name:"Mickey's Magical Friendship Faire",land:i},80010170:{id:"80010170",name:"Mickey's PhilharMagic",land:a,geo:[28.4200575,-81.5814156]},136550:{id:"136550",name:"Monsters Inc. Laugh Floor",land:n,geo:[28.4179954,-81.5800854],sort:6},80010224:{id:"80010224",name:"PeopleMover",land:n,sort:5},80010176:{id:"80010176",name:"Peter Pan's Flight",land:a,geo:[28.4203332,-81.5818676],priority:1.3,sort:2},80010177:{id:"80010177",name:"Pirates of the Caribbean",land:d,geo:[28.4180994,-81.5842719],priority:3.6,sort:2},80010117:{id:"80010117",name:"Prince Charming Regal Carrousel",land:a,sort:8},8515:{id:"8515",name:"See Buzz/Stitch (Rocket Tower Plaza Stage)",land:n,type:"CHARACTER"},16767284:{id:"16767284",name:"Seven Dwarfs Mine Train",land:a,geo:[28.4204112,-81.5805506],priority:1.1,sort:1},80010190:{id:"80010190",name:"Space Mountain",land:n,geo:[28.4187869,-81.5782063],priority:2.3,sort:1},80010196:{id:"80010196",name:"Swiss Family Treehouse",land:d},80010220:{id:"80010220",name:"Tom Sawyer's Island",land:h},80010222:{id:"80010222",name:"Tomorrowland Speedway",land:n,geo:[28.4194062,-81.5793505],sort:4},411504498:{id:"411504498",name:"TRON Lightcycle / Run",land:n,geo:[28.4202075,-81.577053],priority:1,sort:8},16767263:{id:"16767263",name:"Under the Sea",land:a,geo:[28.4210351,-81.5799673],sort:4},78700:{id:"78700",name:"Alberta Bound",land:e},80010200:{id:"80010200",name:"American Adventure",land:e,type:"ENTERTAINMENT"},19473173:{id:"19473173",name:"Awesome Planet",land:t},19463785:{id:"19463785",name:"Beauty & the Beast Sing-Along",land:e},80010174:{id:"80010174",name:"Canada Far and Wide",land:e},19036653:{id:"19036653",name:"Canada Mill Stage Entertainment",land:e},18269694:{id:"18269694",name:"Disney & Pixar Short Film Festival",land:l,geo:[28.3720463,-81.5508243]},19242311:{id:"19242311",name:"Germany Gazebo Entertainment",land:e},19258170:{id:"19258170",name:"Epcot Forever",land:e},18375495:y={id:"18375495",name:"Frozen Ever After",land:e,geo:[28.3706716,-81.5465556],priority:1.2,sort:2},207395:{id:"207395",name:"Gran Fiesta Tour",land:e,sort:3},18923661:{id:"18923661",name:"Groovin' Alps",land:e},411499845:{id:"411499845",name:"Guardians of the Galaxy: Cosmic Rewind",land:s,geo:[28.3747479,-81.5478405],priority:1,sort:3},13507:{id:"13507",name:"Jammitors",land:l},80010152:{id:"80010152",name:"Journey Into Imagination",land:l,geo:[28.372896,-81.5512292],sort:2},411794307:{id:"411794307",name:"Journey of Water, Inspired by Moana",land:t},19516307:{id:"19516307",name:"Julia Scheeser & Band",land:e},411928911:{id:"411928911",name:"Les Raftsmen",land:e},80010161:{id:"80010161",name:"Living with the Land",land:t,geo:[28.3739368,-81.5526389],sort:2},412010036:{id:"412010036",name:"Living with the Land",land:t,geo:[28.3739368,-81.5526389],sort:2},19322758:{id:"19322758",name:"Mariachi Cobre",land:e},80010865:{id:"80010865",name:"Matsuriza",land:e},15695444:{id:"15695444",name:"Meet Mary Poppins (UK)",land:e,type:"CHARACTER"},15574092:{id:"15574092",name:"Meet Princess Aurora (France)",land:e,type:"CHARACTER"},80010173:{id:"80010173",name:"Mission: SPACE",land:s,geo:[28.3739368,-81.5526389],priority:4,sort:2},18780200:{id:"18780200",name:"Raffy",land:e},80010180:{id:"80010180",name:"Reflections of China",land:e},19497835:c={id:"19497835",name:"Remy's Ratatouille Adventure",land:e,geo:[28.3680021,-81.5534178],priority:1.1,sort:1},107785:{id:"107785",name:"Seas with Nemo & Friends",land:t,geo:[28.3748995,-81.5507208],sort:3},20194:{id:"20194",name:"Soarin' Around the World",land:t,geo:[28.3735924,-81.5522783],priority:3,sort:1},412001587:{id:"412001587",name:"Soarin' Over California",land:t,geo:[28.3735924,-81.5522783],priority:2,sort:1},80010191:{id:"80010191",name:"Spaceship Earth",land:l,geo:[28.3754661,-81.5493961],priority:4.1,sort:1},80010199:p={id:"80010199",name:"Test Track",land:s,geo:[28.3733374,-81.5474931],priority:1.3,sort:1},62992:{id:"62992",name:"Turtle Talk With Crush",land:t,geo:[28.3753989,-81.5511449],sort:4},80010879:{id:"80010879",name:"Voices of Liberty",land:e},18904172:{id:"18904172",name:"Alien Swirling Saucers",land:b,geo:[28.3553702,-81.5624558],priority:3.1,sort:3},80010848:{id:"80010848",name:"Beauty & the Beast Live on Stage",land:o,geo:[28.3591529,-81.5597641]},19583373:{id:"19583373",name:"Disney Junior Play and Dance",land:r,geo:[28.3579409,-81.5607914]},18693119:{id:"18693119",name:"Disney Movie Magic",land:o},80010887:{id:"80010887",name:"Fantasmic!",land:o,geo:[28.3599166,-81.5592299]},136:{id:"136",name:"Indiana Jones Epic Stunt Spectacular",land:m,geo:[28.3567464,-81.5588053]},17842841:{id:"17842841",name:"Frozen Sing-Along",land:m,geo:[28.3566155,-81.5594812]},19276204:{id:"19276204",name:"Lightning McQueen's Racing Academy",land:o},411926516:{id:"411926516",name:"Meet Ariel (Walt Disney Presents)",land:r,type:"CHARACTER"},18189394:{id:"18189394",name:"Meet Chewbacca (Launch Bay)",land:r,type:"CHARACTER"},224093:{id:"224093",name:"Meet Disney Junior Pals (Animation Courtyard)",land:r,type:"CHARACTER"},18368386:{id:"18368386",name:"Meet Disney Stars (Red Carpet Dreams)",land:r,geo:[28.3560952,-81.5594433],type:"CHARACTER"},19205017:{id:"19205017",name:"Meet Edna Mode (Edna Mode Experience)",land:r,type:"CHARACTER"},18368385:{id:"18368385",name:"Meet Olaf (Celebrity Spotlight)",land:m,geo:[28.3562836,-81.55906],type:"CHARACTER"},19259335:{id:"19259335",name:"Mickey & Minnie's Runaway Railway",land:o,geo:[28.3567406,-81.5606842],priority:2,sort:1},19263735:{id:"19263735",name:"Millennium Falcon: Smugglers Run",land:E,geo:[28.353862,-81.5616967],priority:2.2,sort:2},80010151:{id:"80010151",name:"Muppet*Vision 3D",land:r,geo:[28.3550576,-81.5595]},80010182:{id:"80010182",name:"Rock 'n' Roller Coaster",land:o,geo:[28.3597607,-81.5606022],priority:2.1,sort:3},18904138:C={id:"18904138",name:"Slinky Dog Dash",land:b,geo:[28.3562472,-81.5628474],priority:1.1,sort:1},80010193:{id:"80010193",name:"Star Tours",land:m,geo:[28.3557799,-81.5588696],priority:4,sort:1},19263736:{id:"19263736",name:"Rise of the Resistance",land:E,geo:[28.3548829,-81.5604682],priority:1,sort:1},209857:R={id:"209857",name:"Toy Story Mania",land:b,geo:[28.3563865,-81.5619019],priority:3,sort:2},80010218:S={id:"80010218",name:"Twilight Zone Tower of Terror",land:o,geo:[28.3595812,-81.5597695],priority:2.3,sort:2},19330300:{id:"19330300",name:"Animation Experience",land:k,geo:[28.3652134,-81.5885522]},18665186:{id:"18665186",name:"Avatar Flight of Passage",land:F,geo:[28.3555698,-81.592292],priority:1,sort:1},80010123:{id:"80010123",name:"DINOSAUR",land:A,geo:[28.3552805,-81.5884492],priority:3.1,sort:1},26068:H={id:"26068",name:"Expedition Everest",land:g,geo:[28.3584979,-81.587395],priority:3,sort:1},19581372:{id:"19581372",name:"Feathered Friends in Flight",land:g,geo:[28.3586675,-81.5900411]},12432:{id:"12432",name:"Festival of the Lion King",land:x,geo:[28.3581957,-81.5925823]},411550125:{id:"411550125",name:"Finding Nemo: The Big Blue and Beyond",land:A,geo:[28.3574008,-81.5874145]},80010175:{id:"80010175",name:"Gorilla Falls Exploration Trail",land:x},80010150:{id:"80010150",name:"It's Tough to be a Bug",land:w,geo:[28.3574356,-81.5900851]},80010154:M={id:"80010154",name:"Kali River Rapids",land:g,geo:[28.3592076,-81.5883195],priority:3.2},80010157:{id:"80010157",name:"Kilimanjaro Safaris",land:x,geo:[28.3592779,-81.5921478],priority:2.1,sort:1},80010164:{id:"80010164",name:"Maharajah Jungle Trek",land:g},17421326:{id:"17421326",name:"Meet Disney Pals (Adventurers Outpost)",land:w,geo:[28.3579455,-81.5898647],type:"CHARACTER",priority:2},411921961:{id:"411921961",name:"Meet Moana (Character Landing)",land:s,type:"CHARACTER"},18665185:{id:"18665185",name:"Na'vi River Journey",land:F,geo:[28.3551663,-81.591708],priority:1.1,sort:2},80010228:{id:"80010228",name:"Triceratop Spin",land:A,sort:2}},W={[f.id]:[{time:"11:47",experiences:[y]},{time:"12:47",experiences:[p]},{time:"13:47",experiences:[c]},{time:"14:47",experiences:[p]},{time:"15:47",experiences:[c]},{time:"16:47",experiences:[y,p]},{time:"18:47",experiences:[y,c]}],[v.id]:[{time:"13:17",experiences:[C,S,R]},{time:"15:47",experiences:[C,S,R]}],[P.id]:[{time:"12:47",experiences:[H,M]},{time:"15:17",experiences:[M]}]};export{W as drops,B as experiences,L as parks};
