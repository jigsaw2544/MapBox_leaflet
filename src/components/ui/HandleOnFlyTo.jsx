import React, { useState, useRef, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import markerBlueUrl  from '../../assets/marker-icon-blue.png';

const HandleOnFlyTo = ({ mapRef }) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [position, setPosition] = useState(null);
  const markerRef = useRef(null);
  const cooldownRef = useRef(null);

  const handleOnFlyTo = () => {
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lng);
    if (!isNaN(newLat) && !isNaN(newLng) && mapRef && mapRef.current) {
      const map = mapRef.current;

      clearTimeout(cooldownRef.current);

      setPosition([newLat, newLng]);
      map.flyTo([newLat, newLng], 14, { duration: 2 });

      cooldownRef.current = setTimeout(() => {
        setPosition(null);
      }, 20000);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(cooldownRef.current);
    };
  }, []);

  return (
    <div className="handleOnFlyToContainer invisible lg:visible">
      <div className='inputContainer' >
        <input
          style={{    
            flex: 1,
            backgroundColor: '#FFFFFF',
            color: '#000000',
            padding: '2px',
            fontSize: '1rem',
            fontFamily: 'Arial, sans-serif',
            borderRadius: '3px',
            borderWidth: '3px',
          }}
          type="text"
          id="latInput"
          name="lat"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          style={{    
            flex: 1,
            backgroundColor: '#FFFFFF',
            color: '#000000',
            padding: '2px',
            fontSize: '1rem',
            fontFamily: 'Arial, sans-serif',
            borderRadius: '3px',
            borderWidth: '3px',
          }}
          type="text"
          id="lngInput"
          name="lng"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </div>
    <button onClick={handleOnFlyTo} style={{color:"black",borderWidth: '3px',borderRadius: '3px',backgroundColor: '#FFFFFF', fontSize: '1rem',
          fontFamily: 'Arial, sans-serif',}}>Go to Location</button>
    {position && (
        <Marker position={position} icon={L.icon({ iconUrl: markerBlueUrl })}>
            <Popup>
                {`Latitude: ${position[0]}, Longitude: ${position[1]}`}
                <button onClick={() => setPosition(null)} style={{color:"black",padding: '5px'}}>Delete Marker</button>
            </Popup>
        </Marker>
    )}
</div>
  );
};

export default HandleOnFlyTo;
