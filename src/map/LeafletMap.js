import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, FeatureGroup } from 'react-leaflet';
import { Typography } from '@mui/material';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix marker icons issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const greenSquareIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iI0E5RkE5RiIvPgo8L3N2Zz4=',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const LeafletMap = () => {
  const [markers, setMarkers] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState([]);
  const [polylineData, setPolylineData] = useState([]);
  const featureGroupRef = useRef(null); // Create a ref for FeatureGroup

  useEffect(() => {
    // Fetch markers from the server
    axios.get('http://127.0.0.1:8001/marker/markers/')
      .then(response => {
        setMarkers(response.data);
      })
      .catch(error => {
        console.error('Error fetching markers:', error);
      });

    // Fetch GeoJSON data for highlighting areas
    axios.get('http://127.0.0.1:8001/area/geojson/')
      .then(response => {
        console.log('Fetched GeoJSON Data:', response.data);
        setGeoJsonData(response.data.map(item => item.geojson));
      })
      .catch(error => {
        console.error('Error fetching GeoJSON data:', error);
      });

    // Fetch GeoJSON data for polylines
    axios.get('http://127.0.0.1:8001/polylines/')
      .then(response => {
        console.log('Fetched Polylines:', response.data);
        setPolylineData(response.data.map(item => item.geojson));
      })
      .catch(error => {
        console.error('Error fetching polyline data:', error);
      });
  }, []);

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    const drawnFeature = layer.toGeoJSON();
    console.log('Drawn Feature:', drawnFeature);
    let url = '';

    if (layerType === 'marker') {
      url = 'http://127.0.0.1:8001/marker/markers/';
      const markerData = {
        name: 'New Marker', // Customize as needed
        lat: drawnFeature.geometry.coordinates[1],
        lng: drawnFeature.geometry.coordinates[0]
      };
      console.log('Marker Data:', markerData);
      axios.post(url, markerData)
        .then(response => {
          setMarkers(prevMarkers => [...prevMarkers, response.data]);
        })
        .catch(error => {
          console.error('Error saving marker:', error);
        });
    } else {
      url = layerType === 'polyline' ? 'http://127.0.0.1:8001/polylines/' : 'http://127.0.0.1:8001/area/geojson/';
      const geoJsonData = {
        geojson: drawnFeature,
        description: 'New Area'
      };
      console.log('GeoJSON Data:', geoJsonData);
      axios.post(url, geoJsonData)
        .then(response => {
          console.log('GeoJSON saved:', response.data);
          if (layerType === 'polyline') {
            setPolylineData(prevData => [...prevData, response.data.geojson]);
          } else {
            setGeoJsonData(prevData => [...prevData, response.data.geojson]);
          }
        })
        .catch(error => {
          console.error('Error saving GeoJSON:', error);
        });
      }
  };

  const handleDeleted = (e) => {
    const layers = e.layers;
    layers.eachLayer(layer => {
      if (!layer.feature) {
        console.error('Layer feature not defined', layer);
        return;
      }
      const layerType = layer.feature.geometry.type.toLowerCase();
      const id = layer.feature.id;
      let url = '';

      console.log('Deleting Layer:', layerType, id);

      if (layerType === 'point') {
        url = `http://127.0.0.1:8001/marker/markers/${id}/`;
        axios.delete(url)
          .then(() => {
            setMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== id));
            console.log('Marker deleted:', id);
          })
          .catch(error => {
            console.error('Error deleting marker:', error);
          });
      } else if (layerType === 'linestring') {
        url = `http://127.0.0.1:8001/polylines/${id}/`;
        axios.delete(url)
          .then(() => {
            setPolylineData(prevData => prevData.filter(polyline => polyline.id !== id));
            console.log('Polyline deleted:', id);
          })
          .catch(error => {
            console.error('Error deleting polyline:', error);
          });
      } else if (layerType === 'polygon') {
        url = `http://127.0.0.1:8001/area/geojson/${id}/`;
        axios.delete(url)
          .then(() => {
            setGeoJsonData(prevData => prevData.filter(geoJson => geoJson.id !== id));
            console.log('GeoJSON deleted:', id);
          })
          .catch(error => {
            console.error('Error deleting GeoJSON:', error);
          });
      }
    });
  };

  return (
    <div>
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          marginTop: '20px',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Typography variant='h3' color='white'>
          Planning the Future
        </Typography>
        <Typography variant='h6' gutterBottom color='white'>
          With a large community of active users, our dataset is public and covers a wide range of scenarios!
        </Typography>
      </div>
      <div
        style={{
          border: '2px solid #ccc',
          borderRadius: '15px',
          padding: '20px',
          width: '100%',
          height: '60vh',
          backgroundColor: '#f9f9f9',
          margin: '40px auto',
          zIndex: 0,
        }}
      >
        <MapContainer center={[45.7496406, 21.2213135]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicmFkdXNjbyIsImEiOiJjbHM0eDJibWoxZmxlMm1ta3kyNWR6bzYzIn0.xR7ZTbKmBsFmIWzSZcEcQQ`}
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
          />
          <MarkerClusterGroup>
          {markers.map((marker, index) => (
            <Marker key={index} position={[marker.lat, marker.lng]} icon={greenSquareIcon}>
              <Popup>
                {marker.name}
              </Popup>
            </Marker>
          ))}
          </MarkerClusterGroup>
          {geoJsonData.length > 0 && (
            <GeoJSON data={geoJsonData} style={() => ({
              color: '#0000ff',
              weight: 2,
              fillColor: '#0000ff',
              fillOpacity: 0.5,
            })} />
          )}
          {polylineData.length > 0 && (
            <GeoJSON data={polylineData} style={() => ({
              color: '#0000ff',
              weight: 3,
              opacity: 0.7,
            })} />
          )}
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                circlemarker: false,
                marker: true,
                polyline: true,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default LeafletMap;
