// geolocation: https://openlayers.org/en/v8.1.0/examples/geolocation.html
// geolocation tracking: https://openlayers.org/en/v8.1.0/examples/geolocation-orientation.html
// mobile fullscreen map: https://openlayers.org/en/v8.1.0/examples/mobile-full-screen.html

function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function calculateHaversineDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const earthRadiusKm = 6371; // Radius of the Earth in kilometers
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    const radLat1 = degreesToRadians(lat1);
    const radLat2 = degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return distance * 1000; // Convert distance to meters
}