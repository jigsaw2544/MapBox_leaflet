"use strict";
import React, { Fragment, useRef, useState, useCallback} from 'react'; 
import { FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw'; 
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import NavMenu from './NavMenu';
import FileSaver from 'file-saver';
import * as turf from '@turf/turf';
import markerIconUrl from '../../assets/marker-icon-blue.png';
import markerShadowUrl from '../../assets/marker-shadow.png';

const DrawTools = () => {
    console.log("DrawTools rendered");
    const map = useMap();
    const featureGroupRef = useRef();
    const [mapLayers,setMapLayers] = useState([]);
    const [polygons, setPolygons] = useState([]);

    const onSave = useCallback((polygon) => {
        setPolygons(prevPolygons => [...prevPolygons, polygon]); 
    }, []);

    window.handleDeleteMarker = function(markerId) {
        const marker = featureGroupRef.current.getLayers().find(layer => layer instanceof L.Marker && layer._leaflet_id === markerId);
        if (marker) {
            map.removeLayer(marker);
        } else {
            console.log("Marker not found with ID: ", markerId);
        }
        console.log("Removing marker with ID: ", markerId);
    };
    
    const _onEdited = e => {
    };
    
    const _onCreated = useCallback((e) => {
        let type = e.layerType;
        let layer = e.layer;
        if (layer instanceof L.EditToolbar.Edit) {
            updateCoordinatesOnEdit(layer);
        }
        
        const showCoordinates = (layer) => {
            let content = '';
    
            if (layer instanceof L.Marker) {
                const latLng = layer.getLatLng();
                content = `Latitude: ${latLng.lat}, Longitude: ${latLng.lng}`;
            } else if (layer instanceof L.Circle) {
                const latLng = layer.getLatLng();
                const radius = layer.getRadius();
                content = `Center - Latitude: ${latLng.lat}, Longitude: ${latLng.lng}, Radius: ${radius}`;
            } else if (layer instanceof L.Rectangle) {
                const bounds = layer.getBounds();
                const southWest = bounds.getSouthWest();
                const northEast = bounds.getNorthEast();
                content = `Southwest - Latitude: ${southWest.lat}, Longitude: ${southWest.lng}<br>`;
                content += `Northeast - Latitude: ${northEast.lat}, Longitude: ${northEast.lng}`;
            } else if (layer instanceof L.Polygon) {
                const latLngs = layer.getLatLngs()[0];
                content = 'Coordinates: <br>';
                latLngs.forEach((coord, index) => {
                    content += `Point ${index + 1}: Latitude: ${coord.lat}, Longitude: ${coord.lng}<br>`;
                });
            } else if (layer instanceof L.Polyline) {
                const latLngs = layer.getLatLngs();
                content = 'Coordinates: <br>';
                latLngs.forEach((coord, index) => {
                    content += `Point ${index + 1}: Latitude: ${coord.lat}, Longitude: ${coord.lng}<br>`;
                });
            }
    
            layer.bindPopup(content).openPopup();
        };
    
        const updateCoordinatesOnEdit = (layer) => {
            layer.on('edit', () => {
                showCoordinates(layer);
            });
        };
    
        console.log(`_onCreated: ${type} created`);
        showCoordinates(layer);
        updateCoordinatesOnEdit(layer);
    
        if (type === "marker") {
            layer.on('dragend', () => {
                showCoordinates(layer);
            });
        } else if (type === "circle") {
            const centerLatLng = layer.getLatLng();
            const geoJsonFeature = {
                type: "Feature",
                properties: {
                    type: "Circle"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [centerLatLng.lng, centerLatLng.lat]
                },
                _leaflet_id: layer._leaflet_id
            };
            setMapLayers(layers => [...layers, geoJsonFeature]);
        } else {
            const geoJsonFeature = layer.toGeoJSON();
            setMapLayers(layers => [...layers, geoJsonFeature]);
        }
        console.log("Geojson", layer.toGeoJSON());
    }, []);
    
    const _onDeleted = e => {
        const { layers } = e;
    
        if (!layers) {
            console.error("Error: Unexpected type of layers");
            return;
        }
        Object.values(layers).forEach(layer => {
            if (layer && layer.layer) {
                featureGroupRef.current.removeLayer(layer.layer);
            }
        });
    };
    
    
    const _onMounted = drawControl => {
        console.log("_onMounted", drawControl);
    };

    const _onEditStart = e => {
        console.log("_onEditStart", e);
    };

    const _onEditStop = e => {
        console.log("_onEditStop", e);
    };

    const _onDeleteStart = e => {
        console.log("_onDeleteStart", e);
    };

    const _onDeleteStop = e => {
        console.log("_onDeleteStop", e);
    };

    const _onDrawStart = e => {
        console.log("_onDrawStart", e);
    }

    const customMarkerIcon = new L.Icon({
        iconUrl: markerIconUrl,
        iconSize: [25, 41], 
        iconAnchor: [12, 41], 
        popupAnchor: [1, -34], 
        shadowUrl: markerShadowUrl,
        shadowSize: [41, 41] 
    });

    const handleSaveGeoJSON = useCallback(() => {
        const userPolygonsGeoJSON = polygons.map(polygon => polygon.toGeoJSON());
        const drawnFeaturesGeoJSON = featureGroupRef.current.toGeoJSON();
    
        drawnFeaturesGeoJSON.features.forEach(feature => {
            if (feature.geometry.type === 'Point' && feature.properties.type === 'Circle') {
                console.log('Converting circle to polygon:', feature);
                const center = feature.geometry.coordinates;
                const radius = feature.properties.radius;
                const numSegments = 64;
                const circlePolygon = turf.circle(center, radius, { steps: numSegments });
                console.log('Generated circle polygon:', circlePolygon);
                
                feature.geometry = circlePolygon.geometry;
                feature.geometry.type = 'Polygon';
            }
        });
    
        const allFeaturesGeoJSON = [...userPolygonsGeoJSON, ...drawnFeaturesGeoJSON.features];
    
        const geojson = {
            type: "FeatureCollection",
            features: allFeaturesGeoJSON
        };
    
        console.log('Final GeoJSON:', geojson);
    
        const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "drawn_features.geojson";
        document.body.appendChild(a);
        a.click();
    
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [polygons]);
     
    
    const handleSaveKML = useCallback(() => {
        const userPolygonsGeoJSON = polygons.map(polygon => polygon.toGeoJSON()); 
        const drawnPolygonsGeoJSON = featureGroupRef.current.toGeoJSON().features;
        const allPolygonsGeoJSON = [...userPolygonsGeoJSON, ...drawnPolygonsGeoJSON];
    
        const kmlFeatures = allPolygonsGeoJSON.map(geojson => {
            let coordinates = '';
    
            if (geojson.geometry.type === 'Polygon') {
                coordinates = geojson.geometry.coordinates[0].map(coord => coord.join(',')).join(' ');
            } else if (geojson.geometry.type === 'MultiPolygon') {
                coordinates = geojson.geometry.coordinates.flatMap(poly => poly[0].map(coord => coord.join(','))).join(' ');
            }
    
            return `
                <Placemark>
                    <Polygon>
                        <outerBoundaryIs>
                            <LinearRing>
                                <coordinates>${coordinates}</coordinates>
                            </LinearRing>
                        </outerBoundaryIs>
                    </Polygon>
                </Placemark>
            `;
        });
    
        const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    ${kmlFeatures.join('')}
                </Document>
            </kml>`;
    
        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        FileSaver.saveAs(blob, 'drawn_features.kml');
    }, [polygons]);

    const handleSaveWKT = useCallback(() => {
        const userFeaturesGeoJSON = polygons.map(polygon => polygon.toGeoJSON());
        const drawnFeaturesGeoJSON = featureGroupRef.current.toGeoJSON().features;
        const allFeaturesGeoJSON = [...userFeaturesGeoJSON, ...drawnFeaturesGeoJSON];
    
        const uniqueFeaturesGeoJSON = allFeaturesGeoJSON.filter((feature, index, self) =>
            index === self.findIndex(f => JSON.stringify(f.geometry.coordinates) === JSON.stringify(feature.geometry.coordinates))
        );
    
        let wktString = '';
    
        uniqueFeaturesGeoJSON.forEach(geojson => {
            if (geojson.geometry && geojson.geometry.type && geojson.geometry.coordinates) {
                const geometryType = geojson.geometry.type;
                let coordinates = '';
    
                switch (geometryType) {
                    case 'Point':
                        coordinates = '(' + geojson.geometry.coordinates.join(' ') + ')';
                        break;
                    case 'LineString':
                        coordinates = '(' + geojson.geometry.coordinates.map(coord => coord.join(' ')).join(', ') + ')';
                        break;
                    case 'Polygon':
                        coordinates = '((' + geojson.geometry.coordinates[0].map(coord => coord.join(' ')).join(', ') + '))';
                        break;
                    case 'MultiPoint':
                        coordinates = '(' + geojson.geometry.coordinates.map(coord => coord.join(' ')).join(', ') + ')';
                        break;
                    case 'MultiLineString':
                        coordinates = '(' + geojson.geometry.coordinates.map(line => '(' + line.map(coord => coord.join(' ')).join(', ') + ')').join(', ') + ')';
                        break;
                    case 'MultiPolygon':
                        coordinates = '(' + geojson.geometry.coordinates.map(poly => '((' + poly[0].map(coord => coord.join(' ')).join(', ') + '))').join(', ') + ')';
                        break;
                    default:
                        break;
                }
    
                if (coordinates) {
                    wktString += `${geometryType.toUpperCase()} ${coordinates}\n`;
                }
            }
        });
    
        if (wktString) {
            const blob = new Blob([wktString], { type: 'text/plain' });
    
            const file = new File([blob], 'drawn_features.wkt', { type: 'text/plain' });
    
            saveAs(file);
        } else {
            console.error('No valid geometry found.');
        }
    }, [polygons]);

    const handleSaveGeopackage = async () => {
        const drawnPolygonsGeoJSON = featureGroupRef.current.toGeoJSON().features;
        const allPolygonsGeoJSON = [...drawnPolygonsGeoJSON];
        const geojson = {
            type: "FeatureCollection",
            features: allPolygonsGeoJSON
        };
    
        try {
            const response = await fetch('http://127.0.0.1:3000/save_and_download_geopackage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(geojson)
            });
    
            if (response.ok) {
                const blob = await response.blob();
                FileSaver.saveAs(blob, 'drawn_features.gpkg');
                console.log('Geopackage file saved successfully');
            } else {
                console.error('Failed to save Geopackage file:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving Geopackage file:', error);
        }
    };
    
    return (
        <Fragment>
            <FeatureGroup ref={featureGroupRef}>
                <EditControl
                    position="bottomleft"
                    onDrawStart={_onDrawStart}
                    onEdited={_onEdited}
                    onCreated={_onCreated}
                    onDeleted={_onDeleted}
                    onMounted={_onMounted}
                    onEditStart={_onEditStart}
                    onEditStop={_onEditStop}
                    onDeleteStart={_onDeleteStart}
                    onDeleteStop={_onDeleteStop}
                    draw={{
                        polyline: {
                            icon: new L.DivIcon({
                                iconSize: new L.Point(8, 8),
                                className: "leaflet-div-icon leaflet-editing-icon"
                            }),
                            shapeOptions: {
                                guidelineDistance: 10,
                                color: "navy",
                                weight: 3
                            }
                        },
                        rectangle: true,
                        circlemarker: false,
                        marker: {icon:customMarkerIcon},
                        circle: false,
                        polygon: true,
                    }}
                />
            </FeatureGroup>
            <div className='container-navbar invisible lg:visible'>
            <NavMenu 
                onSaveGeoJSON={handleSaveGeoJSON}
                onSaveKML={handleSaveKML}
                onSaveWKT={handleSaveWKT}
                onSaveGeopackage={handleSaveGeopackage}
            />
            </div>
        </Fragment>
    );

};

export default DrawTools;
