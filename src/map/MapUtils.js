export function findClosestMarker(destinationCoords, markers) {
    console.log('Destination Coord', destinationCoords)
  
    if (!destinationCoords) {
      console.error('Error getting destination coordinates');
      return null;
    }
  
    let closestMarker = null;
    let minDistance = Number.MAX_VALUE;
  
    if (markers !== null) {
        markers.forEach((marker) => {
        const markerCoords = { lat: marker.latitude, lng: marker.longitude };
        const distance = calculateDistance(destinationCoords, markerCoords);
        console.log('Markers data:', distance); 
        if (distance < minDistance) {
            minDistance = distance;
            closestMarker = marker;
        }
        });
    } else {
        console.out('Missing markers when calculating closest Marker')
    }
  
    return closestMarker;
  }
  
  export async function getCoordsFromAddress(address) {
    // Use the Google Maps Geocoding API to get coordinates from the address
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
  
    try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          const location = data.results[0]?.geometry?.location;
          return location ? { lat: location.lat, lng: location.lng } : null;
      } catch (error) {
          console.error('Error fetching coordinates from address:', error);
          return null;
      }
  }
  
  export function calculateDistance(coords1, coords2) {
    // Haversine formula to calculate distance between two sets of coordinates
    const R = 6371; // Earth radius in kilometers
  
    const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
    const dLng = (coords2.lng - coords1.lng) * (Math.PI / 180);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * (Math.PI / 180)) * Math.cos(coords2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c; // Distance in kilometers
    console.log('Coord1:', coords1.lat, coords1.lng, 'Coords2', coords2)
    return distance;
  }
  