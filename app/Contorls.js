/**
 * @author tide_h 
 * Contorl part
 */
var Contorl = function(){
    'use strict';
    var planet = new Planet();
    var mouse = new THREE.Vector2();
    var paramC = {
            RayMarching:false
    };
    var objName = {
        rayMarch:'raymarching'
    }
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
            var lalo = planet.pointerLoLa;
            if(lalo.valid)
            latlon.innerHTML='['+lalo.loF+','+lalo.laF+']'+'['+lalo.lo+','+lalo.la+']';
            else
            latlon.innerHTML= '';
            //console.log(mouse);
        }
        //地图加载
        mapLoad();
        var gui = new dat.GUI();
        var textureGui = gui.addFolder( 'texture' );
        textureGui.add( planet.params, 'lolaLinesShow' );
        textureGui.add( planet.params, 'cloudShow' );
        var contorlGui = gui.addFolder( 'control' );
        contorlGui.add( planet.params, 'autoRotate' );
        
        gui.add( paramC, 'RayMarching' ).onChange(paramOnChange);
        //planet.setParams(params);
        gui.open();
        // var cdsac = new THREE.BoxGeometry(0.01,0.01,0.01 );
		// var cdaca = new THREE.MeshBasicMaterial( {wireframe:true} );
        // var lons = 100,lats = 0;
        // for(var i = 0;i<50;i++){
        //     for(var j = 0;j<40;j++){
        //     var cs = new THREE.Mesh(cdsac,cdaca);
        //         planet.addMesh(cs,'test',lons + j*0.8,lats + i*0.8,0.2);
        //     }
        // }
         
    }
    function mapLoad(){
        var filename = "china-provinces.json";//world-50m
        $.getJSON('maps/'+filename,function(topodata){
            var o = topodata.objects;
            var temp = topojson.feature(topodata,o.CHN_adm1); 
            console.log(temp);
            planet.addMap(temp,"ChinaMap");
        });
        filename = "world-countries.json";//world-50m
        $.getJSON('maps/'+filename,function(topodata){
            var o = topodata.objects;
            var temp = topojson.feature(topodata,o.countries1); 
            console.log(temp);
            planet.addMap(temp,"worldMap");
        });
    }
    function paramOnChange(){
        if(paramC.RayMarching)
            rayMarchPross();
        else{
            planet.romoveMesh(objName.rayMarch)
            planet.removeRenderTarget(objName.rayMarch);
        }
    }
    function rayMarchPross(){
        var filename = "data.json";
        $.getJSON('data/'+filename,function(data){
            var rayMarch = new  RayMarching(data);
            var mesh = rayMarch.mesh;
            var meshRT = rayMarch.meshRT;
            mesh.scale.set(0.4,0.4,0.4);
            meshRT.scale.set(0.4,0.4,0.4);
            //mesh.rotation.y = Math.PI;
            planet.addMesh(mesh,objName.rayMarch,117.5,22.35,0.3);
            planet.addMesh(meshRT,objName.rayMarch,117.5,22.35,0.3,true);
            planet.addRenderTarget(rayMarch.rtObj,objName.rayMarch);      
        }); 
    }

    //console.log(planet);
};
Contorl();
