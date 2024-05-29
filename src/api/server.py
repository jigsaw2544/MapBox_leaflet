from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import json
import geopandas as gpd
from fiona.crs import from_epsg
from fastkml import kml
from shapely.geometry import shape, mapping, Point, LineString, Polygon, MultiPolygon, MultiPoint, MultiLineString
from shapely.ops import triangulate
from shapely.wkt import dumps
from jsonschema import validate, ValidationError
from werkzeug.utils import secure_filename



app = Flask(__name__)
CORS(app)

# Create a directory to store the saved files
SAVE_DIR ='/path/to/download/directory'
os.makedirs(SAVE_DIR, exist_ok=True)

# Schema for GeoJSON validation
geojson_schema = {
    "type": "object",
    "properties": {
        "type": {"type": "string", "const": "FeatureCollection"},
        "features": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "const": "Feature"},
                    "geometry": {"type": "object"},
                    "properties": {"type": "object"}
                },
                "required": ["type", "geometry", "properties"]
            }
        }
    },
    "required": ["type", "features"]
}

# # Route to save GeoJSON data to a file and serve files for download
# @app.route('/save_and_download_geojson', methods=['POST', 'GET'])
# def save_and_download_geojson():
#     if request.method == 'POST':
#         try:
#             geojson = request.json

#             save_path = os.path.join(SAVE_DIR, 'drawn_features.geojson')
#             with open(save_path, 'w') as f:
#                 json.dump(geojson, f)

#             return jsonify({'message': 'GeoJSON saved successfully', 'file_path': save_path}), 200
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500
#     elif request.method == 'GET':
#         try:
#             filename = 'drawn_features.geojson'
#             file_path = os.path.join(SAVE_DIR, filename)
#             if os.path.exists(file_path):
#                 return send_file(file_path, as_attachment=True)
#             else:
#                 return jsonify({'error': 'File not found'}), 404
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500
        

# def geojson_to_kml(geojson):
#     kml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
#     kml_content += '<kml xmlns="http://www.opengis.net/kml/2.2">\n'
#     kml_content += '  <Document>\n'

#     try:
#         features = geojson.get('features', [])
#         for feature in features:
#             geom = feature.get('geometry', {})
#             coords = geom.get('coordinates', [])
#             geom_type = geom.get('type')

#             if geom_type == 'Polygon' or geom_type == 'MultiPolygon':
#                 if geom_type == 'Polygon':
#                     coords = [coords]
#                 for polygon_coords in coords:
#                     coordinates = ' '.join([f'{coord[0]},{coord[1]},{coord[2] if len(coord) > 2 else 0}' for coord in polygon_coords[0]])
#                     kml_content += f'    <Placemark>\n'
#                     kml_content += f'      <Polygon>\n'
#                     kml_content += f'        <outerBoundaryIs>\n'
#                     kml_content += f'          <LinearRing>\n'
#                     kml_content += f'            <coordinates>\n'
#                     kml_content += f'              {coordinates}\n'
#                     kml_content += f'            </coordinates>\n'
#                     kml_content += f'          </LinearRing>\n'
#                     kml_content += f'        </outerBoundaryIs>\n'
#                     kml_content += f'      </Polygon>\n'
#                     kml_content += f'    </Placemark>\n'
#             elif geom_type == 'Point':
#                 coordinates = f'{coords[0]},{coords[1]},{coords[2] if len(coords) > 2 else 0}'
#                 kml_content += f'    <Placemark>\n'
#                 kml_content += f'      <Point>\n'
#                 kml_content += f'        <coordinates>\n'
#                 kml_content += f'          {coordinates}\n'
#                 kml_content += f'        </coordinates>\n'
#                 kml_content += f'      </Point>\n'
#                 kml_content += f'    </Placemark>\n'

#     except Exception as e:
#         return f'Error: {str(e)}'

#     kml_content += '  </Document>\n'
#     kml_content += '</kml>'

#     return kml_content


# # Route to save GeoJSON data to a KML file and serve files for download
# @app.route('/save_and_download_kml', methods=['POST', 'GET'])
# def save_and_download_kml():
#     if request.method == 'POST':
#         try:
#             geojson = request.json
#             kml_content = geojson_to_kml(geojson)

#             save_path = os.path.join(SAVE_DIR, 'drawn_features.kml')
#             with open(save_path, 'w') as f:
#                 f.write(kml_content)

