(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/data/locations.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const locations = [
    // ============================
    // DEFAULT CAMPUS BUILDINGS
    // ============================
    {
        id: 'FBL',
        name: 'F Block',
        type: 'default',
        lat: 53.40480238768301,
        lng: -6.3784076864373285,
        description: 'Lecture halls, classrooms, library, security, toilets.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'AGBL',
        name: 'AG Block',
        type: 'default',
        lat: 53.404594589197124,
        lng: -6.379052136996935,
        description: 'Lecture halls, classrooms, staff offices, seating areas, toilets.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'CBL',
        name: 'C Block',
        type: 'default',
        lat: 53.40542061347614,
        lng: -6.378464745165641,
        description: 'Students union, cafeteria, corner shop, sports hall, nurse office, toilets, vending machines.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'DBL',
        name: 'D Block',
        type: 'default',
        lat: 53.40570209989625,
        lng: -6.377434359156279,
        description: 'Lecture halls, classrooms, toilets.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'EBL',
        name: 'E Block',
        type: 'default',
        lat: 53.40525198587551,
        lng: -6.377688633581321,
        description: 'Lecture halls, classrooms, toilets.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'ABL',
        name: 'A Block',
        type: 'default',
        lat: 53.406219601693536,
        lng: -6.376382479130481,
        description: 'Lecture halls, classrooms, seating areas, toilets.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'SBL',
        name: 'S Block',
        type: 'default',
        lat: 53.40590023329914,
        lng: -6.38130601458319,
        description: 'Classrooms, gymnasium, changing rooms, toilets.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'LINC',
        name: 'The LINC',
        type: 'default',
        lat: 53.40635885455073,
        lng: -6.37980931996236,
        description: 'Cafe (food and drinks), seating area, staff offices.',
        accessibility: 'Elevator available.'
    },
    {
        id: 'CONNECT',
        name: 'Connect Building',
        type: 'default',
        lat: 53.40478816126874,
        lng: -6.37926118610782,
        description: 'Student support building.',
        accessibility: 'Wheelchair accessible.'
    },
    {
        id: 'CAR',
        name: 'Car Park',
        type: 'default',
        lat: 53.404730729024294,
        lng: -6.3805928426448215,
        description: 'Parking area.',
        accessibility: 'Disabled parking available.'
    },
    // ============================
    // SPORTS TRAIL STOPS
    // ============================
    {
        id: 'sports-s1',
        name: 'C Block – Starting Line',
        type: 'trail',
        trail: 'Sports Trail',
        order: 1,
        lat: 53.40558115741799,
        lng: -6.3783082575413355
    },
    {
        id: 'SBL',
        name: 'S Block - Gym',
        type: 'trail',
        trail: 'Sports Trail',
        order: 2,
        lat: 53.405811275760044,
        lng: -6.381368245932702,
        description: 'Classrooms, gymnasium, changing rooms, toilets.',
        accessibility: 'Elevator available. '
    },
    {
        id: 'sports-s3',
        name: 'Sports Field',
        type: 'trail',
        trail: 'Sports Trail',
        order: 3,
        lat: 53.40637444210749,
        lng: -6.382525651681246,
        description: 'Football pitches.'
    },
    {
        id: 'sports-s4',
        name: 'The LINC',
        type: 'trail',
        trail: 'Sports Trail',
        order: 4,
        lat: 53.40640498223236,
        lng: -6.3798825101578585,
        description: 'Cafe (food and drinks), seating area, staff offices.',
        accessibility: 'Elevator available.'
    },
    // ============================
    // TECH TRAIL STOPS
    // ============================
    {
        id: 'tech-t1',
        name: 'AG Block – Tech Start',
        type: 'trail',
        trail: 'Technology Trail',
        order: 1,
        lat: 53.404609889004455,
        lng: -6.379100157185581,
        description: 'Starting point for the Technology Trail (AG Building).',
        accessibility: 'Wheelchair accessible entrance.'
    },
    {
        id: 'tech-t2',
        name: 'E Block – Tech Stop',
        type: 'trail',
        trail: 'Technology Trail',
        order: 2,
        lat: 53.40529084274418,
        lng: -6.377768391376469,
        description: 'Midpoint of the Technology Trail (E Building).',
        accessibility: 'Elevator available.'
    },
    {
        id: 'tech-t3',
        name: 'D Block – Tech Finish',
        type: 'trail',
        trail: 'Technology Trail',
        order: 3,
        lat: 53.40569081959447,
        lng: -6.377475952861498,
        description: 'Final destination of the Technology Trail (D Building).',
        accessibility: 'Elevator available.'
    }
];
const __TURBOPACK__default__export__ = locations;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/data/trailPaths.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const trailPaths = {
    // ============================
    // SPORTS TRAIL
    // ============================
    'Sports Trail': [
        // S1 → C Block path
        {
            lat: 53.40558115741799,
            lng: -6.3783082575413355
        },
        {
            lat: 53.40572,
            lng: -6.37895
        },
        {
            lat: 53.40584,
            lng: -6.37960
        },
        // Towards Gym
        {
            lat: 53.405811275760044,
            lng: -6.381368245932702
        },
        // Gym → Field
        {
            lat: 53.40605,
            lng: -6.38195
        },
        {
            lat: 53.40620,
            lng: -6.38225
        },
        {
            lat: 53.40637444210749,
            lng: -6.382525651681246
        },
        // Field → Café
        {
            lat: 53.40640,
            lng: -6.38160
        },
        {
            lat: 53.40640,
            lng: -6.38060
        },
        {
            lat: 53.40640498223236,
            lng: -6.3798825101578585
        }
    ],
    // ============================
    // TECH TRAIL
    // ============================
    'Technology Trail': [
        // T1 → AG Building (Start)
        {
            lat: 53.404609889004455,
            lng: -6.379100157185581
        },
        // AG → E Building
        {
            lat: 53.40490,
            lng: -6.37870
        },
        {
            lat: 53.40515,
            lng: -6.37820
        },
        {
            lat: 53.40529084274418,
            lng: -6.377768391376469
        },
        // E → D Building (Finish)
        {
            lat: 53.40545,
            lng: -6.37760
        },
        {
            lat: 53.40569081959447,
            lng: -6.377475952861498
        }
    ]
};
const __TURBOPACK__default__export__ = trailPaths;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/MapView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$locations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/data/locations.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$trailPaths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/data/trailPaths.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function MapView({ selectedTrail }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const polylineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const infoWindowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const SPORTS_COLOR = '#b61352'; // Royal Red
    const TECH_COLOR = '#4169E1'; // Royal Blue
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapView.useEffect": ()=>{
            if (!window.google || !window.google.maps) return;
            // Create map once
            if (!mapInstanceRef.current) {
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    center: {
                        lat: 53.405292,
                        lng: -6.378240
                    },
                    zoom: 18,
                    mapTypeId: 'hybrid',
                    mapTypeControl: false,
                    fullscreenControl: false
                });
                infoWindowRef.current = new window.google.maps.InfoWindow();
            }
            const map = mapInstanceRef.current;
            // Clear markers
            markersRef.current.forEach({
                "MapView.useEffect": (m)=>m.setMap(null)
            }["MapView.useEffect"]);
            markersRef.current = [];
            // Clear polyline
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
            // ============================
            // DEFAULT MODE
            // ============================
            if (!selectedTrail) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$locations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].filter({
                    "MapView.useEffect": (l)=>l.type === 'default'
                }["MapView.useEffect"]).forEach({
                    "MapView.useEffect": (loc)=>{
                        const marker = new window.google.maps.Marker({
                            position: {
                                lat: loc.lat,
                                lng: loc.lng
                            },
                            map,
                            title: loc.name
                        });
                        marker.addListener('click', {
                            "MapView.useEffect": ()=>{
                                infoWindowRef.current.setContent(`
              <div style="max-width:220px">
                <strong>${loc.name}</strong><br/>
                ${loc.description ?? ''}<br/>
                <em>${loc.accessibility ?? ''}</em>
              </div>
            `);
                                infoWindowRef.current.open(map, marker);
                            }
                        }["MapView.useEffect"]);
                        markersRef.current.push(marker);
                    }
                }["MapView.useEffect"]);
                return;
            }
            // ============================
            // TRAIL MODE
            // ============================
            const trailStops = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$locations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].filter({
                "MapView.useEffect.trailStops": (l)=>l.type === 'trail' && l.trail === selectedTrail
            }["MapView.useEffect.trailStops"]).sort({
                "MapView.useEffect.trailStops": (a, b)=>a.order - b.order
            }["MapView.useEffect.trailStops"]);
            const isTechTrail = selectedTrail === 'Technology Trail';
            trailStops.forEach({
                "MapView.useEffect": (stop)=>{
                    const marker = new window.google.maps.Marker({
                        position: {
                            lat: stop.lat,
                            lng: stop.lng
                        },
                        map,
                        label: {
                            text: `${isTechTrail ? 'T' : 'S'}${stop.order}`,
                            color: 'white',
                            fontWeight: 'bold'
                        },
                        title: stop.name
                    });
                    marker.addListener('click', {
                        "MapView.useEffect": ()=>{
                            infoWindowRef.current.setContent(`
          <div style="max-width:220px">
            <strong>${stop.name}</strong><br/>
            ${stop.description ?? ''}<br/>
            <em>${stop.accessibility ?? ''}</em>
          </div>
        `);
                            infoWindowRef.current.open(map, marker);
                        }
                    }["MapView.useEffect"]);
                    markersRef.current.push(marker);
                }
            }["MapView.useEffect"]);
            // Draw trail polyline
            const path = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$trailPaths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"][selectedTrail];
            if (!path || path.length === 0) return;
            polylineRef.current = new window.google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: isTechTrail ? TECH_COLOR : SPORTS_COLOR,
                strokeOpacity: 0.95,
                strokeWeight: 5
            });
            polylineRef.current.setMap(map);
            map.panTo(path[0]);
        }
    }["MapView.useEffect"], [
        selectedTrail
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        ref: mapRef,
        sx: {
            width: '100%',
            height: '100%'
        }
    }, void 0, false, {
        fileName: "[project]/src/app/components/MapView.jsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
_s(MapView, "1q42JHLbG/Q8bHT0uo8Dzne71Tk=");
_c = MapView;
var _c;
__turbopack_context__.k.register(_c, "MapView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/MapCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Chip/Chip.js [app-client] (ecmascript) <export default as Chip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Divider/Divider.js [app-client] (ecmascript) <export default as Divider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MapView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/MapView.jsx [app-client] (ecmascript)");
'use client';
;
;
;
const trails = [
    'Technology Trail',
    'History Trail',
    'Sports Trail',
    'Library & Literature Trail'
];
function MapCard({ selectedTrail, setSelectedTrail, onSelectLocation }) {
    const toggleTrail = (trail)=>{
        setSelectedTrail((prev)=>prev === trail ? null : trail);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 4
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    px: 3,
                    py: 2,
                    background: 'linear-gradient(90deg, #4F46E5, #9333EA)',
                    color: 'white'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "h6",
                        fontWeight: "bold",
                        children: "TU Dublin Blanchardstown Campus"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/MapCard.jsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                        direction: "row",
                        spacing: 1,
                        sx: {
                            mt: 1
                        },
                        flexWrap: "wrap",
                        children: trails.map((trail)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                                label: trail,
                                clickable: true,
                                onClick: ()=>toggleTrail(trail),
                                size: "small",
                                sx: {
                                    bgcolor: selectedTrail === trail ? 'white' : 'rgba(255,255,255,0.85)',
                                    color: '#4F46E5',
                                    fontWeight: selectedTrail === trail ? 700 : 500
                                }
                            }, trail, false, {
                                fileName: "[project]/src/app/components/MapCard.jsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/MapCard.jsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/MapCard.jsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    height: {
                        xs: 350,
                        md: 500
                    }
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MapView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    selectedTrail: selectedTrail,
                    onSelectLocation: onSelectLocation
                }, void 0, false, {
                    fileName: "[project]/src/app/components/MapCard.jsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/MapCard.jsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {}, void 0, false, {
                fileName: "[project]/src/app/components/MapCard.jsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    px: 3,
                    py: 2
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "subtitle2",
                        fontWeight: "bold",
                        gutterBottom: true,
                        children: "Map Legend"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/MapCard.jsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                        direction: "row",
                        spacing: 1,
                        alignItems: "center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: '#EF4444'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/MapCard.jsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "caption",
                                children: "Trail Stops"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/MapCard.jsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/MapCard.jsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/MapCard.jsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/MapCard.jsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = MapCard;
var _c;
__turbopack_context__.k.register(_c, "MapCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Container/Container.js [app-client] (ecmascript) <export default as Container>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$AppBar$2f$AppBar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AppBar$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/AppBar/AppBar.js [app-client] (ecmascript) <export default as AppBar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Toolbar$2f$Toolbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toolbar$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Toolbar/Toolbar.js [app-client] (ecmascript) <export default as Toolbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MapCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/MapCard.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function Home() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedTrail, setSelectedTrail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            setMounted(true);
        }
    }["Home.useEffect"], []);
    const handleHomeClick = ()=>{
        setSelectedTrail(null);
        router.push('/');
    };
    if (!mounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        sx: {
            minHeight: '100vh',
            bgcolor: 'white'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$AppBar$2f$AppBar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AppBar$3e$__["AppBar"], {
                position: "sticky",
                elevation: 0,
                sx: {
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(10px)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Toolbar$2f$Toolbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toolbar$3e$__["Toolbar"], {
                    sx: {
                        display: 'flex',
                        justifyContent: 'space-between'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            fontWeight: "bold",
                            children: "Campus Quest"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 44,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                            sx: {
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: handleHomeClick,
                                    color: "inherit",
                                    sx: {
                                        textTransform: 'none',
                                        fontWeight: 600
                                    },
                                    children: "Home"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.js",
                                    lineNumber: 47,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    component: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
                                    href: "/trails",
                                    color: "inherit",
                                    sx: {
                                        textTransform: 'none',
                                        fontWeight: 600
                                    },
                                    children: "Trails"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.js",
                                    lineNumber: 55,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    component: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
                                    href: "/scan",
                                    variant: "contained",
                                    size: "small",
                                    sx: {
                                        textTransform: 'none',
                                        fontWeight: 700
                                    },
                                    children: "Scan"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.js",
                                    lineNumber: 64,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 46,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.js",
                    lineNumber: 43,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__["Container"], {
                maxWidth: "lg",
                sx: {
                    py: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "h4",
                        fontWeight: "bold",
                        textAlign: "center",
                        gutterBottom: true,
                        sx: {
                            color: '#111827'
                        },
                        children: "Interactive Campus Map"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.js",
                        lineNumber: 79,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "subtitle1",
                        textAlign: "center",
                        sx: {
                            color: 'rgba(17,24,39,0.75)'
                        },
                        gutterBottom: true,
                        children: "Explore TU Dublin Blanchardstown using themed trails"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.js",
                        lineNumber: 89,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            mt: 3
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MapCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            selectedTrail: selectedTrail,
                            setSelectedTrail: setSelectedTrail
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 99,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.js",
                        lineNumber: 98,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 78,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.js",
        lineNumber: 33,
        columnNumber: 9
    }, this);
}
_s(Home, "wDxc01m/YZCibVLGV9Du09FDABY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_04370454._.js.map