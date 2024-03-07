import { withCoords } from '@/testing';

import { geolocate } from '../geolocate';

const gcpMock = jest.spyOn(navigator.geolocation, 'getCurrentPosition');

describe('geolocate()', () => {
  it('returns position', async () => {
    await withCoords([41.1074, -85.1548], async () => {
      await expect(geolocate()).resolves.toEqual({
        coords: { latitude: 41.1074, longitude: -85.1548 },
      });
      expect(gcpMock).toHaveBeenLastCalledWith(
        expect.any(Function),
        expect.any(Function),
        {}
      );

      const options = {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 5_000,
      };
      await expect(geolocate(options)).resolves.toEqual({
        coords: { latitude: 41.1074, longitude: -85.1548 },
      });
      expect(gcpMock).toHaveBeenLastCalledWith(
        expect.any(Function),
        expect.any(Function),
        options
      );
    });
  });

  it('throws error on failure', async () => {
    await withCoords(undefined, async () => {
      await expect(geolocate()).rejects.toEqual({
        code: 2,
        message: 'Position unavailable',
      });
    });
  });
});
