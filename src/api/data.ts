export interface Park {
  id: string;
  name: string;
  icon: string;
  geo: { n: number; s: number; e: number; w: number };
  theme: { bg: string; text: string };
}

export interface Land {
  name: string;
  sort: number;
  theme: { bg: string; text: string };
}

export type ExperienceType = 'ATTRACTION' | 'ENTERTAINMENT' | 'CHARACTER';

export interface Experience {
  id: string;
  name: string;
  land: Land;
  geo?: readonly [number, number];
  type?: ExperienceType;
  priority?: number;
  sort?: number;
}

export interface Drop {
  time: string;
  experiences: Experience[];
}

export type Resort = 'WDW' | 'DLR';
export type Parks = Map<string, Park>;
export type Experiences = { [id: string]: Experience | null | undefined };
export type Drops = { [id: string]: Drop[] | undefined };

export interface ResortData {
  resort: Resort;
  parks: Parks;
  experiences: Experiences;
  drops: Drops;
}

export async function loadResortData(resort: Resort): Promise<ResortData> {
  return {
    resort,
    ...(await import(`./data/${resort.toLowerCase()}.ts`)),
  };
}
