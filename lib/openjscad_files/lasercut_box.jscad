// title: Lasercut box
// author: Benny Malengier
// license: MIT License

var lasercut_frame = true; // if true, dxf, if false, stl of box
var on_plate = true;       // if stl, as a 3D box, or on a on_plate
var side_to_show = 0;      // if 0, all sides, otherwise 1-6 as side nr
var openlid = false; // "Create an box with no lid, so open at top")
var width = 100;   //  "Width of the box in mm. Default 100mm")
var height = 100;  //  "Heigth of the box in mm. Default 100mm")
var depth = 50;    //   "Depth of the box in mm. Default 50mm")

var mitersize = 10;//   "Size of miter in mm. Default 10mm")

var thick     = 3.0;//  "Thickness of material in mm. Default 3.0")
var kerf      = 0.16;  //"Kerf of laserbeam (width of the cut) in mm."
                       //" See http://blog.ponoko.com/2008/09/11/how-much-material-does-the-laser-burn-away/. "
                       //"Default 0.16mm")
var recthole1 = false; //', help="Add rectangular hole rw,rh in side 1")
var recthole2 = false; //"Add rectangular hole rw,rh in side 2")
var recthole3 = false; //"Add rectangular hole rw,rh in side 3")
var recthole4 = false; //"Add rectangular hole rw,rh in side 4")
var recthole5 = false; //"Add rectangular hole rw,rh in side 5")
var recthole6 = false; //"Add rectangular hole rw,rh in side 6")
var rh2h = [40, 4, 4, 4, 4, 4];
var rh2w = [40, 4, 4, 4, 4, 4];

var nrmiterh = 0;
var nrmiterw = 0;
var nrmited = 0;
var eps = 0.2;
var colr = 0.4;
var colg = 0.4;
var colb = 0.4;
var cola = 0.6;


function getParameterDefinitions()
{
  return [
    {name: 'width', type: 'float', initial: 100, caption: "Width of box in mm:", captionEN: "Width of box in mm:"},
    {name: 'height', type: 'float', initial: 100, caption: "Height of box in mm:", captionEN: "Height of box in mm:"},
    {name: 'depth', type: 'float', initial: 50, caption: "Depth of box in mm:", captionEN: "Depth in mm:"},
    {name: 'mitersize', type: 'int', initial: 10, caption: "Tab witdth in mm:", captionEN: "Miter (tab) size in mm:"},
    {name: 'thick', type: 'float', initial: 3, caption: "Material Thickness:", captionEN: "Thickness of the material:"},
    {name: 'kerf', type: 'float', initial: 0.16, caption: "Laser beam kerf in mm:", captionEN: "Width of laser beam cut in mm:"},

    //{
    //  name: 'type',
    //  type: 'choice',
    //  values: ["ASSEMBLED", "LASER", "3D"],
    //  captions: ["Assembled", "Lasercut (DXF output)", "3D print (STL output)"],
    //  captionsEN: ["Assembled", "Lasercut plate (DXF output)", "3D print plate (STL output)"],
    //  caption: 'Layout:',     // optional
    //  initial: "LASER"  // optional, default selected value, first item if omitted
    //},
    {
      name: 'openlid',
      type: 'choice',
      values: ["CLOSED", "OPEN"],
      captions: ["Closed", "Open Lid"],
      captionsEN: ["Closed", "Open Lid"],
      caption: 'Lid:',
      captionEN: 'Lid:',
      initial: "DRAFT"
    },
    {
      name: 'side',
      type: 'choice',
      values: ["ALL", "BOTTOM", "TOP", "LEFT", "RIGHT", "FRONT", "BACK"],
      captions: ["All Sides", "Bottom", "Top", "Left", "Right", "Front", "Back"],
      captionsEN: ["All Sides", "Bottom", "Top", "Left", "Right", "Front", "Back"],
      caption: 'Display:',
      captionEN: 'Show:',
      initial: "ALL"
    },
    {name: 'hw1', type: 'float', initial: 0, caption: "Cutout bottom width:", captionEN: "Cutout bottom width:"},
    {name: 'hh1', type: 'float', initial: 0, caption: "Cutout bottom height:", captionEN: "Cutout bottom height:"},
    {name: 'hw4', type: 'float', initial: 0, caption: "Cutout top width:", captionEN: "Cutout top width:"},
    {name: 'hh4', type: 'float', initial: 0, caption: "Cutout top height:", captionEN: "Cutout top height:"},
    {name: 'hw2', type: 'float', initial: 0, caption: "Cutout left width:", captionEN: "Cutout left width:"},
    {name: 'hh2', type: 'float', initial: 0, caption: "Cutout left height:", captionEN: "Cutout left height:"},
    {name: 'hw3', type: 'float', initial: 0, caption: "Cutout front width:", captionEN: "Cutout front width:"},
    {name: 'hh3', type: 'float', initial: 0, caption: "Cutout front height:", captionEN: "Cutout front height:"},

  ];
}




