# potrace

A TypeScript port of [Potrace](http://potrace.sourceforge.net).<br>
This is based on [kilobtye/potrace](https://github.com/kilobtye/potrace).

[ONLINE DEMO](https://oov.github.io/potrace/)

## USAGE

### Example 1: Open URL and write SVG

```javascript
var img = new Image(), scale = 1;
img.crossOrigin = 'anonymous';
img.src = 'https://www.gravatar.com/avatar/ea4d591101f572e45312cf75901032b4?s=256';
img.onload = function() {
   var div = document.createElement('div');
   // Hint: You can also use a canvas as an image.
   div.innerHTML = potrace.fromImage(img).toSVG(scale);
   document.body.appendChild(div);
}
```

### Example 2: Open custom data and stroke to the Canvas

```javascript
function getPixel(x, y) {
   return x % 50 > 25 != y % 50 < 25;
}

var canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 200;

var ctx = canvas.getContext('2d');
ctx.beginPath();
potrace.fromFunction(getPixel, canvas.width, canvas.height).strokePath(ctx);
ctx.fill(); // or ctx.stroke();
document.body.appendChild(canvas);
```

### Example 3: Open URL and get Paths

```javascript
var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://www.gravatar.com/avatar/ea4d591101f572e45312cf75901032b4?s=256';
img.onload = function() {
   var o = potrace.fromImage(img).simplify();

   var canvas = document.createElement('canvas');
   canvas.width = o.width;
   canvas.height = o.height;

   var ctx = canvas.getContext('2d');
   ctx.beginPath();
   for (var i = 0; i < o.paths.length; ++i) {
        var p = o.paths[i];
        switch (p.length) {
            case 2:
                ctx.moveTo(p[0], p[1]);
                break;
            case 4:
                ctx.lineTo(p[0], p[1]);
                ctx.lineTo(p[2], p[3]);
                break;
            case 6:
                ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                break;
        }
   }
   ctx.closePath();
   ctx.fill();
   document.body.appendChild(canvas);
}
```

## LICENSE

GPLv2

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
