(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/data/locations.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const locations = [
    {
        id: 'LIB01',
        name: 'Test library Location',
        lat: 53.40473,
        lng: -6.37839,
        description: 'Primary study and research space.',
        accessibility: 'Step-free access, lifts available.'
    },
    {
        id: 'CAF01',
        name: 'C Block',
        lat: 53.40542,
        lng: -6.37875,
        description: 'Main food and social area.',
        accessibility: 'Wide entrances, accessible seating.'
    }
];
const __TURBOPACK__default__export__ = locations;
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
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function MapView({ onSelectLocation }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapView.useEffect": ()=>{
            if (!window.google || !window.google.maps) return;
            const map = new window.google.maps.Map(mapRef.current, {
                center: {
                    lat: 53.405292,
                    lng: -6.378240
                },
                zoom: 16,
                mapTypeControl: false,
                fullscreenControl: false
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$locations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach({
                "MapView.useEffect": (location)=>{
                    const marker = new window.google.maps.Marker({
                        position: {
                            lat: location.lat,
                            lng: location.lng
                        },
                        map,
                        title: location.name
                    });
                    marker.addListener('click', {
                        "MapView.useEffect": ()=>{
                            onSelectLocation(location);
                        }
                    }["MapView.useEffect"]);
                }
            }["MapView.useEffect"]);
        }
    }["MapView.useEffect"], [
        onSelectLocation
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        ref: mapRef,
        sx: {
            height: '100%',
            width: '100%'
        }
    }, void 0, false, {
        fileName: "[project]/src/app/components/MapView.jsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_s(MapView, "9mn7MMe4fPaZ50ApsOpRWF2HbFg=");
_c = MapView;
var _c;
__turbopack_context__.k.register(_c, "MapView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/MapView.jsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/components/MapView.jsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_app_3d04431a._.js.map