function main(params)
{
    // investigate params
    if (params.side == "ALL") side_to_show = 0;
    if (params.side == "BOTTOM") side_to_show = 1;
    if (params.side == "TOP") side_to_show = 4;
    if (params.side == "LEFT") side_to_show = 2;
    if (params.side == "RIGHT") side_to_show = 5;
    if (params.side == "FRONT") side_to_show = 3;
    if (params.side == "BACK") side_to_show = 6;

    if (params.hw1 != 0 && params.hh1 != 0) {
        recthole1 = true;
        rh2w[0] = params.hw1;
        rh2h[0] = params.hh1;
    }
    if (params.hw2 != 0 && params.hh2 != 0) {
        recthole2 = true;
        rh2w[1] = params.hw2;
        rh2h[1] = params.hh2;
    }
    if (params.hw3 != 0 && params.hh3 != 0) {
        recthole3 = true;
        rh2w[2] = params.hw3;
        rh2h[2] = params.hh3;
    }
    if (params.hw4 != 0 && params.hh4 != 0) {
        recthole4 = true;
        rh2w[3] = params.hw4;
        rh2h[3] = params.hh4;
    }

    width = params.width;
    height = params.height;
    depth = params.depth;
    mitersize = params.mitersize;
    thick = params.thick;
    kerf = params.kerf;

    //if (params.type == "ASSEMBLED") {
    //    lasercut_frame = false;
    //    on_plate = false;
    //} else if (params.type == "LASER") {
    //    lasercut_frame = true;
    //    on_plate = true;
    //} else { //3D
    //    lasercut_frame = false;
    //    on_plate = true;
    //}
    // Replaced Params with Hard coded - Laserweb needs 2D always
    lasercut_frame = true;
    on_plate = true;

    if (params.openlid == "CLOSED") openlid = false;
    if (params.openlid == "OPEN") openlid = true;

    // start construction
    var sidenr = 0;
    var startx = 5+width/2 - 100;
    var starty = 5+height/2 - 100;
    if (! on_plate) {
        startx = 0;
        starty = 0;
    }
    var holepoints;
    checkinput();
    var polypoints = squareframe(startx, starty, width, height, nrmiterw, nrmiterh,
                       thick, false, false, 0);
    //OpenJsCad.log(polypoints);
    var shape1 = new CSG.Polygon2D( polypoints ).extrude({offset: [0, 0, thick]}).setColor(colr, colg, colb, cola);
    //var shape1 = CAG.fromPoints( polypoints );
    if (recthole1) {
        holepoints = squarehole(startx, starty, width, height, rh2h[sidenr], rh2w[sidenr]);
        OpenJsCad.log(holepoints);
        var hole1 = new CSG.Polygon2D( holepoints );
        hole1 = hole1.extrude({offset: [0,0,thick+eps]}).translate([0,0,-eps/2]);
        shape1 = shape1.subtract(hole1);
    }

    sidenr += 1;
    if (openlid)  openlid = 2; //left side
    startx = 5+width+5+depth/2 - 100;
    starty = 5+height/2 - 100;
    if (! on_plate) {
        startx = 0;
        starty = 0;
    }
    polypoints = squareframe(startx, starty, depth, height, nrmiterd, nrmiterh,
                        thick, true, false, openlid);
    var shape2 = new CSG.Polygon2D( polypoints ).extrude({offset: [0, 0, thick]}).setColor(colr, colg, colb, cola);
    if (recthole2) {
        holepoints = squarehole(startx, starty, depth, height, rh2h[sidenr], rh2w[sidenr]);
        var hole2 = new CSG.Polygon2D( holepoints );
        hole2 = hole2.extrude({offset: [0,0,thick+eps]}).translate([0,0,-eps/2]);
        shape2 = shape2.subtract(hole2);
    }
    if (! on_plate) {
        shape2 = shape2.mirroredX().rotateY(90).translate([-width/2 - thick -1, 0, depth/2]);
    }

    sidenr += 1;
    if (openlid)  openlid = 3; //front side
    startx = 5+width/2 - 100;
    starty = 5+height+5+depth/2 - 100;
    if (! on_plate) {
        startx = 0;
        starty = 0;
    }
    polypoints = squareframe(startx, starty, width, depth, nrmiterw, nrmiterd,
                       thick, true, true, openlid);
    var shape3 = new CSG.Polygon2D( polypoints ).extrude({offset: [0, 0, thick]}).setColor(colr,colg, colb, cola);
    if (recthole3) {
        holepoints = squarehole(startx, starty, width, depth, rh2h[sidenr], rh2w[sidenr]);
        var hole3 = new CSG.Polygon2D( holepoints );
        hole3 = hole3.extrude({offset: [0,0,thick+eps]}).translate([0,0,-eps/2]);
        shape3 = shape3.subtract(hole3);
    }
    if (! on_plate) {
        shape3 = shape3.rotateX(90).translate([0,-height/2-1,depth/2]);
    }

    sidenr += 1;
    if (!openlid) {    // the top lid
        startx = 5+width+5+depth+5+depth+5+width/2 - 100;
        starty = 5+height/2 - 100;
        if (! on_plate) {
            startx = 0;
            starty = 0;
        }
        polypoints = squareframe(startx, starty, width, height, nrmiterw, nrmiterh,
                        thick, false, false, openlid);
        var shape4 = new CSG.Polygon2D( polypoints ).extrude({offset: [0, 0, thick]}).setColor(colr,colg, colb, cola);
        if (recthole4) {
            holepoints = squarehole(startx, starty, width, height, rh2h[sidenr], rh2w[sidenr]);
            var hole4 = new CSG.Polygon2D( holepoints );
            hole4 = hole4.extrude({offset: [0,0,thick+eps]}).translate([0,0,-eps/2]);
            shape4 = shape4.subtract(hole4);
        }
        if (! on_plate) {
            shape4 = shape4.translate([0,0,depth+thick+1]);
        }
    }

    sidenr += 1;
    if (openlid)  openlid = 4; //
    startx = 5+width+5+depth+5+depth/2 - 100;
    starty = 5+height/2 - 100;
    if (! on_plate) {
        startx = 0;
        starty = 0;
    }
    polypoints = squareframe(startx, starty, depth, height, nrmiterd, nrmiterh,
                       thick, true, false, openlid);
    var shape5 = new CSG.Polygon2D( polypoints ).extrude({offset: [0, 0, thick]}).setColor(colr,colg, colb, cola);
    if (recthole5) {
        holepoints = squarehole(startx, starty, depth, height, rh2h[sidenr], rh2w[sidenr]);
        var hole5 = new CSG.Polygon2D( holepoints );
        hole5 = hole5.extrude({offset: [0,0,thick+eps]}).translate([0,0,-eps/2]);
        shape5 = shape5.subtract(hole5);
    }
    if (! on_plate) {
        shape5 = shape5.rotateY(90).translate([+width/2, 0, depth/2]);
    }

    sidenr += 1;
    if (openlid)  openlid = 1; //
    startx = 5+width+5+width/2 - 100;
    starty = 5+height+5+depth/2 - 100;
    if (! on_plate) {
        startx = 0;
        starty = 0;
    }
    polypoints = squareframe(startx, starty, width, depth, nrmiterw, nrmiterd,
                       thick, true, true, openlid);
    var shape6 = new CSG.Polygon2D( polypoints ).extrude({offset: [0, 0, thick]}).setColor(colr,colg, colb, cola);
    if (recthole6) {
        holepoints = squarehole(startx, starty, width, depth, rh2h[sidenr], rh2w[sidenr]);
        var hole6 = new CSG.Polygon2D( holepoints );
        hole6 = hole6.extrude({offset: [0,0,thick+eps]}).translate([0,0,-eps/2]);
        shape6 = shape6.subtract(hole6);
    }
    if (! on_plate) {
        shape6 = shape6.mirroredY().rotateX(90).translate([0,+height/2+thick+1,depth/2]);
    }

    if (lasercut_frame) {
        //2D projection
        var z0basis = CSG.OrthoNormalBasis.Z0Plane();
        var shape1_2d = shape1.projectToOrthoNormalBasis(z0basis);
        var minx = shape1_2d.getBounds()[0].x;
        var miny = shape1_2d.getBounds()[0].y;
        shape1_2d = shape1_2d.translate([(minx * -1),(miny * -1),0]);
        var shape2_2d = shape2.projectToOrthoNormalBasis(z0basis);
        shape2_2d = shape2_2d.translate([(minx * -1),(miny * -1),0]);
        var shape3_2d = shape3.projectToOrthoNormalBasis(z0basis);
        shape3_2d = shape3_2d.translate([(minx * -1),(miny * -1),0]);
        if (!openlid)
            var shape4_2d = shape4.projectToOrthoNormalBasis(z0basis),
            shape4_2d = shape4_2d.translate([(minx * -1),(miny * -1),0]);
        var shape5_2d = shape5.projectToOrthoNormalBasis(z0basis);
        shape5_2d = shape5_2d.translate([(minx * -1),(miny * -1),0]);
        var shape6_2d = shape6.projectToOrthoNormalBasis(z0basis);
        shape6_2d = shape6_2d.translate([(minx * -1),(miny * -1),0]);
        if (side_to_show == 0 && !openlid) {
            return new CAG().union( [shape1_2d, shape2_2d, shape3_2d, shape4_2d, shape5_2d, shape6_2d]);
        } else if (side_to_show == 0 && openlid) {
            return new CAG().union([shape1_2d, shape2_2d, shape3_2d, shape5_2d, shape6_2d]);
        } else if (side_to_show == 1) {
            return new CAG().union([shape1_2d]);
        } else if (side_to_show == 2) {
            return new CAG().union([shape2_2d]);
        } else if (side_to_show == 3) {
            return new CAG().union([shape3_2d]);
        } else if (side_to_show == 4 && !openlid) {
            return new CAG().union([shape4_2d]);
        } else if (side_to_show == 4 && openlid) {
            throw new Error("ERROR: side 4 does not exist, no lid requested!");
            return [];
        } else if (side_to_show == 5) {
            return new CAG().union([shape5_2d]);
        } else if (side_to_show == 6) {
            return new CAG().union([shape6_2d]);
        } else return [];
    } else {

        if (side_to_show == 0 && !openlid) {
            return [shape1, shape2, shape3, shape4, shape5, shape6];
        } else if (side_to_show == 0 && openlid) {
            return [shape1, shape2, shape3, shape5, shape6];
        } else if (side_to_show == 1) {
            return [shape1];
        } else if (side_to_show == 2) {
            return [shape2];
        } else if (side_to_show == 3) {
            return [shape3];
        } else if (side_to_show == 4 && !openlid) {
            return [shape4];
        } else if (side_to_show == 4 && openlid) {
            throw new Error("ERROR: side 4 does not exist, no lid requested!");
            return [];
        } else if (side_to_show == 5) {
            return [shape5];
        } else if (side_to_show == 6) {
            return [shape6];
        } else return [];
    }
}

