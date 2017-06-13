/**
 * @author tide_h
 * make a planet 
 */
var Planet = function(){
    'use strict';
    if(!Detector.webgl) Detector.addGetWebGLMessage();
    var params_control = {
        cloudShow:false,
        lolaLinesShow:true,
        autoRotate:true,
    }
    var planetCenter = new THREE.Vector3(0,0,0);
    var container,camera,scene,renderer;
    var orbit,stats,loadP;
    var planetMesh,planetMat,planetGeo,cloudMesh,cloudsMat;
    var universeCamera,universeScene;
    var universeMesh,universeMat,universeGeo;
    var loLaLineLod;
    var sunLight,sunR = 500;
    var i,j;
    var mouse = new THREE.Vector2();
    var raycaster,intersects,pointerMesh;
    function LonLat(){this.lon=null;this.lat=null;this.lonF=null;this.latF=null,this.valid=false};
    var pointerLonLat = new LonLat();
    var viewSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
    var windowHalfX = viewSize.x/2;
    var windowHalfY = viewSize.y/2;
    init();
    next();
    animate();
    
    function init(){    
        container = document.createElement('div');
        document.body.appendChild(container);
        //LoadProgress
        loadP = new LoadProgress();
        container.appendChild(loadP.dom);
        loadPlanetText();
        loadUniverseText();
        //scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xff0000,0,2000);
        universeScene = new THREE.Scene();
        //camera
        camera = new THREE.PerspectiveCamera(10,viewSize.x/viewSize.y,1,2000);
        camera.position.set(0,0,14);
        camera.lookAt(new THREE.Vector3(0,0,0));
        scene.add(camera);
        universeCamera =  new THREE.PerspectiveCamera(90,viewSize.x/viewSize.y,1,2000);
    
        //light
        var ambient = new THREE.AmbientLight( 0xcccccc );
		scene.add( ambient );
        sunLight = new THREE.PointLight(0xffffff,1,sunR*3);
        sunLight.position.set(sunR,0,0);
        scene.add( sunLight );
        //make a planet
        makePlanet();
        
        //raycaster
        makePointer();
        raycaster =  new THREE.Raycaster();
        //renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(viewSize.x,viewSize.y);
        renderer.setClearColor(0xf0f0f0);
        container.appendChild(renderer.domElement);
        //orbit control and stats
        orbit = new THREE.OrbitControls(camera,renderer.domElement);
        orbit.target.set( 0.0, 0.0, 0.0 );
        orbit.zoomSpeed = 0.5;
        orbit.rotateSpeed = 0.3;
        orbit.minDistance = 2;
        orbit.maxDistance = 14;
        orbit.autoRotateSpeed = 1.0;
        orbit.autoRotate = true;
        stats = new Stats();
        container.appendChild(stats.dom);
    }
    function next(){
        makeUniverse();
        makeLoLaLine();
        
    }
    function makePointer(){
        var geometry = new THREE.SphereGeometry( 0.02 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        pointerMesh = new THREE.Mesh(geometry,material);
        pointerMesh.visible = false;
        scene.add(pointerMesh);
    }
    function makeLoLaLine(){
        //lonN,LatN,distance
        var loNlaN=[[0,0,10],[9,5,8],[18,9,6],[36,17,4],[72,33,2]];
        var circleN = 40;
        loLaLineLod = new THREE.LOD();
        for(var index = 0 ; index< loNlaN.length ; index++){
            var lolaball = lonlatBall(planetCenter,1.001,loNlaN[index][0],loNlaN[index][1],circleN*(index+1));
            var lolaline = lolaball.geo;
            // var spline = new THREE.Spine(ti);
            var pointN = lolaball.pointN*3;
            var positions = new Float32Array(pointN);
            var lineGeo = new THREE.BufferGeometry();
            var lineMat = new THREE.LineBasicMaterial({color:0xcccccc});
            lineGeo.addAttribute('position',new THREE.BufferAttribute(
                        positions,3
                    ));
            var k =0;
            for(var id = 0;id < lolaline.length ;id++){
                var ti = lolaline[id];
                for(i = 0 ;i<ti.length;i++){
                    positions[k++]=(ti[i].x);
                    positions[k++]=(ti[i].y);
                    positions[k++]=(ti[i].z);
                }
            }    
            var lineMesh = new THREE.Line(lineGeo,lineMat);
            lineMesh.updateMatrix();
            loLaLineLod.addLevel(lineMesh,loNlaN[index][2]);
        }
        loLaLineLod.updateMatrix();
		loLaLineLod.matrixAutoUpdate = false;   
        scene.add(loLaLineLod);
    }
    function makePlanet(){
        planetGeo = new THREE.SphereGeometry(1,100,50);
        //planetMat = new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true});
        planetMat = new THREE.MeshPhongMaterial({
            color:0xffffff,
            shininess:10
        });
        planetMesh = new THREE.Mesh(planetGeo,planetMat);
        cloudsMat = new THREE.MeshLambertMaterial( {
					color: 0xffffff,
					blending: THREE.NormalBlending,
					transparent: true,
					depthTest: false
		});
        cloudMesh = new THREE.Mesh(planetGeo,cloudsMat);
        scene.add(planetMesh);
        scene.add(cloudMesh);
    }
    function loadPlanetText(){
        var loader = new THREE.TextureLoader();
        loader.setPath('textures/planet/');
        loader.load('006.jpg',function(tex){
            planetMat.map = tex;
            planetMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
        loader.load('earth-bump-4k.jpg',function(tex){
            tex.anisotropy = 4;
            planetMat.bumpMap = tex;
            planetMat.bumpScale = 0.5;
            planetMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
        //earth_clouds_2048
        loader.load('earth_clouds_2048.png',function(tex){
            cloudsMat.map = tex;
            cloudsMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
    }
    function makeUniverse(){
        universeGeo = new THREE.BoxGeometry(10,10,10);
        universeMat = new THREE.ShaderMaterial();
        universeMesh = new THREE.Mesh(universeGeo,universeMat);
        universeScene.add(universeMesh);
        
    }
    function loadUniverseText(){
        var loader = new THREE.CubeTextureLoader();
        loader.setPath( "textures/universe/");
        var urls = [
        "px.jpg","nx.jpg",
        "py.jpg","ny.jpg",
        "pz.jpg","nz.jpg"
        ];
        loader.load( urls,function(tex){
            //tex.mapping = THREE.CubeRefractionMapping;
            tex.format = THREE.RGBFormat;
            var lib = THREE.ShaderLib[ "cube" ];
            lib.uniforms[ "tCube" ].value = tex;
            universeMat.fragmentShader = lib.fragmentShader;
            universeMat.vertexShader = lib.vertexShader;
            universeMat.uniforms = lib.uniforms;
            universeMat.depthWrite = false;
            universeMat.side = THREE.BackSide;
            universeMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
    }
    function animate(){
        requestAnimationFrame(animate);
        controlPart();
        render();
        stats.update();
        orbit.update();
    }
    function render(){
        rotationForY(sunLight,0.001);
        universeCamera.rotation.copy( camera.rotation );
        renderer.render(universeScene,universeCamera);
        renderer.autoClear = false;
        raycasterRender();
        lodRender();
        renderer.render(scene,camera);
        //renderer.clearColor ();
    }
    function lodRender(){
        scene.traverse(
            function(obj){
                if(obj instanceof THREE.LOD){
                    obj.update(camera);    
                }
            }
        );
    }
    function raycasterRender(){
         //raycaster
        raycaster.setFromCamera(mouse,camera);
        intersects = raycaster.intersectObject(planetMesh);
        if(intersects.length>0){
            pointerMesh.visible = true;
            pointerMesh.position.copy(intersects[0].point);
            pointerInfoUpdate(intersects[0].uv);
        }else{
            pointerMesh.visible = false;
            pointerInfoUpdate(null);
        }
    }
    function pointerInfoUpdate(O){
        if(O===null){
            pointerLonLat.valid = false;
            return ;
        }
        pointerLonLat.valid = true;
        var t = convertTOLonLat(O);
        var tx = (t.x- 180.0).toFixed(4);
        var ty = (t.y- 90.0).toFixed(4);
        var N='北纬N',S='南纬S',W='西经W',E='东经E';
        if(tx<0) pointerLonLat.lonF = W + Math.abs(tx);
        else pointerLonLat.lonF = E + tx;
        if(ty<0) pointerLonLat.latF = S + Math.abs(ty);
        else pointerLonLat.latF = N + ty;
        pointerLonLat.lon = tx;
        pointerLonLat.lat = ty;
    }
    function convertTOLonLat(O){
        var t = new THREE.Vector2();
        t.x = (O.x * 360).toFixed(4);
        t.y = (O.y * 180).toFixed(4);

        return t;
    }
    function rotationForY(mesh,ri){
        var x = mesh.position.x;
        var z = mesh.position.z;
        var Rm = Math.sqrt(x*x+z*z);
        var ang = Math.acos(z/Rm);
        if(x<0) ang =( Math.PI*2 )- ang;
        var angTo =  (ang+ri)%( Math.PI*2 );
        mesh.position.x = Rm*Math.sin(angTo);
        mesh.position.z = Rm*Math.cos(angTo);
        mesh.rotation.y=angTo;
    }
    function controlPart(){
        cloudMesh.visible = params_control.cloudShow;
        loLaLineLod.visible = params_control.lolaLinesShow;
        orbit.autoRotate = params_control.autoRotate;
    }
    return {
        params:params_control,
        setMouse:function(v){
           mouse = v; 
        },
        pointerLonLat:pointerLonLat,
        container:container
    }
};
