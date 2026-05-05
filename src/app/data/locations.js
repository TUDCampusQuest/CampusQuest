const S3 = "https://campusquesttud.s3.eu-west-1.amazonaws.com/photos";

export const locations = [
    {
        "id": "CAFE",
        "name": "LINC Building",
        "buildingId": 1004438,
        "image": `${S3}/lincbuilding.jpg`,
        "coordinates": [-6.379799, 53.406355],
        "description": "Cafe shop, admin offices.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "AG-BLOCK",
        "name": "New Building",
        "buildingId": 1012768,
        "image": `${S3}/agblock.jpg`,
        "coordinates": [-6.378986834714482, 53.404555072834626],
        "description": "Classrooms, lecture halls, seating areas, meeting rooms.",
        "floors": ["Ground", "First", "Second"]
    },
    {
        "id": "A-BLOCK",
        "name": "Computer Labs",
        "buildingId": 1004437,
        "image": `${S3}/ablock.jpg`,
        "coordinates": [-6.376366, 53.406213],
        "description": "Classrooms, lecture halls, seating areas.",
        "floors": ["Ground"]
    },
    {
        "id": "C-BLOCK",
        "name": "Main Building",
        "buildingId": 1004439,
        "image": `${S3}/cblock.jpg`,
        "coordinates": [-6.378489, 53.405434],
        "description": "Canteen, SU, sports hall, corner shop.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "D-BLOCK",
        "name": "Engineering and Childcare",
        "buildingId": 1004442,
        "image": `${S3}/dblock.jpg`,
        "coordinates": [-6.377446, 53.405724],
        "description": "Lecture halls, engineering rooms, childcare rooms.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "E-BLOCK",
        "name": "Networking Building",
        "buildingId": 1004443,
        "image": `${S3}/eblock.jpg`,
        "coordinates": [-6.377734, 53.405241],
        "description": "Classrooms, lecture halls, networking rooms.",
        "floors": ["Ground", "First", "Second"]
    },
    {
        "id": "F-BLOCK",
        "name": "Campus Library & Information Office",
        "buildingId": 1004444,
        "image": `${S3}/fblock.jpg`,
        "coordinates": [-6.378422, 53.404746],
        "description": "Library, classrooms, lecture halls, security.",
        "floors": ["Ground", "First", "Second"]
    },
    {
        "id": "S-BLOCK",
        "name": "Sports Building",
        "buildingId": 1003509,
        "image": `${S3}/sblock.jpg`,
        "coordinates": [-6.381347, 53.405884],
        "description": "Gym and training facilities, classrooms.",
        "floors": ["Ground", "First"]
    },
    {
        "id": "CONNECT",
        "name": "Connect Building",
        "buildingId": 1004445,
        "image": `${S3}/connectbuilding.jpg`,
        "coordinates": [-6.379283132509414, 53.404780417206155],
        "description": "Student services desk.",
        "floors": ["Ground", "First", "Second"]
    },
    {
        "id": "T-BLOCK",
        "name": "Horticulture Building",
        "buildingId": 1004446,
        "image": `${S3}/horiculture.png`,
        "coordinates": [-6.382226, 53.404683],
        "description": "Horticulture workshops, offices.",
        "floors": ["Ground"]
    },
    {
        "id": "PARKING",
        "name": "Car Park",
        "image": `${S3}/carpark.png`,
        "coordinates": [-6.380530, 53.404767],
        "description": "Main visitor and staff campus parking.",
        "floors": ["N/A"]
    }
];

export default locations;