function float2int (value) {
    return ~~value;
}

function checkinput()
{
    nrmiterw = float2int(width / mitersize );
    if (nrmiterw % 2 === 0) { nrmiterw += 1; }
    if (width/nrmiterw < 2*thick) {
        nrmiterw -= 2;
    }
    nrmiterh = float2int(height / mitersize );
    if (nrmiterh % 2 === 0) { nrmiterh += 1;}
    if (height/nrmiterh < 2*thick) {
        nrmiterh -= 2;
    }
    nrmiterd = float2int(depth / mitersize );
    if (nrmiterd % 2 === 0) { nrmiterd += 1;}
    if (depth/nrmiterd < 2*thick) {
        nrmiterd -= 2;
    }
    if (nrmiterw < 1 || nrmiterh < 1 || nrmiterd < 1) {
        throw new Error("ERROR: reduce mitersize, corners will break off otherwise!");
    }

    OpenJsCad.log("Check OK");
}


//one of 4 sides of a box sde
function side(w,h,corner_sizex,corner_sizey,thick,cut_width, div_x, div_y,
         invertX, invertY, xm, ym, openlid)
{
    var outpx = [];
    var outpy = [];
    if (openlid) {
        miter = 0;
    } else {
        miter = 1;
    }
    var dx = corner_sizex*xm;
    var dy = corner_sizey*ym;
    if (invertX) {dx-=thick*xm;}
    if (invertY) {dy-=thick*ym;}
    half_cut = cut_width/2 * (xm+ym);
    if (invertY && xm) {
        half_cut = -half_cut;
    }
    if (invertX && ym) {
        half_cut = -half_cut;
    }
    d = xm-ym;
    if (invertY && xm) d = -d;
    if (invertX && ym) d = -d;
    outpx.push(dx+half_cut*Math.abs(xm));  // += PathMove(dx+half_cut*Math.abs(xm),dy+half_cut*Math.abs(ym))
    outpy.push(dy+half_cut*Math.abs(ym));
    if (miter != 0 ) {
        dy = thick *d *Math.abs(xm) *miter;
        dx = thick *d *Math.abs(ym) *miter;
        outpx.push(dx);  // += PathMove(dx,dy)
        outpy.push(dy);
    }
    d = -d;
    half_cut = -half_cut;

    //All but the center one
    ax = (w-2*corner_sizex) / (2*div_x+1);
    ay = (h-2*corner_sizey) / (2*div_y+1);
    //the center one
    bx = w-2*corner_sizex-ax*(2*div_x);
    by = h-2*corner_sizey-ay*(2*div_y);

    for (i = 0; i < Math.abs(div_x*xm+div_y*ym); i++) {
        dx = ax*xm;
        dy = ay*ym;
        outpx.push(dx+half_cut*Math.abs(xm));  // PathMove(dx+half_cut*Math.abs(xm),dy+half_cut*Math.abs(ym))
        outpy.push(dy+half_cut*Math.abs(ym));
        if (miter != 0 ) {
            dy = thick *d*Math.abs(xm) *miter;
            dx = thick *d*Math.abs(ym) *miter;
            outpx.push(dx);  //PolyPoint(dx,dy)
            outpy.push(dy);
        }
        d = -d;
        half_cut = -half_cut;
    }

    dx = bx*xm;
    dy = by*ym;
    outpx.push(dx+half_cut*Math.abs(xm));  // PathMove(dx+half_cut*Math.abs(xm), dy+half_cut*Math.abs(ym))
    outpy.push(dy+half_cut*Math.abs(ym));
    if (miter != 0 ) {
        dy = thick *d*Math.abs(xm) *miter;
        dx = thick *d*Math.abs(ym) *miter;
        outpx.push(dx);  //PolyPoint(dx,dy)
        outpy.push(dy);
    }
    d = -d;
    half_cut = -half_cut;

    for (i = 0; i < Math.abs(div_x*xm+div_y*ym); i++) {
        dx = ax*xm;
        dy = ay*ym;
        outpx.push(dx+half_cut*Math.abs(xm));  //PolyPoint(dx+half_cut*Math.abs(xm), dy+half_cut*Math.abs(ym)
        outpy.push(dy+half_cut*Math.abs(ym));
        if (miter != 0 ) {
            dy = thick *d*Math.abs(xm) *miter;
            dx = thick *d*Math.abs(ym) *miter;
            outpx.push(dx);  //PathMove(dx,dy)
            outpy.push(dy);
            OpenJsCad.log([dx,dy]);
        }
        d = -d;
        half_cut = -half_cut;
    }

    dx = corner_sizex*xm;
    dy = corner_sizey*ym;
    if (invertX && xm) dx -= thick * xm;
    if (invertY && ym) dy -= thick * ym;

    OpenJsCad.log([dx,dy]);
    outpx.push(dx);  //PathMove(dx,dy)
    outpy.push(dy);
    return [outpx, outpy];
}


