// Missing/wrong entries in the S3 campus graph — applied at runtime to avoid redeploying the data file.
// A Block path: A Block entrance → campus avenue road (west) → south past BC building → main_1.
// The south leg jogs east of BC's east wall (-6.37795) before cutting south, since BC blocks a
// straight descent from ave_7 (-6.37843 which falls inside BC's lng range).
export const GRAPH_NODE_PATCHES = [
    { id: 'a_block_entrance', lng: -6.376366,  lat: 53.406213,  type: 'entrance', name: 'A Block entrance' },
    { id: 'ave_1', lng: -6.376465, lat: 53.406013, type: 'junction', name: 'Campus ave 1' },
    { id: 'ave_2', lng: -6.376743, lat: 53.406060, type: 'junction', name: 'Campus ave 2' },
    { id: 'ave_3', lng: -6.377333, lat: 53.406073, type: 'junction', name: 'Campus ave 3' },
    { id: 'ave_4', lng: -6.377838, lat: 53.406043, type: 'junction', name: 'Campus ave 4' },
    { id: 'ave_5', lng: -6.378081, lat: 53.406014, type: 'junction', name: 'Campus ave 5' },
    { id: 'ave_6', lng: -6.378286, lat: 53.405960, type: 'junction', name: 'Campus ave 6' },
    { id: 'ave_7', lng: -6.378434, lat: 53.405914, type: 'junction', name: 'Campus ave — south turn' },
    { id: 'ave_s1', lng: -6.377900, lat: 53.405870, type: 'junction', name: 'Campus ave south 1 — jog east of BC' },
    { id: 'ave_s2', lng: -6.377700, lat: 53.405700, type: 'junction', name: 'Campus ave south 2 — east of BC' },
    { id: 'ave_s3', lng: -6.377700, lat: 53.405450, type: 'junction', name: 'Campus ave south 3 — clear BC south' },
    { id: 'ave_s4', lng: -6.377900, lat: 53.405200, type: 'junction', name: 'Campus ave south 4' },
    { id: 'ave_s5', lng: -6.378300, lat: 53.405000, type: 'junction', name: 'Campus ave south 5' },
    { id: 'ave_s6', lng: -6.378700, lat: 53.404800, type: 'junction', name: 'Campus ave south 6' },
];

export const GRAPH_EDGE_PATCHES = [
    { from: 'a_block_entrance', to: 'ave_1' },
    { from: 'ave_1', to: 'ave_2' },
    { from: 'ave_2', to: 'ave_3' },
    { from: 'ave_3', to: 'ave_4' },
    { from: 'ave_4', to: 'ave_5' },
    { from: 'ave_5', to: 'ave_6' },
    { from: 'ave_6', to: 'ave_7' },
    { from: 'ave_7',  to: 'ave_s1' },
    { from: 'ave_s1', to: 'ave_s2' },
    { from: 'ave_s2', to: 'ave_s3' },
    { from: 'ave_s3', to: 'ave_s4' },
    { from: 'ave_s4', to: 'ave_s5' },
    { from: 'ave_s5', to: 'ave_s6' },
    { from: 'ave_s6', to: 'main_1' },
];

// Overrides for wrong locationNodeMap entries in S3
export const LOCATION_NODE_OVERRIDES = {
    'a-block': 'a_block_entrance',
};
