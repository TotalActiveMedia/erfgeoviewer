//SPARQL-GeoJSON v.0.2-alpha
window.sparqlToGeoJSON = function(wkt) {
  'use strict';
  var geometryType, coordinates;

  // Remove all spaces
  wkt = wkt.replace(/, /gi, ',');
  //chop off geometry type, already have that
  coordinates = wkt.substr(wkt.indexOf("("), wkt.length);
  //add extra [ and replace ( by [
  coordinates = "[" + coordinates.split("(").join("[");
  //replace ) by ] and add extra ]
  coordinates = coordinates.split(")").join("]") + "]";
  //replace , by ],[
  coordinates = coordinates.split(",").join("],[");
  //replace spaces with ,
  coordinates = coordinates.split(" ").join(",");

  //find substring left of first "(" occurrence for geometry type
  switch (wkt.substr(0, wkt.indexOf("("))) {
    case "POINT":
      geometryType = "Point";
      coordinates = coordinates.substr(1, coordinates.length - 2); //remove redundant [ and ] at beginning and end
      break;
    case "MULTIPOINT":
      geometryType = "MultiPoint";
      break;
    case "LINESTRING":
      geometryType = "LineString";
      break;
    case "MULTILINESTRING":
      geometryType = "MultiLineString";
      break;
    case "POLYGON":
      geometryType = "Polygon";
      break;
    case "MULTIPOLYGON":
      geometryType = "MultiPolygon";
      break;
    case "GEOMETRYCOLLECTION":
      geometryType = "GeometryCollection";
      break;
    default:
      //invalid wkt!
      return {};
  }

  return {
    "type": "Feature",
    "geometry": {
      "type": geometryType,
      "coordinates": JSON.parse(coordinates)
    },
    "properties": {}
  };
}
