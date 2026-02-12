'use client';
import { useState, useEffect, Suspense } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useSearchParams } from 'next/navigation';

const containerStyle = { width: '100vw', height: '100vh' };
const campusCenter = { lat: 53.405292, lng: -6.378240 };

function MapContent() {
    const searchParams = useSearchParams();
    const [directions, setDirections] = useState(null);
    const [locations, setLocations] = useState([]);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        fetch('/api/locations')
            .then(res => res.json())
            .then(data => {
                const locArray = Array.isArray(data) ? data : (data?.locations || []);
                setLocations(locArray);
            })
            .catch(err => console.error("Error fetching markers from S3:", err));
    }, []);

    useEffect(() => {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (isLoaded && lat && lng && window.google) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: campusCenter,
                    destination: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    travelMode: google.maps.TravelMode.WALKING,
                },
                (result, status) => {
                    if (status === 'OK') setDirections(result);
                }
            );
        }
    }, [isLoaded, searchParams]);

    if (!isLoaded) return <div style={{ height: '100vh', background: '#e5e7eb' }} />;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={campusCenter}
            zoom={18}
            options={{ disableDefaultUI: true, mapTypeId: 'hybrid', tilt: 45 }}
        >
            {locations.map((loc) => (
                <Marker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    label={{ text: loc.id, color: "white", fontSize: "10px", fontWeight: "bold" }}
                />
            ))}

            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{ polylineOptions: { strokeColor: '#1BA39C', strokeWeight: 6 } }}
                />
            )}
        </GoogleMap>
    );
}

export default function MapView() {
    return (
        <Suspense fallback={<div style={{ height: '100vh', background: '#f0f0f0' }} />}>
            <MapContent />
        </Suspense>
    );
}