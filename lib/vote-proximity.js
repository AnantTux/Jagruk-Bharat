export const MAX_VOTE_DISTANCE_KM = 5;

export function parseVoterLocation(value) {
    if (!value || typeof value !== "object")
        return null;
    const lat = Number(value.lat);
    const lng = Number(value.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return null;
    return { lat, lng };
}

export function distanceInKm(first, second) {
    const toRadians = (value) => value * Math.PI / 180;
    const latitudeDelta = toRadians(second.lat - first.lat);
    const longitudeDelta = toRadians(second.lng - first.lng);
    const a = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(toRadians(first.lat)) * Math.cos(toRadians(second.lat)) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
