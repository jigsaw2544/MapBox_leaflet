import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "lrm-graphhopper";
import { useMap } from "react-leaflet";
import "leaflet-contextmenu";
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import "../pages/map.css";
import markerShadowUrl  from '../assets/marker-shadow.png';
import markerGreenUrl  from '../assets/marker-icon-2x-green.png';
import markerRedUrl  from '../assets/marker-icon-2x-red.png';
import markerBlueUrl  from '../assets/marker-icon-2x-blue.png';

const CustomRouter_Mapbox = () => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const [latLngInput, setLatLngInput] = useState({ latitude: "", longitude: "" });
  const [waypoints, setWaypoints] = useState([]);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || routingControlRef.current) return;

    map.whenReady(() => {
      try {
        const routingControlInstance = L.Routing.control({
          router: new L.Routing.mapbox(import.meta.env.VITE_API_MAPBOX_KEY),
          lineOptions: {
            styles: [{ color: "#000050", weight: 4 }]
          },
          show: false,
          draggableWaypoints: true,
          fitSelectedRoutes: true,
          showAlternatives: false,
          addWaypoints: false,
          createMarker: function() { return null; },
        });

        routingControlRef.current = routingControlInstance;
        routingControlInstance.addTo(map);

        return () => {
          if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }, [map]);

  useEffect(() => {
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints(waypoints.map(wp => wp.latLng));
    }
    updateMarkers();
  }, [waypoints]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLatLngInput({ ...latLngInput, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!latLngInput.latitude || !latLngInput.longitude) return;

    const newWaypoint = {
      latLng: L.latLng(parseFloat(latLngInput.latitude), parseFloat(latLngInput.longitude)),
      type: "via",
    };

    setWaypoints([...waypoints, newWaypoint]);
    setLatLngInput({ latitude: "", longitude: "" });
  };

  const handleDeleteWayPoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };
  
  const createMarker = (latLng, index) => {
    const StartWayPoint = L.icon({
      iconUrl: markerGreenUrl,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    const EndWayPoint = L.icon({
      iconUrl: markerRedUrl,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    const Via = L.icon({
      iconUrl: markerBlueUrl,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  
    let markerIcon;
    if (index === 0) {
      markerIcon = StartWayPoint;
    } else if (index === waypoints.length - 1) {
      markerIcon = EndWayPoint;
    } else {
      markerIcon = Via;
    }
  
    if (markersRef.current[index]) {
      markersRef.current[index].off("dragend");
    }
  

    const marker = L.marker(latLng, { icon: markerIcon, draggable: true });
    marker.on("dragend", (event) => {
      const newLatLng = event.target.getLatLng();
      setWaypoints((prevWaypoints) => {
        const updatedWaypoints = [...prevWaypoints];
        updatedWaypoints[index] = { ...updatedWaypoints[index], latLng: newLatLng };
        return updatedWaypoints;
      });
    });
    
    return marker;
  };
  

  const updateMarkers = () => {
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];
  
    waypoints.forEach((wp, index) => {
      const marker = createMarker(wp.latLng, index);
      markersRef.current.push(marker);
      marker.addTo(map);
    });
  };

  const createPopupContent = (latlng) => {
    const container = document.createElement("div");
    const startBtn = document.createElement("button");
    startBtn.innerText = "Add Waypoint";
    startBtn.addEventListener("click", (event) => {
      event.stopPropagation(); 
      addWaypointAndSetToRoutingControl(latlng);
    });
    container.appendChild(startBtn);
    return container;
  };
  

  const addWaypointAndSetToRoutingControl = (latlng) => {
    const newWaypoint = {
      latLng: latlng,
      type: "via",
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  map.on('click', function(e) {
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(createPopupContent(e.latlng))
      .openOn(map);

    setTimeout(() => {
      map.closePopup(popup);
    }, 1000);
  });

  return (
<div className="routing-container">
  <div className='routing-coordinate-input-Container'>
    <form onSubmit={handleSubmit} className="routing-form">
      <input
        type="text"
        name="latitude"
        className="routing-form-input"
        placeholder="Latitude"
        value={latLngInput.latitude}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="longitude"
        className="routing-form-input"
        placeholder="Longitude"
        value={latLngInput.longitude}
        onChange={handleInputChange}
      />
      <button
        type="submit"
        className="routing-form-button"
      >
        Add Waypoint
      </button>
    </form>
    <div className='waypoint-list-container'>
      {waypoints.map((waypoint, index) => {
        let colorStyle;
        if (index === 0) {
          colorStyle = { color: '#5cb85c' }; 
        } else if (index === waypoints.length - 1) {
          colorStyle = { color: '#d9534f' }; 
        } else {
          colorStyle = { color: '#5bc0de' }; 
        }

        return (
          <div key={index} className="waypoint-list" style={colorStyle}>
              {index === 0 && <span>StartWayPoint {index + 1}</span>}
              {index !== 0 && index !== waypoints.length - 1 && <span>WayPoint {index + 1}</span>}
              {index !== 0 && index === waypoints.length - 1  && <span>EndWayPoint {index + 1}</span>}
            <button onClick={() => handleDeleteWayPoint(index)} className="handle_Delete_Coordinate" 
            style={colorStyle}>
              &nbsp;
              Delete
            </button>
          </div>
          );
        })}
    </div>
  </div>
</div>

  );
};

export default CustomRouter_Mapbox;
