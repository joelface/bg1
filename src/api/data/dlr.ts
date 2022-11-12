import { ResortData } from '../genie';

const data: ResortData = {
  parks: [
    {
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
    },
    {
      id: '336894',
      name: 'California Adventure',
      icon: '☀️',
      geo: {
        n: 33.8091255,
        s: 33.8037845,
        e: -117.9155825,
        w: -117.9243814,
      },
      theme: { bg: 'bg-yellow-600', text: 'text-yellow-600' },
    },
  ],
  experiences: {
    // Disneyland
    353293: {
      name: 'Autopia',
      geo: [33.8126634, -117.9167994],
    },
    353295: {
      name: 'Big Thunder Mountain Railroad',
      geo: [33.8124801, -117.9205132],
      priority: 3.6,
    },
    353301: {
      name: 'Buzz Lightyear Astro Blasters',
      geo: [33.8122751, -117.9181819],
    },
    353347: {
      name: 'Haunted Mansion',
      geo: [33.811616, -117.9218924],
      priority: 3.5,
    },
    18249927: {
      name: 'Haunted Mansion Holiday',
      geo: [33.811616, -117.9218924],
      priority: 2.1,
    },
    353355: {
      name: 'Indiana Jones Adventure',
      geo: [33.8114097, -117.9204077],
      priority: 2.0,
    },
    367492: {
      name: "it's a small world",
      geo: [33.8144167, -117.9181268],
    },
    18237232: {
      name: "it's a small world Holiday",
      geo: [33.8144167, -117.9181268],
      priority: 2.4,
    },
    353377: {
      name: 'Matterhorn Bobsleds',
      geo: [33.8127838, -117.9182386],
      priority: 3.4,
    },
    19193459: {
      name: 'Millennium Falcon: Smugglers Run',
      geo: [33.8153228, -117.922197],
      priority: 2.3,
    },
    353405: {
      name: 'Pirates of the Caribbean',
      geo: [33.811295, -117.9209785],
    },
    353421: {
      name: "Roger Rabbit's Car Toon Spin",
      geo: [33.8155682, -117.9181205],
    },
    353435: {
      name: 'Space Mountain',
      geo: [33.8112647, -117.9175892],
      priority: 2.2,
    },
    18237368: {
      name: 'Hyperspace Mountain',
      geo: [33.8112647, -117.9175892],
      priority: 2.2,
    },
    353437: {
      name: 'Splash Mountain',
      geo: [33.8123509, -117.9221379],
    },
    353439: {
      name: 'Star Tours',
      geo: [33.8119436, -117.9182118],
    },
    19193461: {
      name: 'Rise of the Resistance',
      geo: [33.8135671, -117.9236346],
      priority: 1.0,
    },
    // California Adventure
    15822029: {
      name: "Goofy's Sky School",
      geo: [33.8062523, -117.9228425],
    },
    353345: {
      name: 'Grizzly River Run',
      geo: [33.8069638, -117.9212689],
      priority: 3.1,
    },
    353451: {
      name: 'Guardians of the Galaxy – Mission: BREAKOUT',
      geo: [33.8068606, -117.9172434],
      priority: 2.0,
    },
    18774860: {
      name: 'Guardians of the Galaxy – Monsters After Dark',
      geo: [33.8068606, -117.9172434],
      priority: 2.0,
    },
    353303: {
      name: 'Incredicoaster',
      geo: [33.8046948, -117.9207725],
    },
    353387: {
      name: 'Monsters, Inc.',
      geo: [33.8081471, -117.9175137],
    },
    353431: {
      name: "Soarin' Around the World",
      geo: [33.8085516, -117.9204917],
      priority: 3.2,
    },
    19324604: {
      name: "Soarin' Over California",
      geo: [33.8085516, -117.9204917],
      priority: 3.2,
    },
    353453: {
      name: 'Toy Story Midway Mania',
      geo: [33.804614, -117.9216383],
      priority: 3.0,
    },
    16514416: {
      name: 'Radiator Springs Racers',
      geo: [33.8052475, -117.9198715],
      priority: 1.0,
    },
    19531124: {
      name: 'WEB SLINGERS',
      geo: [33.8067598, -117.91849],
    },
  },
  pdts: {},
};
export default data;
