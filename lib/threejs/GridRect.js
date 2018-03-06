/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GridHelper = function ( sizeX, sizeY, step ) {

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	this.color1 = new THREE.Color( 0x444444 );
	this.color2 = new THREE.Color( 0x888888 );

	for ( var i = - (sizeX / 2); i <= (sizeX / 2); i += step ) {
		geometry.vertices.push(
			new THREE.Vector3( i, ((sizeY / 2) * -1), 0 ), new THREE.Vector3( i, (sizeY / 2), 0 )
		);
		var color = i === 0 ? this.color1 : this.color2;
		geometry.colors.push( color, color, color, color );
	}

	for ( var i = - (sizeY / 2); i <= (sizeY / 2); i += step ) {
		geometry.vertices.push(
			new THREE.Vector3( ((sizeX / 2) * -1), i, 0 ), new THREE.Vector3( (sizeX / 2 ), i, 0 )

		);
		var color = i === 0 ? this.color1 : this.color2;
		geometry.colors.push( color, color, color, color );
	}

	THREE.LineSegments.call( this, geometry, material );

};

THREE.GridHelper.prototype = Object.create( THREE.LineSegments.prototype );
THREE.GridHelper.prototype.constructor = THREE.GridHelper;

THREE.GridHelper.prototype.setColors = function( colorCenterLine, colorGrid ) {

	this.color1.set( colorCenterLine );
	this.color2.set( colorGrid );

	this.geometry.colorsNeedUpdate = true;

};
