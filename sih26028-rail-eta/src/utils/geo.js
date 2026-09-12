// utils/geo.js ya helpers.js
export function sanitizeIndiaCoords(coord1, coord2) {
    const n1 = parseFloat(coord1);
    const n2 = parseFloat(coord2);

    if (isNaN(n1) || isNaN(n2)) {
        throw new Error("Invalid coordinate values");
    }

    // India ke case mein Lat hamesha (8 to 37) aur Lng hamesha (68 to 97) hota hai
    const lat = Math.min(n1, n2);
    const lng = Math.max(n1, n2);

    return { lat, lng };
}