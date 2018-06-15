const fs = require('fs');
const join = require('path').join;
const dxf = require('dxf');
var _prettyData = require('pretty-data');
var _BoundingBox = require('./node_modules/dxf/lib/BoundingBox');
var _BoundingBox2 = _interopRequireDefault(_BoundingBox);
var _denormalise = require('./node_modules/dxf/lib//denormalise');
var _denormalise2 = _interopRequireDefault(_denormalise);
var _entityToPolyline = require('./node_modules/dxf/lib//entityToPolyline');
var _entityToPolyline2 = _interopRequireDefault(_entityToPolyline);
var _colors = require('./node_modules/dxf/lib//util/colors');
var _colors2 = _interopRequireDefault(_colors);
var _logger = require('./node_modules/dxf/lib//util/logger');
var _logger2 = _interopRequireDefault(_logger);
const PATH = require('path');
const dirTree = require('directory-tree');
var tree = dirTree('./dxf', {
  extensions: /\.dxf$/
}, (item, PATH) => {
  // if a dxf is found, then
  console.log(item);
  ConvertDXFtoSVG(item.path, item.path + ".svg")
});
console.log("---------------")
var tree = dirTree('./dxf', {
  extensions: /\.dxf/
});
var treeData = JSON.stringify(tree, null, 2)
console.log(treeData);
fs.writeFileSync(join(__dirname, 'data.json'), treeData, 'utf-8')

// ConvertDXFtoSVG("./dxf/" + params.path, "./dxf/" + params.path + ".svg")

function ConvertDXFtoSVG(file, out) {
  const parsed = dxf.parseString(fs.readFileSync(
    file, 'utf-8'))
  // Denormalise the entities out of the parsed structure - block transforms
  // are added to the entities in this step
  const entities = dxf.denormalise(parsed)

  // Group entities by layer. Returns an object with layer names as
  // keys to arrays of entities
  const groups = dxf.groupEntitiesByLayer(entities)

  // Ouptut the groups
  console.log('[layer : number of entities]')
  Object.keys(groups).forEach(layer => {
    console.log(layer, ':', groups[layer].length)
  })

  // Open this SVG in your browser or other SVG viewer
  const svg = toSVG(parsed)
  fs.writeFileSync(join(__dirname, out), svg, 'utf-8')
  console.log('\nSVG written')
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function polylineToPath(rgb, polyline) {
  var color24bit = rgb[2] | rgb[1] << 8 | rgb[0] << 16;
  var prepad = color24bit.toString(16);
  for (var i = 0, il = 6 - prepad.length; i < il; ++i) {
    prepad = '0' + prepad;
  }
  var hex = '#' + prepad;

  // SVG is white by default, so make white lines black
  if (hex === '#ffffff') {
    hex = '#000000';
  }

  var d = polyline.reduce(function(acc, point, i) {
    acc += i === 0 ? 'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  return '<path fill="none" stroke="' + hex + '" stroke-width="1%" d="' + d + '"/>';
};

/**
 * Convert the interpolate polylines to SVG
 */

// Modified from https://github.com/bjnortier/dxf/blob/master/lib/toSVG.js to exclude colors/layers data - to work with Guitarlist Plugin
function toSVG(parsed) {
  var entities = (0, _denormalise2.default)(parsed);
  var polylines = entities.map(function(e) {
    return (0, _entityToPolyline2.default)(e);
  });

  var bbox = new _BoundingBox2.default();
  polylines.forEach(function(polyline) {
    polyline.forEach(function(point) {
      bbox.expandByPoint(point[0], point[1]);
    });
  });

  var paths = [];
  polylines.forEach(function(polyline, i) {
    var entity = entities[i];
    //console.log(parsed);

    // var layerTable = parsed.tables.layers[entity.layer];
    //
    // if (!layerTable) {
    //   throw new Error('no layer table for layer:' + entity.layer);
    // }
    //
    // // TODO: not sure if this prioritization is good (entity color first, layer color as fallback)
    // var colorNumber = 'colorNumber' in entity ? entity.colorNumber : layerTable.colorNumber;
    // var rgb = _colors2.default[colorNumber];
    var rgb = [0, 0, 0];
    if (rgb === undefined) {
      _logger2.default.warn('Color index', colorNumber, 'invalid, defaulting to black');
      rgb = [0, 0, 0];
    }

    var p2 = polyline.map(function(p) {
      return [p[0], -p[1]];
    });
    paths.push(polylineToPath(rgb, p2));
  });

  var svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' + bbox.minX + ' ' + -bbox.maxY + ' ' + bbox.width + ' ' + bbox.height + '"';
  svgString += ' width="100%" height="100%">' + paths.join('') + '</svg>';
  return _prettyData.pd.xml(svgString);
};