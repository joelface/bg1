import { fetchJson } from '@/fetch';
import { Experience as ExperienceData, Park, ResortData } from './data';
import { dateTimeStrings, displayTime } from '@/datetime';
import { Experience } from './genie';

interface ShowtimesByParkId {
  [parkId: string]: { [expId: string]: string[] };
}

export class LiveDataClient {
  protected data: ResortData;
  protected cachedShowtimes: ShowtimesByParkId = {};

  constructor(data: ResortData) {
    this.data = data;
  }

  async shows(park: Park): Promise<{ [id: string]: Experience }> {
    if (Object.keys(this.cachedShowtimes).length === 0) {
      this.cachedShowtimes = (await this.request('showtimes')).data;
    }
    const showtimesByExpId = this.cachedShowtimes[park.id] ?? {};
    const { time: now } = dateTimeStrings();
    return Object.fromEntries(
      Object.entries(showtimesByExpId)
        .filter(([id]) => id in this.data.experiences)
        .map(([id, showtimes]) => {
          const upcomingTimes = showtimes
            .filter(t => t >= now)
            .map(t => displayTime(t));
          const displayNextShowTime = upcomingTimes[0];
          const displayAdditionalShowTimes = upcomingTimes.slice(1);
          const available = displayNextShowTime !== undefined;
          const unavailableReason = available ? undefined : 'NO_MORE_SHOWS';
          return [
            id,
            {
              type: 'ENTERTAINMENT',
              ...(this.data.experiences[id] as ExperienceData),
              park,
              standby: { available, unavailableReason, displayNextShowTime },
              displayAdditionalShowTimes,
            },
          ];
        })
    );
  }

  protected async request(resource: string) {
    const response = await fetchJson<ShowtimesByParkId>(
      `https://bg1.joelface.com/livedata/${this.data.resort.toLowerCase()}/${resource}.json`
    );
    if (!response.ok) throw new Error('Fetch failed');
    return response;
  }
}
