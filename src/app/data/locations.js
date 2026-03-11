/**
 * Campus Quest - TU Dublin Blanchardstown Locations
 * Coordinates in Mapbox format [Longitude, Latitude]
 */

const S3 = "https://campusquesttud.s3.eu-west-1.amazonaws.com/photos";

export const locations = [
    {
        "id": "CAFE",
        "name": "LINC Building",
        "image": `${S3}/lincbuilding.jpg`,
        "coordinates": [-6.379799, 53.406355],
        "description": "Cafe shop, admin offices.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "AG-BLOCK",
        "name": "New Building",
        "image": `${S3}/agblock.jpg`,
        "coordinates": [-6.379109, 53.404622],
        "description": "Classrooms, lecture halls, seating areas, meeting rooms.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "A-BLOCK",
        "name": "Computer Labs",
        "image": `${S3}/ablock.jpg`,
        "coordinates": [-6.376366, 53.406213],
        "description": "Classrooms, lecture halls, seating areas.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "C-BLOCK",
        "name": "Main Building",
        "image": `${S3}/cblock.jpg`,
        "coordinates": [-6.378489, 53.405434],
        "description": "Canteen, SU, sports hall, corner shop.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "D-BLOCK",
        "name": "Engineering and Childcare",
        "image": `${S3}/dblock.jpg`,
        "coordinates": [-6.377446, 53.405724],
        "description": "Lecture halls, engineering rooms, childcare rooms.",
        "floors": ["Ground"]
    },
    {
        "id": "E-BLOCK",
        "name": "Networking Building",
        "image": `${S3}/eblock.jpg`,
        "coordinates": [-6.377734, 53.405241],
        "description": "Classrooms, lecture halls, networking rooms.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "F-BLOCK",
        "name": "Campus Library & Information Office",
        "image": `${S3}/fblock.jpg`,
        "coordinates": [-6.378422, 53.404746],
        "description": "Library, classrooms, lecture halls, security.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "S-BLOCK",
        "name": "Sports Building",
        "image": `${S3}/sblock.jpg`,
        "coordinates": [-6.381347, 53.405884],
        "description": "Gym and training facilities, classrooms.",
        "floors": ["Ground"]
    },
    {
        "id": "CONNECT",
        "name": "Connect Building",
        "image": `${S3}/connectbuilding.jpg`,
        "coordinates": [-6.379305, 53.404810],
        "description": "Student services desk.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "PARKING",
        "name": "Car Park",
        "image": `${S3}/tud.jpeg`,
        "coordinates": [-6.380530, 53.404767],
        "description": "Main visitor and staff campus parking.",
        "floors": ["N/A"]
    }
];

export default locations;