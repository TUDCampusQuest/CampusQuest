'use client';
import { Source, Layer } from 'react-map-gl';

/**
 * MapLayers
 * All Mapbox GL Sources and Layers in one place.
 * Must be rendered inside a <Map> component after styleLoaded = true.
 */
export default function MapLayers({ trailGeoJSON, capturedGeoJSON, routeGeoJSON }) {
    return (
        <>
            {/* Selected trail */}
            <Source id="selected-trail-source" type="geojson" data={trailGeoJSON}>
                <Layer id="trail-line" type="line" slot="middle"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{ 'line-color': '#1BA39C', 'line-width': 6 }} />
            </Source>

            {/* Trail capture preview */}
            <Source id="capture-source" type="geojson" data={capturedGeoJSON}>
                <Layer id="capture-line" type="line"
                    paint={{ 'line-color': '#FF7A00', 'line-width': 3, 'line-dasharray': [2, 1] }} />
                <Layer id="capture-pts" type="circle"
                    paint={{ 'circle-radius': 5, 'circle-color': '#FF7A00', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }} />
            </Source>

            {/* Walking route — white casing + teal fill */}
            {routeGeoJSON && (
                <Source id="route-source" type="geojson" data={routeGeoJSON}>
                    <Layer id="route-casing" type="line" slot="middle"
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        paint={{ 'line-color': '#ffffff', 'line-width': 10 }} />
                    <Layer id="route-fill" type="line" slot="middle"
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        paint={{ 'line-color': '#1BA39C', 'line-width': 5 }} />
                </Source>
            )}
        </>
    );
}