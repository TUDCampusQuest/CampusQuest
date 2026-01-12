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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
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
const GOOGLE_MAPS_SRC = (key)=>`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
_c = GOOGLE_MAPS_SRC;
function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject)=>{
        // If already available (including importLibrary)
        if (window.google?.maps?.importLibrary) return resolve();
        const existing = document.querySelector('script[data-google-maps="true"]');
        if (existing) {
            // If script exists but maps not ready yet, wait a bit
            const start = Date.now();
            const tick = ()=>{
                if (window.google?.maps?.importLibrary) return resolve();
                if (Date.now() - start > 5000) return reject(new Error('Google Maps loaded but importLibrary is missing.'));
                requestAnimationFrame(tick);
            };
            tick();
            return;
        }
        const script = document.createElement('script');
        script.src = GOOGLE_MAPS_SRC(apiKey);
        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = 'true';
        script.onload = ()=>{
            const start = Date.now();
            const tick = ()=>{
                if (window.google?.maps?.importLibrary) return resolve();
                if (Date.now() - start > 5000) return reject(new Error('Google Maps loaded but importLibrary is missing.'));
                requestAnimationFrame(tick);
            };
            tick();
        };
        script.onerror = ()=>reject(new Error('Google Maps script failed to load'));
        document.head.appendChild(script);
    });
}
function MapView({ onSelectLocation }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapView.useEffect": ()=>{
            let cancelled = false;
            async function init() {
                const apiKey = ("TURBOPACK compile-time value", "AIzaSyAdqC4QNUiOMMUNfblNReYJ7-DnX_OIlNw");
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
                try {
                    await loadGoogleMapsScript(apiKey);
                    if (cancelled || !mapRef.current) return;
                    // Modern API: import libraries
                    const { Map } = await window.google.maps.importLibrary('maps');
                    const { Marker } = await window.google.maps.importLibrary('marker');
                    // Create map once
                    if (!mapInstanceRef.current) {
                        mapInstanceRef.current = new Map(mapRef.current, {
                            center: {
                                lat: 53.405292,
                                lng: -6.378240
                            },
                            zoom: 16,
                            mapTypeControl: false,
                            fullscreenControl: false
                        });
                    }
                    const map = mapInstanceRef.current;
                    // Clear old markers
                    markersRef.current.forEach({
                        "MapView.useEffect.init": (m)=>{
                            // AdvancedMarkerElement uses map = null
                            if ('map' in m) m.map = null;
                            // Classic marker uses setMap
                            if (typeof m.setMap === 'function') m.setMap(null);
                        }
                    }["MapView.useEffect.init"]);
                    markersRef.current = [];
                    // Add markers
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$data$2f$locations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach({
                        "MapView.useEffect.init": (location)=>{
                            // Marker here will be AdvancedMarkerElement in newer API
                            const marker = new Marker({
                                position: {
                                    lat: location.lat,
                                    lng: location.lng
                                },
                                map,
                                title: location.name
                            });
                            // AdvancedMarkerElement uses addListener? Some versions use event system.
                            // This works for classic markers; for AdvancedMarkerElement, use click listener if present.
                            if (typeof marker.addListener === 'function') {
                                marker.addListener('click', {
                                    "MapView.useEffect.init": ()=>onSelectLocation?.(location)
                                }["MapView.useEffect.init"]);
                            } else if (marker.element) {
                                marker.element.addEventListener('click', {
                                    "MapView.useEffect.init": ()=>onSelectLocation?.(location)
                                }["MapView.useEffect.init"]);
                            }
                            markersRef.current.push(marker);
                        }
                    }["MapView.useEffect.init"]);
                } catch (err) {
                    console.error(err);
                }
            }
            init();
            return ({
                "MapView.useEffect": ()=>{
                    cancelled = true;
                }
            })["MapView.useEffect"];
        }
    }["MapView.useEffect"], [
        onSelectLocation
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        ref: mapRef,
        sx: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%'
        }
    }, void 0, false, {
        fileName: "[project]/src/app/components/MapView.jsx",
        lineNumber: 131,
        columnNumber: 9
    }, this);
}
_s(MapView, "WFBshS63VcshgPzKbFUF9GsRSsQ=");
_c1 = MapView;
var _c, _c1;
__turbopack_context__.k.register(_c, "GOOGLE_MAPS_SRC");
__turbopack_context__.k.register(_c1, "MapView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/MapView.jsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/components/MapView.jsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_app_3d04431a._.js.map