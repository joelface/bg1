export interface Park {
  id: string;
  name: string;
  icon: string;
  geo: { n: number; s: number; e: number; w: number };
  theme: { bg: string; text: string };
  dropTimes: string[];
}

export interface Land {
  name: string;
  sort: number;
  theme: { bg: string; text: string };
  park: Park;
}

export type ExperienceType =
  | 'ATTRACTION'
  | 'ENTERTAINMENT'
  | 'CHARACTER'
  | 'HOLIDAY';

export interface Experience {
  id: string;
  name: string;
  land: Land;
  park: Park;
  geo?: readonly [number, number];
  type?: ExperienceType;
  priority?: number;
  sort?: number;
}

type ParkData = Omit<Park, 'dropTimes'>;
type LandData = Omit<Land, 'park'> & { park: ParkData };
export type ExperienceData = Omit<Experience, 'id' | 'land' | 'park'> & {
  land: LandData;
};

export interface ResortData {
  parks: ParkData[];
  experiences: {
    [id: string | number]: ExperienceData | null | undefined;
  };
  drops: {
    [parkId: string]:
      | {
          time: string;
          experiences: ExperienceData[];
        }[]
      | undefined;
  };
}

export class InvalidId extends Error {
  name = 'InvalidId';

  constructor(id: string) {
    super(`Invalid ID: ${id}`);
  }
}

export interface Drop {
  time: string;
  experiences: Experience[];
}

export class Resort {
  readonly parks: Park[];
  protected parksById: { [id: string]: Park | undefined };
  protected expsById: { [id: string]: Experience | null | undefined };
  protected dropsByParkId: {
    [parkId: string]: Drop[] | undefined;
  };

  constructor(
    readonly id: 'WDW' | 'DLR',
    data: ResortData
  ) {
    this.parks = data.parks as Park[];
    this.parksById = Object.fromEntries(this.parks.map(p => [p.id, p]));
    this.expsById = data.experiences as Resort['expsById'];
    for (const [id, exp] of Object.entries(this.expsById)) {
      if (exp) {
        exp.id = id;
        exp.park = exp.land.park;
      }
    }
    this.dropsByParkId = data.drops as typeof this.dropsByParkId;
  }

  experience(id: string) {
    const exp = this.expsById[id];
    if (exp) return exp;
    if (exp !== null) console.warn(`Missing experience: ${id}`);
    throw new InvalidId(id);
  }

  park(id: string) {
    const park = this.parksById[id];
    if (park) return park;
    throw new InvalidId(id);
  }

  drops(park: Pick<Park, 'id'>) {
    return this.dropsByParkId[park.id] ?? [];
  }
}

export async function loadResort(id: Resort['id']): Promise<Resort> {
  const data: ResortData = await import(`./data/${id.toLowerCase()}.ts`);
  return new Resort(id, data);
}
