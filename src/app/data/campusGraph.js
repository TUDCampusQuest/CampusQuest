export const campusNodes = [
    // =========================================================
    // Main spine path (bottom-left toward E / upper side)
    // =========================================================
    { id: 'main_1', lng: -6.378896885267977,  lat: 53.40474263203063,  type: 'junction', name: 'Main path start' },
    { id: 'main_2', lng: -6.378543796128611,  lat: 53.40491729944813,  type: 'junction' },
    { id: 'main_3', lng: -6.378397301698044,  lat: 53.405002393571635, type: 'junction' },
    { id: 'main_4', lng: -6.378138119244454,  lat: 53.405130034437065, type: 'junction' },
    { id: 'main_5', lng: -6.377942793337837,  lat: 53.40526663213225,  type: 'junction' },
    { id: 'main_6', lng: -6.377860155454243,  lat: 53.405318136067564, type: 'junction' },
    { id: 'main_7', lng: -6.3777887863729745, lat: 53.405394272204944, type: 'junction' },
    { id: 'main_8', lng: -6.377683610884191,  lat: 53.40548832254001,  type: 'junction', name: 'Main path upper end' },

    // =========================================================
    // Library-side short branch
    // =========================================================
    { id: 'lib_branch_1', lng: -6.378577602535273, lat: 53.40525767491957, type: 'junction' },
    { id: 'lib_branch_2', lng: -6.378566333733033, lat: 53.40513451305708, type: 'junction' },
    { id: 'lib_branch_3', lng: -6.378517502256216, lat: 53.40501359015417, type: 'junction', name: 'Library branch end' },

    // =========================================================
    // Central shortcut walkway (New Building side -> C Block side)
    // =========================================================
    { id: 'shortcut_1', lng: -6.378534939198715, lat: 53.40501275829705,  type: 'junction' },
    { id: 'shortcut_2', lng: -6.378569002896683, lat: 53.405150847246745, type: 'junction' },
    { id: 'shortcut_3', lng: -6.378570706082513, lat: 53.405254413665034, type: 'junction' },
    { id: 'shortcut_4', lng: -6.37855367423353,  lat: 53.40531330426097,  type: 'junction', name: 'Central shortcut top' },

    // =========================================================
    // Upper horizontal branch near C Block
    // =========================================================
    { id: 'c_branch_1', lng: -6.378325932616747, lat: 53.40536740064272, type: 'junction' },
    { id: 'c_branch_2', lng: -6.378149388047433, lat: 53.4053629220472,  type: 'junction' },
    { id: 'c_branch_3', lng: -6.377995381081803, lat: 53.40535396485524, type: 'junction', name: 'C Block upper path' },

    // =========================================================
    // Entrance helper nodes
    // =========================================================
    { id: 'student_services_entrance', lng: -6.3792807238551745, lat: 53.40475417408774,  type: 'entrance', name: 'Student Services entrance' },
    { id: 'library_entrance',          lng: -6.378403589982383,  lat: 53.404801268471346, type: 'entrance', name: 'Library entrance area' },
    { id: 'e_block_entrance',          lng: -6.377683948664298,  lat: 53.40525263064504,  type: 'entrance', name: 'E Block entrance' },
    { id: 'd_block_approach',          lng: -6.3774415693826825, lat: 53.405683133264404, type: 'entrance', name: 'D Block approach' },
    { id: 'c_block_entrance',          lng: -6.378453555859494,  lat: 53.40540159379279,  type: 'entrance', name: 'C Block entrance side' },
    { id: 'new_building_entrance',     lng: -6.379004128087217,  lat: 53.404520526594354, type: 'entrance', name: 'New Building entrance' },
];

export const campusEdges = [
    // =========================================================
    // Main spine
    // =========================================================
    { from: 'main_1', to: 'main_2' },
    { from: 'main_2', to: 'main_3' },
    { from: 'main_3', to: 'main_4' },
    { from: 'main_4', to: 'main_5' },
    { from: 'main_5', to: 'main_6' },
    { from: 'main_6', to: 'main_7' },
    { from: 'main_7', to: 'main_8' },

    // =========================================================
    // Library branch
    // Connect branch to the main path at one point only
    // =========================================================
    { from: 'main_3',      to: 'lib_branch_3' },
    { from: 'lib_branch_3', to: 'lib_branch_2' },
    { from: 'lib_branch_2', to: 'lib_branch_1' },

    // =========================================================
    // C Block upper branch
    // Connect branch to the main path at one point only
    // =========================================================
    { from: 'main_6',    to: 'c_branch_3' },
    { from: 'c_branch_3', to: 'c_branch_2' },
    { from: 'c_branch_2', to: 'c_branch_1' },

    // =========================================================
    // Central shortcut walkway
    // =========================================================
    { from: 'main_2',     to: 'shortcut_1' },
    { from: 'shortcut_1', to: 'shortcut_2' },
    { from: 'shortcut_2', to: 'shortcut_3' },
    { from: 'shortcut_3', to: 'shortcut_4' },
    { from: 'shortcut_4', to: 'c_block_entrance' },

    // =========================================================
    // Entrance links
    // =========================================================
    { from: 'main_1',      to: 'student_services_entrance' },
    { from: 'main_2',      to: 'library_entrance' },
    { from: 'main_6',      to: 'e_block_entrance' },
    { from: 'main_8',      to: 'd_block_approach' },
    { from: 'c_branch_1',  to: 'c_block_entrance' },
    { from: 'main_1',      to: 'new_building_entrance' },
];

export const locationNodeMap = {
    'student-services': 'student_services_entrance',
    'library': 'library_entrance',
    'e-block': 'e_block_entrance',
    'd-block': 'd_block_approach',
    'c-block': 'c_block_entrance',

    // temporary mappings so routing works
    'a-block': 'student_services_entrance',
    'ag-block': 'new_building_entrance',
    'f-block': 'library_entrance',
    'connect': 'student_services_entrance',
    'connect-building': 'student_services_entrance',
    'new-building': 'new_building_entrance',
};