const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

export function calculateQiblaBearing(lat, lng, kaabaLat, kaabaLng) {
  const lat1 = toRad(lat);
  const lat2 = toRad(kaabaLat);
  const deltaLng = toRad(kaabaLng - lng);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let bearing = toDeg(Math.atan2(y, x));
  if (bearing < 0) bearing += 360;

  return Math.round(bearing);
}
