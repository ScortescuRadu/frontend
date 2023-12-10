import {useEffect, useState, useRef} from 'react'
import {APIProvider, Map, AdvancedMarker, useMap}
    from "@vis.gl/react-google-maps"
import trees from '../data/trees.ts'
import {Marker} from '@googlemaps/markerclusterer'
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const MapPage = () => {
    const position = {lat: 43.64, lng: -79.41}
    const [open, setOpen] = useState(false)

    return <APIProvider apiKey=''>
        <div style={{height: '100vh', width: '100%'}}>
            <Map zoom={10} center={position} mapId=''>
                < Markers points={trees}/>
            </Map>
        </div>
    </APIProvider>
}

export default MapPage;

const Markers = ({points}) => {
    console.log("Points:", points);
    const map = useMap()
    const [markers, setMarkers] = useState({});
    const clusterer = useRef(null);
    
    useEffect(()=>{
        if(!map) return
        if (!clusterer.current){
            clusterer.current = new MarkerClusterer({map})
        }
    }, [map])

    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);
    
    const setMarkerRef = (marker, key) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;
        setMarkers((prev) => {
            if (marker) {
                return { ...prev, [key]: marker };
            } else {
                const newMarkers = { ...prev };
                delete newMarkers[key];
                return newMarkers;
            }
        });
    };

    return (
        <>
          {points.map((point) => (
            <AdvancedMarker
              position={point}
              key={point.key}
              ref={(marker) => setMarkerRef(marker, point.key)}
            >
              <span style={{ fontSize: "2rem" }}>🌳</span>
            </AdvancedMarker>
          ))}
        </>
      );
}

/*
<AdvancedMarker position={position} onClick={() => setOpen(true)}>
                    <Pin background={'grey'}
                        borderColor={'green'}
                        glyphColor={'purple'}
                    />
                </AdvancedMarker>
                {open && (<InfoWindow position={position}
                    onCloseClick={ () => setOpen(false) }>
                    <p>I'm in Hamburg</p>
                </InfoWindow>)}
*/