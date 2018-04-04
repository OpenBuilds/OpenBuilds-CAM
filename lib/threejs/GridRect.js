/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GridHelper = function ( sizeX, sizeY, step, colorval ) {

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	this.color = new THREE.Color( colorval );


	for ( var i = - (sizeX / 2); i <= (sizeX / 2); i += step ) {
		geometry.vertices.push(
			new THREE.Vector3( i, ((sizeY / 2) * -1), 0 ), new THREE.Vector3( i, (sizeY / 2), 0 )
		);
		geometry.colors.push( this.color, this.color, this.color, this.color );
	}

	for ( var i = - (sizeY / 2); i <= (sizeY / 2); i += step ) {
		geometry.vertices.push(
			new THREE.Vector3( ((sizeX / 2) * -1), i, 0 ), new THREE.Vector3( (sizeX / 2 ), i, 0 )

		);
		geometry.colors.push( this.color, this.color, this.color, this.color );
	}

	THREE.LineSegments.call( this, geometry, material );

};

THREE.GridHelper.prototype = Object.create( THREE.LineSegments.prototype );
THREE.GridHelper.prototype.constructor = THREE.GridHelper;

THREE.GridHelper.prototype.setColors = function( colorCenterLine, colorGrid ) {

this.geometry.colorsNeedUpdate = true;

};
