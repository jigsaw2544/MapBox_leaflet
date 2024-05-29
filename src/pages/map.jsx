import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import { osm } from '../layouts/osm';
import './map.css'; 
import "leaflet/dist/leaflet.css";
import LocationMarker from '../components/ui/Events';
import DrawTools from '../components/ui/Drawtool';
import HandleOnFlyTo from '../components/ui/HandleOnFlyTo';
import CustomRouter_Mapbox from '../libs/CustomRouter_Mapbox';
import { satellite } from '../layouts/satellite';


const BasicMap = () => {
    const [center, setCenter] = useState({ lat: 13.7548, lng: 100.5015 });
    const zoom = 9;
    const mapRef = useRef(null); 
    const [map, setMap] = useState(null); 
    
    useEffect(() => {
        console.log(mapRef.current);
    }, [mapRef.current]);

    return (
        <div className='container'>
            <header title="React" />
                <div className='container-map'> 
                    <MapContainer center={center} zoom={zoom} ref={mapRef} scrollWheelZoom={true} whenCreated={setMap}>     
                    <LayersControl position="topleft">
                        <LayersControl.Overlay key="osmOverlay" name="OpenStreetMap" checked>
                        <TileLayer url={osm.url} attribution={osm.attribution} />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay key="satelliteOverlay" name="satellite">
                            <TileLayer url={satellite.url} attribution={satellite.attribution} />
                        </LayersControl.Overlay>
                    </LayersControl>
                    <DrawTools />
                    <LocationMarker />
                    <HandleOnFlyTo mapRef={mapRef} />
                    <CustomRouter_Mapbox/>
                    </MapContainer>
                </div>
        </div>
    );
};


export default BasicMap;
