'use client';
// Renders Mapbox GL sources and layers for trails, capture previews, walking routes, and active trail overlays.

import { Source, Layer } from 'react-map-gl';

export default function MapLayers({ trailGeoJSON, capturedGeoJSON, routeGeoJSON, activeTrailGeoJSON }) {
    return (
        <>
            <Source id="selected-trail-source" type="geojson" data={trailGeoJSON}>
                <Layer id="trail-line" type="line" slot="middle"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{ 'line-color': '#1BA39C', 'line-width': 6 }} />
            </Source>

            <Source id="capture-source" type="geojson" data={capturedGeoJSON}>
                <Layer id="capture-line" type="line"
                    paint={{ 'line-color': '#FF7A00', 'line-width': 3, 'line-dasharray': [2, 1] }} />
                <Layer id="capture-pts" type="circle"
                    paint={{ 'circle-radius': 5, 'circle-color': '#FF7A00', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }} />
            </Source>

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

            {activeTrailGeoJSON && (
                <Source id="active-trail-source" type="geojson" data={activeTrailGeoJSON}>
                    <Layer id="active-trail-line" type="line" slot="middle"
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        paint={{ 'line-color': '#7C3AED', 'line-width': 4, 'line-dasharray': [2, 2] }} />
                </Source>
            )}
        </>
    );
}