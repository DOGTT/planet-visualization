/**
 * @author tide_h 
 * Contorl part
 */
var Contorl = function(){
    'use strict';
    var planet = new Planet();
    var mouse = new THREE.Vector2();
    init();
    function init(){

        var latlon = document.createElement('div');
        latlon.style.cssText = 'position:fixed;bottom:2.5%;right:1%;opacity:0.9;z-index:10000';
        planet.container.appendChild(latlon);

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        function onDocumentMouseMove( event ) {
            event.preventDefault();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            planet.setMouse(mouse);
            var lalo = planet.pointerLonLat;
            if(lalo.valid)
            latlon.innerHTML='['+lalo.lonF+','+lalo.latF+']';
            else
            latlon.innerHTML= '';
            //console.log(mouse);
        }
        // var params = {
        //     cloudShow:true,
        //     lolaLinesShow:true,
        //     autoRotate:true,
        // }
        var gui = new dat.GUI();
        var textureGui = gui.addFolder( 'texture' );
        textureGui.add( planet.params, 'lolaLinesShow' );
        textureGui.add( planet.params, 'cloudShow' );
        var contorlGui = gui.addFolder( 'control' );
        contorlGui.add( planet.params, 'autoRotate' );
        //planet.setParams(params);
        gui.open();
    }
    
    console.log(planet);
};
Contorl();
