export async function geolocate(
  options: PositionOptions = {}
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve(pos);
      },
      error => {
        reject(error);
      },
      options
    );
  });
}