#             return jsonify({'message': 'KML saved successfully', 'file_path': save_path}), 200
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500
#     elif request.method == 'GET':
#         try:
#             filename = 'drawn_features.kml'
#             file_path = os.path.join(SAVE_DIR, filename)
#             if os.path.exists(file_path):
#                 return send_file(file_path, as_attachment=True)
#             else:
#                 return jsonify({'error': 'File not found'}), 404
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500




# Save GeoJSON data to a Geopackage file
@app.route('/save_and_download_geopackage', methods=['POST', 'GET'])
def save_and_download_geopackage():
    if request.method == 'POST':
        try:
            geojson = request.json
            gdf = gpd.GeoDataFrame.from_features(geojson['features'])
            file_path = os.path.join(SAVE_DIR, 'drawn_features.gpkg')
            count = 1
            while os.path.exists(file_path):
                file_path = os.path.join(SAVE_DIR, f'drawn_features_{count}.gpkg')
                count += 1
            gdf.to_file(file_path, driver='GPKG')
            return send_file(file_path, as_attachment=True)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    elif request.method == 'GET':
        try:
            filename = 'drawn_features.gpkg'  
            file_path = os.path.join(SAVE_DIR, filename)
            if os.path.exists(file_path):
                return send_file(file_path, as_attachment=True)
            else:
                return jsonify({'error': 'File not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

        
        
# def geojson_to_wkt(geojson):
#     wkt_string = ''
#     for feature in geojson['features']:
#         try:
#             geometry = shape(feature['geometry'])
#         except Exception as e:
#             print(f"Error parsing geometry: {e}")
#             continue
#         try:
#             if geometry.geom_type == 'Point':
#                 wkt_string += f'POINT ({geometry.x} {geometry.y})\n'
#             elif geometry.geom_type == 'LineString':
#                 wkt_string += f'LINESTRING ({", ".join([f"{coord[0]} {coord[1]}" for coord in geometry.coords])})\n'
#             elif geometry.geom_type == 'Polygon':
#                 exterior_coords = geometry.exterior.coords
#                 if exterior_coords[0] != exterior_coords[-1]:
#                     exterior_coords += (exterior_coords[0],)  
#                 rings = [f"({', '.join([f'{coord[0]} {coord[1]}' for coord in ring])})" for ring in [exterior_coords] + [interior.coords + (interior.coords[0],) for interior in geometry.interiors]]
#                 wkt_string += f'POLYGON ({", ".join(rings)})\n'
#         except Exception as e:
#             print(f"Error processing geometry type {geometry.geom_type}: {e}")
#             continue
    
#     return wkt_string

# @app.route('/save_and_download_wkt', methods=['POST', 'GET'])
# def save_and_download_wkt():
#     if request.method == 'POST':
#         try:
#             geojson = request.json
#             wkt_data = geojson_to_wkt(geojson)
#             save_path = os.path.join(SAVE_DIR, 'drawn_features.wkt')
#             with open(save_path, 'w') as f:
#                 f.write(wkt_data)
#             return send_file(save_path, as_attachment=True)
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500
#     elif request.method == 'GET':
#         try:
#             filename = 'drawn_features.wkt'
#             file_path = os.path.join(SAVE_DIR, filename)
#             if os.path.exists(file_path):
#                 return send_file(file_path, as_attachment=True)
#             else:
#                 return jsonify({'error': 'File not found'}), 404
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500


# Endpoint for validating GeoJSON
@app.route('/check', methods=['POST'])
def check_geojson():
    try:
        data = request.json
        validate(instance=data, schema=geojson_schema)
        print('Received data is valid GeoJSON:', data)
        return jsonify({'message': 'Received data is valid GeoJSON'}), 200
    except ValidationError as e:
        print('Received data is not valid GeoJSON:', e)
        return jsonify({'error': 'Received data is not valid GeoJSON', 'details': str(e)}), 400
    except Exception as e:
        print('An error occurred:', e)
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500


# Endpoint for testing
@app.route('/test', methods=['GET', 'POST'])
def test_request():
    if request.method == 'POST':
        data = request.json
        print('Received JSON data:', data)
        return 'POST request received'
    elif request.method == 'GET':
        return 'GET request received'

if __name__ == '__main__':
    app.run(debug=True, port=3000)