'use client';
import { useState, useEffect, Suspense } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useSearchParams } from 'next/navigation';

// FIX: Added curly braces to the import to match a named export
// If your file uses 'export default', remove the curly braces.
import { locations } from '../data/locations';

const containerStyle = { width: '100vw', height: '100vh' };
const campusCenter = { lat: 53.405292, lng: -6.378240 };

function MapContent() {
  const searchParams = useSearchParams();
  const [directions, setDirections] = useState(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

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
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error("Directions request failed due to " + status);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [isLoaded, searchParams]);

  if (!isLoaded) return <div style={{ height: '100vh', background: '#e5e7eb' }} />;

  // FIX: Safety check to ensure locations is an array before mapping
  const locationArray = Array.isArray(locations) ? locations : [];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={campusCenter}
      zoom={18}
      options={{
        disableDefaultUI: true,
        mapTypeId: 'hybrid',
        tilt: 45,
      }}
    >
      {locationArray.map((loc) => (
        <Marker 
          key={loc.id} 
          position={{ lat: loc.lat, lng: loc.lng }}
          label={{ 
            text: loc.id, 
            color: "white", 
            fontSize: "10px", 
            fontWeight: "bold",
            className: "marker-label" // Useful for custom styling
          }}
        />
      ))}

      {directions && (
        <DirectionsRenderer 
          directions={directions} 
          options={{
            polylineOptions: { 
              strokeColor: '#1BA39C', 
              strokeWeight: 6, 
              strokeOpacity: 0.8 
            }
          }}
        />
      )}
    </GoogleMap>
  );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function MapView() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: '#f3f4f6' }} />}>
      <MapContent />
    </Suspense>
  );
}