// x,y: origin of start in mm
// w,h: width and height in mm
// nrmiterw/h: number of miter intervals along w and h
// thick: thickness of material
// invert: invert in x or y direction the logic
function squareframe(x, y, w, h, nrmiterw, nrmiterh, thick, invertX, invertY, openlid)
{
    var i;
    var div_x = float2int((nrmiterw-3) / 2.);
    var div_y = float2int((nrmiterh-3) / 2.);
    var corner_sizex = w/nrmiterw;
    var corner_sizey = h/nrmiterh;
    //convert to 1/10th mm
    //x = 10*x; y=10*y; w=10*w; h=10*h;thick=10*thick;
    //corner_sizex = corner_sizex*10;corner_sizey = corner_sizey*10;
    //cut_width = kerf*10;
    cut_width = kerf;
    x = x-w/2;
    if (invertX) x+=thick;
    y = y-h/2;
    if (invertY) y+=thick;
    //start point
    var xstart = x;
    var ystart = y;
    var nrpoly = 0;
    var polypt = [new CSG.Vector2D( xstart, ystart)];
    //top side
    var sidetop = side(w,h,corner_sizex,corner_sizey,thick,cut_width,
                     div_x,div_y, invertX, invertY, 1, 0, openlid===1);
    //Right Side
    var sideright= side(w,h,corner_sizex,corner_sizey,thick,cut_width,
                     div_x,div_y, invertX, invertY, 0, 1, openlid===2);
    // bottom Side
    var sidebottom = side(w,h,corner_sizex,corner_sizey,thick,cut_width,
                     div_x,div_y, invertX, invertY, -1, 0, openlid===3);
    // Left side
    var sideleft = side(w,h,corner_sizex,corner_sizey,thick,cut_width,
                     div_x,div_y, invertX, invertY, 0, -1, openlid===4);
    // add all in a polygon
    OpenJsCad.log(["top", sidetop[0]]);
    OpenJsCad.log(["top", sidetop[1]]);
    for (i=0; i< sidetop[0].length; i++ ) {
        polypt[nrpoly+1] = new CSG.Vector2D( sidetop[0][i] + polypt[nrpoly].x , sidetop[1][i] + polypt[nrpoly].y );
        nrpoly += 1;
    }
    for (i=0; i<sideright[0].length; i++ ) {
        polypt[nrpoly+1] = new CSG.Vector2D( sideright[0][i] + polypt[nrpoly].x , sideright[1][i] + polypt[nrpoly].y );
        nrpoly += 1;
    }
    for (i=0; i<sidebottom[0].length; i++ ) {
        polypt[nrpoly+1] = new CSG.Vector2D( sidebottom[0][i]+polypt[nrpoly].x ,
                     sidebottom[1][i]+polypt[nrpoly].y  );
        nrpoly += 1;
    }
    for (i=0; i<sideleft[0].length-1; i++ ) {
        polypt[nrpoly+1] = new CSG.Vector2D( sideleft[0][i]+polypt[nrpoly].x ,
                     sideleft[1][i]+polypt[nrpoly].y  );
        nrpoly += 1;
    }
    return polypt ;
}


function squarehole(x, y, w, h, w_hole, h_hole)
{
    x = x-w_hole/2;
    y = y-h_hole/2;
    var nrpoly = 0;
    var polypt = [new CSG.Vector2D( x, y)];
    nrpoly += 1;
    polypt[nrpoly] = new CSG.Vector2D(polypt[nrpoly-1].x + w_hole, polypt[nrpoly-1].y);
    OpenJsCad.log(polypt);
    nrpoly += 1;
    polypt[nrpoly] = new CSG.Vector2D(polypt[nrpoly-1].x, polypt[nrpoly-1].y + h_hole);
    nrpoly += 1;
    polypt[nrpoly] = new CSG.Vector2D(polypt[nrpoly-1].x - w_hole, polypt[nrpoly-1].y);
    return polypt;
}
