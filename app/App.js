/**
 * @author tide_h 
 * Contorl part
 * need update
 */
var App = (function() {
    'use strict';
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;bottom:0px;left:0px;width:500px;height:300px;';
    document.body.appendChild(container);
    var planet = new Planet({
        cloudShow: false,
        textShow: false
    });
    var mouse = new THREE.Vector2();
    var paramC = {
        RayMarching: false
    };
    var objName = {
        rayMarch: 'raymarching'
    };
    init();

    function init() {

        var latlon = document.createElement('div');
        latlon.style.cssText = 'position:fixed;bottom:2.5%;right:1%;opacity:0.9;z-index:10000';
        container.appendChild(latlon);

        document.addEventListener('mousemove', onDocumentMouseMove, false);

        function onDocumentMouseMove(event) {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            planet.setMouse(mouse);
            var lalo = planet.pointerLoLa;
            if (lalo.valid)
                latlon.innerHTML = '[' + lalo.loF + ',' + lalo.laF + ']' + '[' + lalo.lo + ',' + lalo.la + ']';
            else
                latlon.innerHTML = '';
            //console.log(mouse);
        }
        //地图加载
        mapLoad();
        var gui = new dat.GUI();
        var textureGui = gui.addFolder('texture');
        textureGui.add(planet.config, 'lolaLinesShow');
        textureGui.add(planet.config, 'cloudShow');
        var contorlGui = gui.addFolder('control');
        contorlGui.add(planet.config, 'autoRotate');

        contorlGui.add(paramC, 'RayMarching').onChange(paramOnChange);
        //planet.setParams(params);
        gui.open();
        for (let i = 0; i < 50; i++) {
            let s1 = Math.random() - 0.5;
            let s2 = Math.random() - 0.5;
            let e1 = Math.random() - 0.5;
            let e2 = Math.random() - 0.5;
            planet.addSingleLine(new PlanetLoLa(s1 * 360, s2 * 180), new PlanetLoLa(113.59, 22.35), 0xffffff);
        }
        for (let i = 0; i < 50; i++) {
            let s1 = Math.random() - 0.5;
            let s2 = Math.random() - 0.5;
            let e1 = Math.random() - 0.5;
            let e2 = Math.random() - 0.5;
            planet.addSingleLine(new PlanetLoLa(s1 * 360, s2 * 180), new PlanetLoLa(-100, -50), 0xffff00);
        }

        // planet.addSingleLine(new planet.LoLa(30, 10), new planet.LoLa(100, -10), 0xffff00);
        var cdsac = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        var cdaca = new THREE.MeshBasicMaterial({ wireframe: false });
        var lons = -100,
            lats = 0;
        for (var i = 0; i < 50; i++) {
            for (var j = 0; j < 50; j++) {
                var cs = new THREE.Mesh(cdsac, cdaca);
                planet.addMesh(cs, 'test', new PlanetLoLa(lons + j * 0.8, lats + i * 0.8), 0.2);
            }
        }
        planet.setTextMesh("HI,lt's a test");
        planet.ShowSpark();
    }

    function mapLoad() {
        var filename = "china-provinces.json"; //world-50m
        // $.getJSON('maps/' + filename, function(topodata) {
        //     var o = topodata.objects;
        //     var temp = topojson.feature(topodata, o.CHN_adm1);
        //     var t = new Date();
        //     console.log("c1" + t);
        //     planet.addMap(temp, "ChinaMap");
        //     t = new Date();
        //     console.log("c1" + t);
        // });
        filename = "world-countries.json"; //world-50m
        $.getJSON('maps/' + filename, function(topodata) {
            var o = topodata.objects;
            var temp = topojson.feature(topodata, o.countries1);
            var t = new Date();
            console.log("c2" + t);
            planet.addMap(temp, "worldMap");
            t = new Date();
            console.log("c2" + t);
        });
    }

    function paramOnChange() {
        if (paramC.RayMarching)
            rayMarchPross();
        else {
            planet.romoveMesh(objName.rayMarch)
            planet.removeRenderTarget(objName.rayMarch);
        }
    }

    function rayMarchPross() {
        var filename = "data.json";
        $.getJSON('data/' + filename, function(data) {
            var rayMarch = new RayMarching(data);
            var mesh = rayMarch.mesh;
            var meshRT = rayMarch.meshRT;
            mesh.scale.set(0.4, 0.4, 0.4);
            meshRT.scale.set(0.4, 0.4, 0.4);
            planet.addMesh(mesh, objName.rayMarch, new PlanetLoLa(117.5, 22.35), 0.3);
            planet.addMeshToRT(meshRT, objName.rayMarch, new PlanetLoLa(117.5, 22.35), 0.3);
            planet.addRenderTarget(rayMarch.rtObj, objName.rayMarch);
        });
    }

    //console.log(planet);
}());