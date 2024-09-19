import { dateTimeStrings } from '@/datetime';
import { fetchJson } from '@/fetch';

import { Experience } from './ll';
import { InvalidId, Park, Resort } from './resort';

interface ShowtimesByParkId {
  [parkId: string]: { [expId: string]: string[] };
}

export class LiveDataClient {
  protected cachedShowtimes: ShowtimesByParkId = {};

  constructor(protected resort: Resort) {}

  async shows(park: Park): Promise<{ [id: string]: Experience }> {
    if (Object.keys(this.cachedShowtimes).length === 0) {
      this.cachedShowtimes = (await this.request('showtimes')).data;
    }
    const showtimesByExpId = this.cachedShowtimes[park.id] ?? {};
    const { time: now } = dateTimeStrings();
    return Object.fromEntries(
      Object.entries(showtimesByExpId).flatMap(([id, showtimes]) => {
        const upcomingTimes = showtimes.filter(t => t >= now);
        const nextShowTime = upcomingTimes[0];
        const additionalShowTimes = upcomingTimes.slice(1);
        const available = nextShowTime !== undefined;
        const unavailableReason = available ? undefined : 'NO_MORE_SHOWS';
        try {
          return [
            [
              id,
              {
                type: 'ENTERTAINMENT',
                ...this.resort.experience(id),
                park,
                standby: { available, unavailableReason, nextShowTime },
                additionalShowTimes,
              },
            ],
          ];
        } catch (error) {
          if (error instanceof InvalidId) return [];
          throw error;
        }
      })
    );
  }

  protected async request(resource: string) {
    const response = await fetchJson<ShowtimesByParkId>(
      `https://bg1.joelface.com/livedata/${this.resort.id.toLowerCase()}/${resource}.json`
    );
    if (!response.ok) throw new Error('Fetch failed');
    return response;
  }
}
