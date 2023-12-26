import { useState, useMemo, useCallback, useRef } from "react";
import {
    GoogleMap,
    Marker,
    DirectionRenderer,
    Circle,
    MarkerClusterer
} from 'react-google-maps'
import {APIProvider, Map, AdvancedMarker, useMap}
    from "@vis.gl/react-google-maps"
import './mapStyles.css'
import Places from './Places'
//import Distance from './distance'

// const LatLngLiteral = google.maps.LatLngLiteral
// const directionResult = google.maps.DirectionsResult
// const mapOptions = google.maps.MapOptions

const MapComponents = () => {
    const [office, setOffice] = useState()
    const mapRef = useRef()
    const center = useMemo(() => ({lat: 45.754364, lng: 21.226750}), []);
    const options = useMemo(() => ({
        // disableDefaultUI: true,
        clickableIcons: false
    }))
    const onLoad = useCallback(map => (mapRef.current = map), [])

    return (
    <div className="options-container mt-5">
        <div className="controls">
            <h1 style={{ color: '#fff', justifyContent: 'center' }}>Travel</h1>
            <Places
                style={{ color: '', justifyContent: 'center' }}
                setOffice={(position) => {
                    console.log(position)
                    setOffice(position)
                    mapRef.current?.panTo(position)
            }}/>
        </div>
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <div className="map" style={{flex: 1}}>
                <Map
                    zoom={14}
                    center={center}
                    mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
                    options={options}
                    onLoad={onLoad}>
                </Map>
            </div>
        </APIProvider>
    </div>
    )
}

const defaultOptions = {
    strokeOpacity: 0.5,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true
}
const closeOptions = {
    ...defaultOptions,
    zIndex: 3,
    fillOpacity: 0.05,
    strokeColor: "#8BC34A",
    fillColor: "#8BC34A",
}
const middleOptions = {
    ...defaultOptions,
    zIndex: 2,
    fillOpacity: 0.05,
    strokeColor: "#FBC02D",
    fillColor: "#FBC02D",
}
const farOptions = {
    ...defaultOptions,
    zIndex: 1,
    fillOpacity: 0.05,
    strokeColor: "#FF5252",
    fillColor: "#FF5252",
}

// const generateHouses = (position = LatLngLiteral) => {
//     const _houses = []
//     for (let i =0; i < 100; i++){
//         const direction = Math.random() < 0.5 ? -2 : 2
//         _houses.push({
//             lat: position.lat + Math.random() /direction,
//             lgn: position.lng + Math.random()
//         })
//     }
//     return _houses
// }

export default MapComponents;