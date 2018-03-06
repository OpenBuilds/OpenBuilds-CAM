/**
SVG parser for the Lasersaur.
Converts SVG DOM to a flat collection of paths.

Copyright (c) 2011 Nortd Labs
Open Source by the terms of the Gnu Public License (GPL3) or higher.

Code inspired by cake.js, canvg.js, svg2obj.py, and Squirtle.
Thank you for open sourcing your work!

Usage:
var boundarys = SVGReader.parse(svgstring, config)

Features:
* <svg> width and height, viewBox clipping.
* paths, rectangles, ellipses, circles, lines, polylines and polygons
* nested transforms
* transform lists (transform="rotate(30) translate(2,2) scale(4)")
* non-pixel units (cm, mm, in, pt, pc)
* 'style' attribute and presentation attributes
* curves, arcs, cirles, ellipses tesellated according to tolerance

Intentinally not Supported:
* markers
* masking
* em, ex, % units
* text (needs to be converted to paths)
* raster images
* style sheets

ToDo:
* check for out of bounds geometry
*/

if(typeof require === 'function') {
    var Vec2 = require(__dirname + '/vec2.js').Vec2
}

SVGReader = {

    boundarys : {},
    // output path flattened (world coords)
    // hash of path by color
    // each path is a list of subpaths
    // each subpath is a list of verteces
    style : {},
    // style at current parsing position
    tolerance : 0.05,
    // max tollerance when tesselating curvy shapes


    preview : function(svgstring, config) {
        this.tolerance_squared = Math.pow(this.tolerance, 2);

        // parse xml
        var svgRootElement;
        if (window.DOMParser) {
            var parser = new DOMParser();
            svgRootElement = parser.parseFromString(svgstring, 'text/xml').documentElement;
        }
        else {
            xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(svgstring);
            svgRootElement = xmlDoc.documentElement;
        }

        // let the fun begin
        var node = {}
        this.boundarys.allcolors = []  // TODO: sort by color
        node.stroke = [255,0,0];
        node.xformToWorld = [1,0,0,1,0,0]
        this.previewChildren(svgRootElement, node)
        return this.boundarys
    },


    previewChildren : function(domNode, parentNode) {
        var childNodes = []
        for (var i=0; i<domNode.childNodes.length; i++) {
            var tag = domNode.childNodes[i]
            if (tag.childNodes) {
                if (tag.tagName) {
                    // we are looping here through
                    // all nodes with child nodes
                    // others are irrelevant

                    // 1.) setup a new node
                    // and inherit from parent
                    var node = {}
                    node.path = [];
                    node.xform = [1,0,0,1,0,0];
                    node.opacity = parentNode.opacity;
                    node.display = parentNode.display;
                    node.visibility = parentNode.visibility;
                    node.fill = parentNode.fill;
                    node.stroke = parentNode.stroke;
                    node.color = parentNode.color;
                    node.fillOpacity = parentNode.fillOpacity;
                    node.strokeOpacity = parentNode.strokeOpacity;

                    // 2.) parse own attributes and overwrite
                    if (tag.attributes) {
                        for (var j=0; j<tag.attributes.length; j++) {
                            var attr = tag.attributes[j]
                            if (attr.nodeName && attr.nodeValue && this.SVGAttributeMapping[attr.nodeName]) {
                                this.SVGAttributeMapping[attr.nodeName](this, node, attr.nodeValue)
                            }
                        }
                    }

                    // 3.) accumulate transformations
                    node.xformToWorld = this.matrixMult(parentNode.xformToWorld, node.xform)

                    // 4.) parse tag
                    // with current attributes and transformation
                    if (this.SVGTagMapping[tag.tagName]) {
                        //if (node.stroke[0] == 255 && node.stroke[1] == 0 && node.stroke[2] == 0) {
                        this.SVGTagMapping[tag.tagName](this, tag, node)
                        //}
                    }

                    // 5.) compile boundarys
                    // before adding all path data convert to world coordinates
                    for (var k=0; k<node.path.length; k++) {
                        var subpath = node.path[k];
                        for (var l=0; l<node.path[k].length; l++) {
                            var tmp =  this.matrixApply(node.xformToWorld, subpath[l]);
                            subpath[l] = new Vec2(tmp[0], tmp[1]);
                        }
                        subpath.node = node;

                        //console.log('Stroke: '+node.stroke);
                        //console.log('Stroke: '+parsecolor);
                        //  if (node.stroke == parsecolor) {
                        //    this.boundarys.allcolors.push(subpath);
                        //    console.log('matched');
                        //  }
                        //} else {
                        this.boundarys.allcolors.push(subpath);
                        //};
                        //this.boundarys.allcolors.push(subpath);
                        //console.log(this.boundarys);

                    }
                }

                // recursive call
                this.previewChildren(tag, node)
            }
        }
    },

    parse : function(svgstring, config) {
        this.tolerance_squared = Math.pow(this.tolerance, 2);

        // parse xml
        var svgRootElement;
        var isBrowserEnv = typeof window !== 'undefined'
        if (!isBrowserEnv || window.DOMParser) {
            var DOMParser = isBrowserEnv ? window.DOMParser : require('xmldom').DOMParser
            var parser = new DOMParser();
            svgRootElement = parser.parseFromString(svgstring, 'text/xml').documentElement;
        }
        else {
            xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(svgstring);
            svgRootElement = xmlDoc.documentElement;
        }

        // let the fun begin
        var node = {};
        this.boundarys.allcolors = [];  // TODO: sort by color
        node.stroke = [255,0,0];
        node.xformToWorld = [1,0,0,1,0,0];
        this.parseChildren(svgRootElement, node);

        // Parse editor vendor/version/etc...
        // Editor tag stay on line 2
        var fingerprint = svgstring.split('\n')[1];
        if (fingerprint) {
          var inkscape = fingerprint.match(/^<!-- Created with Inkscape/i);
          var illustrator = fingerprint.match(/^<!-- Generator: Adobe Illustrator ([^,]+),/i);

          if (inkscape) {
              config.editor = {
                  name: 'inkscape',
                  version: null,
                  fingerprint: fingerprint.substring(18, fingerprint.length-4).trim()
              };
          }
          else if (illustrator) {
              config.editor = {
                  name: 'illustrator',
                  version: illustrator[1],
                  fingerprint: fingerprint.substring(16, fingerprint.length-4).trim()
              };
          }
          else {
              config.editor = null;
          }
        } else {
              config.editor = null;
        }


        // return...
        return this.boundarys;
    },


    parseChildren : function(domNode, parentNode) {
        var childNodes = []
        for (var i=0; i<domNode.childNodes.length; i++) {
            var tag = domNode.childNodes[i]
            if (tag.childNodes) {
                if (tag.tagName) {
                    // we are looping here through
                    // all nodes with child nodes
                    // others are irrelevant

                    // 1.) setup a new node
                    // and inherit from parent
                    var node = {}
                    node.path = [];
                    node.xform = [1,0,0,1,0,0];
                    node.opacity = parentNode.opacity;
                    node.display = parentNode.display;
                    node.visibility = parentNode.visibility;
                    node.fill = parentNode.fill;
                    node.stroke = parentNode.stroke;
                    node.color = parentNode.color;
                    node.fillOpacity = parentNode.fillOpacity;
                    node.strokeOpacity = parentNode.strokeOpacity;
                    node.parent = parentNode
                    node.layer = parentNode.layer;

                    // 2.) parse own attributes and overwrite
                    if (tag.attributes) {
                        for (var j=0; j<tag.attributes.length; j++) {
                            var attr = tag.attributes[j]
                            if (attr.nodeName && attr.nodeValue && this.SVGAttributeMapping[attr.nodeName]) {
                                this.SVGAttributeMapping[attr.nodeName](this, node, attr.nodeValue)
                            }
                        }
                    }

                    // 3.) accumulate transformations
                    node.xformToWorld = this.matrixMult(parentNode.xformToWorld, node.xform)

                    // 4.) parse tag
                    // with current attributes and transformation
                    if (this.SVGTagMapping[tag.tagName]) {
                        //if (node.stroke[0] == 255 && node.stroke[1] == 0 && node.stroke[2] == 0) {
                        this.SVGTagMapping[tag.tagName](this, tag, node)
                        //}
                    }

                    // 5.) compile boundarys
                    // before adding all path data convert to world coordinates
                    for (var k=0; k<node.path.length; k++) {
                        var subpath = node.path[k];
                        for (var l=0; l<node.path[k].length; l++) {
                            var tmp =  this.matrixApply(node.xformToWorld, subpath[l]);
                            subpath[l] = new Vec2(tmp[0], tmp[1]);
                        }
                        subpath.node = node;

                        //console.log('Stroke: '+node.stroke+ ' of type '+ typeof(node.stroke));
                        //console.log('Stroke: '+parsecolor+ ' of type '+ typeof(parsecolor));
                        // Compare object values - as per http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
                        var parsecolor;
                        if (parsecolor) {
                            if (JSON.stringify(node.stroke) === JSON.stringify(parsecolor) ) {
                                this.boundarys.allcolors.push(subpath);
                                //console.log('matched');
                            }
                        } else {
                            this.boundarys.allcolors.push(subpath);
                        }
                        //this.boundarys.allcolors.push(subpath);
                        //console.log(this.boundarys);
                    }
                }

                // recursive call
                this.parseChildren(tag, node)
            }
        }
    },



    /////////////////////////////
    // recognized svg attributes

    SVGAttributeMapping : {
        DEG_TO_RAD : Math.PI / 180,
        RAD_TO_DEG : 180 / Math.PI,

        id : function(parser, node, val) {
            node.id = val
        },

        transform : function(parser, node, val) {
            // http://www.w3.org/TR/SVG11/coords.html#EstablishingANewUserSpace
            var xforms = []
            var segs = val.match(/[a-z]+\s*\([^)]*\)/ig)
            for (var i=0; i<segs.length; i++) {
                var kv = segs[i].split("(");
                var xformKind = kv[0].strip();
                var paramsTemp = kv[1].strip().slice(0,-1);
                var params = paramsTemp.split(/[\s,]+/).map(parseFloat)
                // double check params
                for (var j=0; j<params.length; j++) {
                    if ( isNaN(params[j]) ) {
                        console.log('warning', 'transform skipped; contains non-numbers');
                        continue  // skip this transform
                    }
                }

                // translate
                if (xformKind == 'translate') {
                    if (params.length == 1) {
                        xforms.push([1, 0, 0, 1, params[0], params[0]])
                    } else if (params.length == 2) {
                        xforms.push([1, 0, 0, 1, params[0], params[1]])
                    } else {
                        console.log('warning', 'translate skipped; invalid num of params');
                    }
                    // rotate
                } else if (xformKind == 'rotate') {
                    if (params.length == 3) {
                        var angle = params[0] * this.DEG_TO_RAD
                        xforms.push([1, 0, 0, 1, params[1], params[2]])
                        xforms.push([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0])
                        xforms.push([1, 0, 0, 1, -params[1], -params[2]])
                    } else if (params.length == 1) {
                        var angle = params[0] * this.DEG_TO_RAD
                        xforms.push([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0])
                    } else {
                        console.log('warning', 'rotate skipped; invalid num of params');
                    }
                    //scale
                } else if (xformKind == 'scale') {
                    if (params.length == 1) {
                        xforms.push([params[0], 0, 0, params[0], 0, 0])
                    } else if (params.length == 2) {
                        xforms.push([params[0], 0, 0, params[1], 0, 0])
                    } else {
                        console.log('warning', 'scale skipped; invalid num of params');
                    }
                    // matrix
                } else if (xformKind == 'matrix') {
                    if (params.length == 6) {
                        xforms.push(params)
                    }
                    // skewX
                } else if (xformKind == 'skewX') {
                    if (params.length == 1) {
                        var angle = params[0]*this.DEG_TO_RAD
                        xforms.push([1, 0, Math.tan(angle), 1, 0, 0])
                    } else {
                        console.log('warning', 'skewX skipped; invalid num of params');
                    }
                    // skewY
                } else if (xformKind == 'skewY') {
                    if (params.length == 1) {
                        var angle = params[0]*this.DEG_TO_RAD
                        xforms.push([1, Math.tan(angle), 0, 1, 0, 0])
                    } else {
                        console.log('warning', 'skewY skipped; invalid num of params');
                    }
                }
            }

            //calculate combined transformation matrix
            xform_combined = [1,0,0,1,0,0]
            for (var i=0; i<xforms.length; i++) {
                xform_combined = parser.matrixMult(xform_combined, xforms[i])
            }

            // assign
            node.xform = xform_combined
        },

        style : function(parser, node, val) {
            // style attribute
            // http://www.w3.org/TR/SVG11/styling.html#StyleAttribute
            // example: <rect x="200" y="100" width="600" height="300"
            //          style="fill: red; stroke: blue; stroke-width: 3"/>

            // relay to parse style attributes the same as Presentation Attributes
            var segs = val.split(";")
            for (var i=0; i<segs.length; i++) {
                var kv = segs[i].split(":")
                var k = kv[0].strip()
                if (this[k]) {
                    var v = kv[1].strip()
                    this[k](parser, node, v)
                }
            }
        },

        ///////////////////////////
        // Presentations Attributes
        // http://www.w3.org/TR/SVG11/styling.html#UsingPresentationAttributes
        // example: <rect x="200" y="100" width="600" height="300"
        //          fill="red" stroke="blue" stroke-width="3"/>

        opacity : function(parser, node, val) {
            node.opacity = parseFloat(val)
        },

        display : function (parser, node, val) {
            node.display = val
        },

        visibility : function (parser, node, val) {
            node.visibility = val
        },

        fill : function(parser, node, val) {
            node.fill = this.__parseColor(val, node.color)
        },

        stroke : function(parser, node, val) {
            node.stroke = this.__parseColor(val, node.color)
        },

        color : function(parser, node, val) {
            if (val == 'inherit') return
            node.color = this.__parseColor(val, node.color)
        },

        'fill-opacity' : function(parser, node, val) {
            node.fillOpacity = Math.min(1,Math.max(0,parseFloat(val)))
        },

        'stroke-opacity' : function(parser, node, val) {
            node.strokeOpacity = Math.min(1,Math.max(0,parseFloat(val)))
        },

        // Presentations Attributes
        ///////////////////////////

        __parseColor : function(val, currentColor) {

            if (val.charAt(0) == '#') {
                if (val.length == 4)
                val = val.replace(/([^#])/g, '$1$1')
                var a = val.slice(1).match(/../g).map(
                    function(i) { return parseInt(i, 16) })
                    return a

                } else if (val.search(/^rgb\(/) != -1) {
                    var a = val.slice(4,-1).split(",")
                    for (var i=0; i<a.length; i++) {
                        var c = a[i].strip()
                        if (c.charAt(c.length-1) == '%')
                        a[i] = Math.round(parseFloat(c.slice(0,-1)) * 2.55)
                        else
                        a[i] = parseInt(c)
                    }
                    return a

                } else if (val.search(/^rgba\(/) != -1) {
                    var a = val.slice(5,-1).split(",")
                    for (var i=0; i<3; i++) {
                        var c = a[i].strip()
                        if (c.charAt(c.length-1) == '%')
                        a[i] = Math.round(parseFloat(c.slice(0,-1)) * 2.55)
                        else
                        a[i] = parseInt(c)
                    }
                    var c = a[3].strip()
                    if (c.charAt(c.length-1) == '%')
                    a[3] = Math.round(parseFloat(c.slice(0,-1)) * 0.01)
                    else
                    a[3] = Math.max(0, Math.min(1, parseFloat(c)))
                    return a

                } else if (val.search(/^url\(/) != -1) {
                    console.log('error', "defs are not supported at the moment");
                } else if (val == 'currentColor') {
                    return currentColor
                } else if (val == 'none') {
                    return 'none'
                } else if (val == 'freeze') { // SMIL is evil, but so are we
                    return null
                } else if (val == 'remove') {
                    return null
                } else { // unknown value, maybe it's an ICC color
                return val
            }
        }
    },

    // recognized svg attributes
    /////////////////////////////





    ///////////////////////////
    // recognized svg elements

    SVGTagMapping : {
        svg : function(parser, tag, node) {
            // has style attributes
            node.fill = 'black'
            node.stroke = 'none'
            // // parse document dimensions
            // node.width = 0
            // node.height = 0
            // var w = tag.getAttribute('width')
            // var h = tag.getAttribute('height')
            // if (!w) w = h
            // else if (!h) h = w
            // if (w) {
            //   var wpx = parser.parseUnit(w, cn, 'x')
            //   var hpx = parser.parseUnit(h, cn, 'y')
            // }
        },


        g : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/struct.html#Groups
            // has transform and style attributes

            // parent layer
            var parent = node.layer;
            var uid = Math.round(new Date().getTime() + (Math.random() * 100));

            // inkscape
            var label = tag.getAttribute("inkscape:label");
            var groupmode = tag.getAttribute("inkscape:groupmode");

            if (label && groupmode && groupmode == 'layer') {
                node.layer = {
                    id: tag.id + '-' + uid,
                    label: label,
                    parent: parent
                };
            }

            // illustrator, etc...
            else if (tag.id) {
                node.layer = {
                    id: tag.id + '-' + uid,
                    label: tag.id,
                    parent: parent
                };
            }

        },


        polygon : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/shapes.html#PolygonElement
            // has transform and style attributes
            var d = this.__getPolyPath(tag)
            d.push('z')
            parser.addPath(d, node)
        },


        polyline : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/shapes.html#PolylineElement
            // has transform and style attributes
            var d = this.__getPolyPath(tag)
            parser.addPath(d, node)
        },

        __getPolyPath : function(tag) {
            // has transform and style attributes
            var subpath = []
            var vertnums = tag.getAttribute("points").toString().strip().split(/[\s,]+/).map(parseFloat)
            if (vertnums.length % 2 == 0) {
                var d = ['M']
                d.push(vertnums[0])
                d.push(vertnums[1])
                for (var i=2; i<vertnums.length; i+=2) {
                    d.push(vertnums[i])
                    d.push(vertnums[i+1])
                }
                return d
            } else {
                console.log('error', "in __getPolyPath: odd number of verteces");
            }
        },

        rect : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/shapes.html#RectElement
            // has transform and style attributes
            var w = parser.parseUnit(tag.getAttribute('width')) || 0
            var h = parser.parseUnit(tag.getAttribute('height')) || 0
            var x = parser.parseUnit(tag.getAttribute('x')) || 0
            var y = parser.parseUnit(tag.getAttribute('y')) || 0
            var rx = parser.parseUnit(tag.getAttribute('rx'))
            var ry = parser.parseUnit(tag.getAttribute('ry'))

            if(rx == null || ry == null) {  // no rounded corners
                var d = ['M', x, y, 'h', w, 'v', h, 'h', -w, 'z'];
                parser.addPath(d, node)
            } else {                       // rounded corners
                if ('ry' == null) { ry = rx; }
                if (rx < 0.0) { rx *=-1; }
                if (ry < 0.0) { ry *=-1; }
                d = ['M', x+rx , y ,
                'h', w-2*rx,
                'c', rx, 0.0, rx, ry, rx, ry,
                'v', h-ry,
                'c', '0.0', ry, -rx, ry, -rx, ry,
                'h', -w+2*rx,
                'c', -rx, '0.0', -rx, -ry, -rx, -ry,
                'v', -h+ry,
                'c', '0.0','0.0','0.0', -ry, rx, -ry,
                'z'];
                parser.addPath(d, node)
            }
        },


        line : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/shapes.html#LineElement
            // has transform and style attributes
            var x1 = parser.parseUnit(tag.getAttribute('x1')) || 0
            var y1 = parser.parseUnit(tag.getAttribute('y1')) || 0
            var x2 = parser.parseUnit(tag.getAttribute('x2')) || 0
            var y2 = parser.parseUnit(tag.getAttribute('y2')) || 0
            var d = ['M', x1, y1, 'L', x2, y2]
            parser.addPath(d, node)
        },


        circle : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/shapes.html#CircleElement
            // has transform and style attributes
            var r = parser.parseUnit(tag.getAttribute('r'))
            var cx = parser.parseUnit(tag.getAttribute('cx')) || 0
            var cy = parser.parseUnit(tag.getAttribute('cy')) || 0

            if (r > 0.0) {
                var d = ['M', cx-r, cy,
                'A', r, r, 0, 0, 0, cx, cy+r,
                'A', r, r, 0, 0, 0, cx+r, cy,
                'A', r, r, 0, 0, 0, cx, cy-r,
                'A', r, r, 0, 0, 0, cx-r, cy,
                'Z'];
                parser.addPath(d, node);
            }
        },


        ellipse : function(parser, tag, node) {
            // has transform and style attributes
            var rx = parser.parseUnit(tag.getAttribute('rx'))
            var ry = parser.parseUnit(tag.getAttribute('ry'))
            var cx = parser.parseUnit(tag.getAttribute('cx')) || 0
            var cy = parser.parseUnit(tag.getAttribute('cy')) || 0

            if (rx > 0.0 && ry > 0.0) {
                var d = ['M', cx-rx, cy,
                'A', rx, ry, 0, 0, 0, cx, cy+ry,
                'A', rx, ry, 0, 0, 0, cx+rx, cy,
                'A', rx, ry, 0, 0, 0, cx, cy-ry,
                'A', rx, ry, 0, 0, 0, cx-rx, cy,
                'Z'];
                parser.addPath(d, node);
            }
        },


        path : function(parser, tag, node) {
            // http://www.w3.org/TR/SVG11/paths.html
            // has transform and style attributes
            var d = tag.getAttribute("d")
            parser.addPath(d, node)
        },

        image : function(parser, tag, node) {
            console.log('IMAGE:')
            console.log(tag.href.baseVal);
            var name = 'Embedded raster';
            var data = tag.href.baseVal;
            // drawRaster(name, data); // not supported
            // not supported
            // has transform and style attributes
        },

        defs : function(parser, tag, node) {
            // not supported
            // http://www.w3.org/TR/SVG11/struct.html#Head
            // has transform and style attributes
        },

        style : function(parser, tag, node) {
            // not supported: embedded style sheets
            // http://www.w3.org/TR/SVG11/styling.html#StyleElement
            // instead presentation attributes and the 'style' attribute
            // var style = tag.getAttribute("style")
            // if (style) {
            //   var segs = style.split(";")
            //   for (var i=0; i<segs.length; i++) {
            //     var kv = segs[i].split(":")
            //     var k = kv[0].strip()
            //     if (this.SVGAttributeMapping[k]) {
            //       var v = kv[1].strip()
            //       this.SVGAttributeMapping[k].call(v, defs, st)
            //     }
            //   }
            // }
        }

    },

    // recognized svg elements
    ///////////////////////////



    //////////////////////////////////////////////////////////////////////////
    // handle path data
    // this is where all the geometry gets converted for the boundarys output

    addPath : function(d, node) {
        // http://www.w3.org/TR/SVG11/paths.html#PathData

        var tolerance2 = this.tolerance_squared
        var totalMaxScale = this.matrixGetScale(node.xformToWorld);
        if (totalMaxScale != 0) {
            // adjust for possible transforms
            tolerance2 /= Math.pow(totalMaxScale, 2);
            // console.log('notice', "tolerance2: " + tolerance2.toString());
        }

        if ( typeof d == 'string') {
            // parse path string
            if (d.length > 0) {
                d = d.match(/([A-Za-z]|-?[0-9]+\.?[0-9]*(?:e-?[0-9]*)?)/g);
                for (var i=0; i<d.length; i++) {
                    var num = parseFloat(d[i]);
                    if (!isNaN(num)) {
                        d[i] = num;
                    }
                }
            } else {
                // console.log(node)
                printLog("SVG Parser found an empty node: " + node.id + ": IGNORED", errorcolor, "file")
            }
        }
        //console.log('notice', "d: " + d.toString());

        function nextIsNum () {
            return (d.length > 0) && (typeof(d[0]) === 'number');
        }

        function getNext() {
            if (d.length > 0) {
                return d.shift();  // pop first item
            } else {
                console.log('error', "in addPath: not enough parameters");
                return null;
            }
        }

        var x = 0;
        var y = 0;
        var cmdPrev = '';
        var xPrevCp;
        var yPrevCp;
        var subpath = [];

        while (d.length > 0) {
            var cmd = getNext();
            switch(cmd) {
                case 'M':  // moveto absolute
                // start new subpath
                if ( subpath.length > 0) {
                    node.path.push(subpath);
                    subpath = [];
                }
                var implicitVerts = 0
                while (nextIsNum()) {
                    x = getNext();
                    y = getNext();
                    subpath.push([x, y]);
                    implicitVerts += 1;
                }
                break
                case 'm':  //moveto relative
                // start new subpath
                if ( subpath.length > 0) {
                    node.path.push(subpath);
                    subpath = [];
                }
                if (cmdPrev == '') {
                    // first treated absolute
                    x = getNext();
                    y = getNext();
                    subpath.push([x, y]);
                }
                var implicitVerts = 0
                while (nextIsNum()) {
                    // subsequent treated realtive
                    x += getNext();
                    y += getNext();
                    subpath.push([x, y]);
                    implicitVerts += 1;
                }
                break;
                case 'Z':  // closepath
                case 'z':  // closepath
                // loop and finalize subpath
                if ( subpath.length > 0) {
                    subpath.push(subpath[0]);  // close
                    node.path.push(subpath);
                    x = subpath[subpath.length-1][0];
                    y = subpath[subpath.length-1][1];
                    subpath = [];
                }
                break
                case 'L':  // lineto absolute
                while (nextIsNum()) {
                    x = getNext();
                    y = getNext();
                    subpath.push([x, y]);
                }
                break
                case 'l':  // lineto relative
                while (nextIsNum()) {
                    x += getNext();
                    y += getNext();
                    subpath.push([x, y]);
                }
                break
                case 'H':  // lineto horizontal absolute
                while (nextIsNum()) {
                    x = getNext();
                    subpath.push([x, y]);
                }
                break
                case 'h':  // lineto horizontal relative
                while (nextIsNum()) {
                    x += getNext();
                    subpath.push([x, y]);
                }
                break;
                case 'V':  // lineto vertical absolute
                while (nextIsNum()) {
                    y = getNext()
                    subpath.push([x, y])
                }
                break;
                case 'v':  // lineto vertical realtive
                while (nextIsNum()) {
                    y += getNext();
                    subpath.push([x, y]);
                }
                break;
                case 'C':  // curveto cubic absolute
                while (nextIsNum()) {
                    var x2 = getNext();
                    var y2 = getNext();
                    var x3 = getNext();
                    var y3 = getNext();
                    var x4 = getNext();
                    var y4 = getNext();
                    subpath.push([x,y]);
                    this.addCubicBezier(subpath, x, y, x2, y2, x3, y3, x4, y4, 0, tolerance2);
                    subpath.push([x4,y4]);
                    x = x4;
                    y = y4;
                    xPrevCp = x3;
                    yPrevCp = y3;
                }
                break
                case 'c':  // curveto cubic relative
                while (nextIsNum()) {
                    var x2 = x + getNext();
                    var y2 = y + getNext();
                    var x3 = x + getNext();
                    var y3 = y + getNext();
                    var x4 = x + getNext();
                    var y4 = y + getNext();
                    subpath.push([x,y]);
                    this.addCubicBezier(subpath, x, y, x2, y2, x3, y3, x4, y4, 0, tolerance2);
                    subpath.push([x4,y4]);
                    x = x4;
                    y = y4;
                    xPrevCp = x3;
                    yPrevCp = y3;
                }
                break
                case 'S':  // curveto cubic absolute shorthand
                while (nextIsNum()) {
                    var x2;
                    var y2;
                    if (cmdPrev.match(/[CcSs]/)) {
                        x2 = x-(xPrevCp-x);
                        y2 = y-(yPrevCp-y);
                    } else {
                        x2 = x;
                        y2 = y;
                    }
                    var x3 = getNext();
                    var y3 = getNext();
                    var x4 = getNext();
                    var y4 = getNext();
                    subpath.push([x,y]);
                    this.addCubicBezier(subpath, x, y, x2, y2, x3, y3, x4, y4, 0, tolerance2);
                    subpath.push([x4,y4]);
                    x = x4;
                    y = y4;
                    xPrevCp = x3;
                    yPrevCp = y3;
                }
                break
                case 's':  // curveto cubic relative shorthand
                while (nextIsNum()) {
                    var x2;
                    var y2;
                    if (cmdPrev.match(/[CcSs]/)) {
                        x2 = x-(xPrevCp-x);
                        y2 = y-(yPrevCp-y);
                    } else {
                        x2 = x;
                        y2 = y;
                    }
                    var x3 = x + getNext();
                    var y3 = y + getNext();
                    var x4 = x + getNext();
                    var y4 = y + getNext();
                    subpath.push([x,y]);
                    this.addCubicBezier(subpath, x, y, x2, y2, x3, y3, x4, y4, 0, tolerance2);
                    subpath.push([x4,y4]);
                    x = x4;
                    y = y4;
                    xPrevCp = x3;
                    yPrevCp = y3;
                }
                break
                case 'Q':  // curveto quadratic absolute
                while (nextIsNum()) {
                    var x2 = getNext();
                    var y2 = getNext();
                    var x3 = getNext();
                    var y3 = getNext();
                    subpath.push([x,y]);
                    this.addQuadraticBezier(subpath, x, y, x2, y2, x3, y3, 0, tolerance2);
                    subpath.push([x3,y3]);
                    x = x3;
                    y = y3;
                }
                break
                case 'q':  // curveto quadratic relative
                while (nextIsNum()) {
                    var x2 = x + getNext();
                    var y2 = y + getNext();
                    var x3 = x + getNext();
                    var y3 = y + getNext();
                    subpath.push([x,y]);
                    this.addQuadraticBezier(subpath, x, y, x2, y2, x3, y3, 0, tolerance2);
                    subpath.push([x3,y3]);
                    x = x3;
                    y = y3;
                }
                break
                case 'T':  // curveto quadratic absolute shorthand
                while (nextIsNum()) {
                    var x2;
                    var y2;
                    if (cmdPrev.match(/[QqTt]/)) {
                        x2 = x-(xPrevCp-x);
                        y2 = y-(yPrevCp-y);
                    } else {
                        x2 = x;
                        y2 = y;
                    }
                    var x3 = getNext();
                    var y3 = getNext();
                    subpath.push([x,y]);
                    this.addQuadraticBezier(subpath, x, y, x2, y2, x3, y3, 0, tolerance2);
                    subpath.push([x3,y3]);
                    x = x3;
                    y = y3;
                    xPrevCp = x2;
                    yPrevCp = y2;
                }
                break
                case 't':  // curveto quadratic relative shorthand
                while (nextIsNum()) {
                    var x2;
                    var y2;
                    if (cmdPrev.match(/[QqTt]/)) {
                        x2 = x-(xPrevCp-x);
                        y2 = y-(yPrevCp-y);
                    } else {
                        x2 = x;
                        y2 = y;
                    }
                    var x3 = x + getNext();
                    var y3 = y + getNext();
                    subpath.push([x,y]);
                    this.addQuadraticBezier(subpath, x, y, x2, y2, x3, y3, 0, tolerance2);
                    subpath.push([x3,y3]);
                    x = x3;
                    y = y3;
                    xPrevCp = x2;
                    yPrevCp = y2;
                }
                break
                case 'A':  // eliptical arc absolute
                while (nextIsNum()) {
                    var rx = getNext();
                    var ry = getNext();
                    var xrot = getNext();
                    var large = getNext();
                    var sweep = getNext();
                    var x2 = getNext();
                    var y2 = getNext();
                    this.addArc(subpath, x, y, rx, ry, xrot, large, sweep, x2, y2, tolerance2);
                    x = x2
                    y = y2
                }
                break
                case 'a':  // elliptical arc relative
                while (nextIsNum()) {
                    var rx = getNext();
                    var ry = getNext();
                    var xrot = getNext();
                    var large = getNext();
                    var sweep = getNext();
                    var x2 = x + getNext();
                    var y2 = y + getNext();
                    this.addArc(subpath, x, y, rx, ry, xrot, large, sweep, x2, y2, tolerance2);
                    x = x2
                    y = y2
                }
                break
            }
            cmdPrev = cmd;
        }
        // finalize subpath
        if ( subpath.length > 0) {
            node.path.push(subpath);
            subpath = [];
        }
    },


    addCubicBezier : function(subpath, x1, y1, x2, y2, x3, y3, x4, y4, level, tolerance2) {
        // for details see:
        // http://www.antigrain.com/research/adaptive_bezier/index.html
        // based on DeCasteljau Algorithm
        // The reason we use a subdivision algo over an incremental one
        // is we want to have control over the deviation to the curve.
        // This mean we subdivide more and have more curve points in
        // curvy areas and less in flatter areas of the curve.

        if (level > 18) {
            // protect from deep recursion cases
            // max 2**18 = 262144 segments
            return
        }

        // Calculate all the mid-points of the line segments
        var x12   = (x1 + x2) / 2.0
        var y12   = (y1 + y2) / 2.0
        var x23   = (x2 + x3) / 2.0
        var y23   = (y2 + y3) / 2.0
        var x34   = (x3 + x4) / 2.0
        var y34   = (y3 + y4) / 2.0
        var x123  = (x12 + x23) / 2.0
        var y123  = (y12 + y23) / 2.0
        var x234  = (x23 + x34) / 2.0
        var y234  = (y23 + y34) / 2.0
        var x1234 = (x123 + x234) / 2.0
        var y1234 = (y123 + y234) / 2.0

        // Try to approximate the full cubic curve by a single straight line
        var dx = x4-x1
        var dy = y4-y1

        var d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx))
        var d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx))

        if ( Math.pow(d2+d3, 2) < 5.0 * tolerance2 * (dx*dx + dy*dy) ) {
            // added factor of 5.0 to match circle resolution
            subpath.push([x1234, y1234])
            return
        }

        // Continue subdivision
        this.addCubicBezier(subpath, x1, y1, x12, y12, x123, y123, x1234, y1234, level+1, tolerance2);
        this.addCubicBezier(subpath, x1234, y1234, x234, y234, x34, y34, x4, y4, level+1, tolerance2);
    },


    addQuadraticBezier : function(subpath, x1, y1, x2, y2, x3, y3, level, tolerance2) {
        if (level > 18) {
            // protect from deep recursion cases
            // max 2**18 = 262144 segments
            return
        }

        // Calculate all the mid-points of the line segments
        var x12   = (x1 + x2) / 2.0
        var y12   = (y1 + y2) / 2.0
        var x23   = (x2 + x3) / 2.0
        var y23   = (y2 + y3) / 2.0
        var x123  = (x12 + x23) / 2.0
        var y123  = (y12 + y23) / 2.0

        var dx = x3-x1
        var dy = y3-y1
        var d = Math.abs(((x2 - x3) * dy - (y2 - y3) * dx))

        if ( d*d <= 5.0 * tolerance2 * (dx*dx + dy*dy) ) {
            // added factor of 5.0 to match circle resolution
            subpath.push([x123, y123])
            return
        }

        // Continue subdivision
        this.addQuadraticBezier(subpath, x1, y1, x12, y12, x123, y123, level + 1, tolerance2)
        this.addQuadraticBezier(subpath, x123, y123, x23, y23, x3, y3, level + 1, tolerance2)
    },


    addArc : function(subpath, x1, y1, rx, ry, phi, large_arc, sweep, x2, y2, tolerance2) {
        // Implemented based on the SVG implementation notes
        // plus some recursive sugar for incrementally refining the
        // arc resolution until the requested tolerance is met.
        // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        var cp = Math.cos(phi);
        var sp = Math.sin(phi);
        var dx = 0.5 * (x1 - x2);
        var dy = 0.5 * (y1 - y2);
        var x_ = cp * dx + sp * dy;
        var y_ = -sp * dx + cp * dy;
        var r2 = (Math.pow(rx*ry,2)-Math.pow(rx*y_,2)-Math.pow(ry*x_,2)) /
        (Math.pow(rx*y_,2)+Math.pow(ry*x_,2));
        if (r2 < 0) { r2 = 0; }
        var r = Math.sqrt(r2);
        if (large_arc == sweep) { r = -r; }
        var cx_ = r*rx*y_ / ry;
        var cy_ = -r*ry*x_ / rx;
        var cx = cp*cx_ - sp*cy_ + 0.5*(x1 + x2);
        var cy = sp*cx_ + cp*cy_ + 0.5*(y1 + y2);

        function angle(u, v) {
            var a = Math.acos((u[0]*v[0] + u[1]*v[1]) /
            Math.sqrt((Math.pow(u[0],2) + Math.pow(u[1],2)) *
            (Math.pow(v[0],2) + Math.pow(v[1],2))));
            var sgn = -1;
            if (u[0]*v[1] > u[1]*v[0]) { sgn = 1; }
            return sgn * a;
        }

        var psi = angle([1,0], [(x_-cx_)/rx, (y_-cy_)/ry]);
        var delta = angle([(x_-cx_)/rx, (y_-cy_)/ry], [(-x_-cx_)/rx, (-y_-cy_)/ry]);
        if (sweep && delta < 0) { delta += Math.PI * 2; }
        if (!sweep && delta > 0) { delta -= Math.PI * 2; }

        function getVertex(pct) {
            var theta = psi + delta * pct;
            var ct = Math.cos(theta);
            var st = Math.sin(theta);
            return [cp*rx*ct-sp*ry*st+cx, sp*rx*ct+cp*ry*st+cy];
        }

        // let the recursive fun begin
        //
        function recursiveArc(parser, t1, t2, c1, c5, level, tolerance2) {
            if (level > 18) {
                // protect from deep recursion cases
                // max 2**18 = 262144 segments
                return
            }
            var tRange = t2-t1
            var tHalf = t1 + 0.5*tRange;
            var c2 = getVertex(t1 + 0.25*tRange);
            var c3 = getVertex(tHalf);
            var c4 = getVertex(t1 + 0.75*tRange);
            if (parser.vertexDistanceSquared(c2, parser.vertexMiddle(c1,c3)) > tolerance2) {
                recursiveArc(parser, t1, tHalf, c1, c3, level+1, tolerance2);
            }
            subpath.push(c3);
            if (parser.vertexDistanceSquared(c4, parser.vertexMiddle(c3,c5)) > tolerance2) {
                recursiveArc(parser, tHalf, t2, c3, c5, level+1, tolerance2);
            }
        }

        var t1Init = 0.0;
        var t2Init = 1.0;
        var c1Init = getVertex(t1Init);
        var c5Init = getVertex(t2Init);
        subpath.push(c1Init);
        recursiveArc(this, t1Init, t2Init, c1Init, c5Init, 0, tolerance2);
        subpath.push(c5Init);
    },


    // handle path data
    //////////////////////////////////////////////////////////////////////////





    parseUnit : function(val) {
        if (val == null) {
            return null
        } else {
            // assume 90dpi
            var multiplier = 1.0
            if (val.search(/cm$/i) != -1) {
                multiplier = 35.433070869
            } else if (val.search(/mm$/i) != -1) {
                multiplier = 3.5433070869
            } else if (val.search(/pt$/i) != -1) {
                multiplier = 1.25
            } else if (val.search(/pc$/i) != -1) {
                multiplier = 15.0
            } else if (val.search(/in$/i) != -1) {
                multiplier = 90.0
            }
            return multiplier * parseFloat(val.strip())
        }
    },


    matrixMult : function(mA, mB) {
        return [ mA[0]*mB[0] + mA[2]*mB[1],
        mA[1]*mB[0] + mA[3]*mB[1],
        mA[0]*mB[2] + mA[2]*mB[3],
        mA[1]*mB[2] + mA[3]*mB[3],
        mA[0]*mB[4] + mA[2]*mB[5] + mA[4],
        mA[1]*mB[4] + mA[3]*mB[5] + mA[5] ]
    },


    matrixApply : function(mat, vec) {
        return [ mat[0]*vec[0] + mat[2]*vec[1] + mat[4],
        mat[1]*vec[0] + mat[3]*vec[1] + mat[5] ] ;
    },

    matrixGetScale : function(mat) {
        // extract absolute scale from matrix
        var sx = Math.sqrt(mat[0]*mat[0] + mat[1]*mat[1]);
        var sy = Math.sqrt(mat[2]*mat[2] + mat[3]*mat[3]);
        // return dominant axis
        if (sx > sy) {
            return sx;
        } else {
            return sy;
        }
    },


    vertexDistanceSquared : function(v1, v2) {
        return Math.pow(v2[0]-v1[0], 2) + Math.pow(v2[1]-v1[1], 2);
    },

    vertexMiddle : function(v1, v2) {
        return [ (v2[0]+v1[0])/2.0, (v2[1]+v1[1])/2.0 ];
    }

}


if (typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

if(typeof module !== 'undefined' && module.exports){
    module.exports.SVGReader = SVGReader
}
