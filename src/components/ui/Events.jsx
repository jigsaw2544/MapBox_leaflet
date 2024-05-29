import React, { useState } from 'react';
import { Marker, Popup, useMap } from "react-leaflet";
import markerBlueUrl  from '../../assets/marker-icon-blue.png';

const LocationMarker = () => {
    const [position, setPosition] = useState(null);
    const [markerVisible, setMarkerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const map = useMap();

    const handleLocateButtonClick = () => {
        setLoading(true); 
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setPosition(newPosition);
                setMarkerVisible(true);
                map.flyTo(newPosition); 
                setLoading(false); 
                setTimeout(() => {
                    setMarkerVisible(false);
                }, 20000);
            },
            (error) => {
                console.error("Error getting location:", error.message);
                setLoading(false); 
                alert("Error getting location: " + error.message); 
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleDeleteMarker = () => {
        setPosition(null);
        setMarkerVisible(false);
    };

    return (
        <div className='Events'>
            <button  onClick={handleLocateButtonClick} className='events-button'>
                {loading ? "Locating..." : "Locate Me"}
            </button>
            {position && markerVisible && (
                <Marker position={position} icon={L.icon({ iconUrl: markerBlueUrl })}>
                    <Popup>
                        <div>
                            <p>You are here</p>
                            <button onClick={handleDeleteMarker} className='button_Events'>Delete Marker</button>
                        </div>
                    </Popup>
                </Marker>
            )}
        </div>
    );
};

export default LocationMarker;
