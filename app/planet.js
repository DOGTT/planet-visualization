/**
 * @author tide_h
 * make a planet 
 */
var Planet = function(){
    'use strict';
    if(!Detector.webgl) Detector.addGetWebGLMessage();
    function LoLa(){this.lo=null;this.la=null;this.loF=null;this.laF=null,this.valid=false};
    var params_control = {
        cloudShow:false,
        lolaLinesShow:true,
        autoRotate:false,
    }
    var planetR = 1.0;
    var cameraPosR = 14;
    var sunLightPower = 25;
    var colorPlant = 0x6ec1ff;
    var PI = Math.PI;
    var planetCenter = new THREE.Vector3(0,0,0);
    var container,camera,scene,renderer;
    var renderTargets = new Object();
    var sceneForRT,cameraForRT;
    var orbit,stats,loadP;
    var planetMesh,planetMat,planetGeo,cloudMesh,cloudsMat;
    var universeCamera,universeScene;
    var universeMesh,universeMat,universeGeo;
    var loLaLineLod;
    var sunLight,sunR = 5;
    var i,j;
    var mouse = new THREE.Vector2();
    var raycaster,intersects,pointerMesh;
    
    var pointerLoLa = new LoLa();
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
        universeScene = new THREE.Scene();
        sceneForRT = new THREE.Scene();
        scene.fog = new THREE.Fog(colorPlant,cameraPosR-(planetR/2),cameraPosR);//0xf2f7ff
       
        //camera
        camera = new THREE.PerspectiveCamera(10,viewSize.x/viewSize.y,1,2000);
        camera.position.set(0,0,-cameraPosR);
        camera.lookAt(new THREE.Vector3(0,0,0));
        scene.add(camera);
        //cameraForRT.copy(camera);
        //sceneForRT.add(cameraForRT);

        universeCamera =  new THREE.PerspectiveCamera(90,viewSize.x/viewSize.y,1,2000);
    
        //light
        var ambient = new THREE.AmbientLight( 0xcccccc );
		scene.add( ambient );
        sunLight = new THREE.PointLight(0xffffff,1,sunR*10);
        sunLight.position.set(sunR,sunR,-sunR);
        sunLight.power = sunLightPower;
        scene.add( sunLight );

        //make a planet
        makePlanet();
        
        //raycaster
        makePointer();
        raycaster =  new THREE.Raycaster();
        //renderer
        renderer = new THREE.WebGLRenderer({
                    antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(viewSize.x,viewSize.y);
        renderer.setClearColor(0xf0f0f0);
        container.appendChild(renderer.domElement);
        //orbit control and stats
        orbit = new THREE.OrbitControls(camera,renderer.domElement);
        orbit.target.set( 0.0, 0.0, 0.0 );
        orbit.zoomSpeed = 0.5;
        orbit.rotateSpeed = 0.5;
        //orbit.enableDamping = true;
        orbit.minDistance = 2;
        orbit.maxDistance = 14;
        orbit.autoRotateSpeed = 1.0;
        orbit.autoRotate = true;
        stats = new Stats();
        container.appendChild(stats.dom);
        scene.add(drawAxes(2));
    }
    // function test(){

    //      var   group = new THREE.Group();
    //     scene.add( group );
    //     var cdsac = new THREE.SphereGeometry(0.01 );
	// 	var cdaca = new THREE.MeshBasicMaterial( {color:0xff0000} );
    //     var cs2 = new THREE.Mesh(cdsac,cdaca);
    //     cs2.position.copy(LoLaconvertToXYZ(new THREE.Vector2(117.5,22.35)));
    //     scene.add(cs2);
    //     var cs3 = new THREE.Mesh(cdsac,cdaca);
    //     scene.add(cs3);
    //     //planetMesh.visible = false;
    // }


    function next(){
        makeUniverse();
        makeLoLaLine();
        
    }
    function makePointer(){
        var geometry = new THREE.SphereGeometry( 0.01 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        pointerMesh = new THREE.Mesh(geometry,material);
        pointerMesh.visible = false;
        scene.add(pointerMesh);
    }
    function makeLoLaLine(){
        //Lo,LaN,distance
        var LolaN=[[0,0,10],[9,5,8],[18,9,6],[36,17,4],[72,33,2]];
        var circleN = 40;
        loLaLineLod = new THREE.LOD();
        for(var index = 0 ; index< LolaN.length ; index++){
            var lolaball = LoLaBall(planetCenter,planetR*1.001,LolaN[index][0],LolaN[index][1],circleN*(index+1));
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
            loLaLineLod.addLevel(lineMesh,LolaN[index][2]);
        }
        loLaLineLod.updateMatrix();
		loLaLineLod.matrixAutoUpdate = false;   
        scene.add(loLaLineLod);
    }
    function makePlanet(){
        planetGeo = new THREE.SphereGeometry(1,200,100);
        //planetMat = new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true});
        planetMat = new THREE.MeshPhongMaterial({
            color:colorPlant,
            shininess:50
        });
        planetMesh = new THREE.Mesh(planetGeo,planetMat);
        cloudsMat = new THREE.MeshLambertMaterial( {
					blending: THREE.NormalBlending,
					transparent: true,
					depthTest: false
		});
        cloudMesh = new THREE.Mesh(planetGeo,cloudsMat);
        scene.add(planetMesh);
        scene.add(cloudMesh);
    //     var geo = new THREE.SphereGeometry(1.1,100,50);
    //    var mat = new THREE.MeshBasicMaterial({color:0xcccccc,opacity:0.1,transparent :true});
    //     scene.add(new THREE.Mesh(geo,mat));
    }
    function loadPlanetText(){
        var loader = new THREE.TextureLoader();
        loader.setPath('textures/planet/');
        loader.load('006.jpg',function(tex){
            planetMat.map = tex;
            planetMat.color.set(0xffffff);
            planetMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
         loader.load('earth_specular_2048.jpg',function(tex){
            planetMat.specularMap = tex;
            planetMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
        loader.load('earth-bump-4k.jpg',function(tex){
            tex.anisotropy = 4;
            planetMat.bumpMap = tex;
            planetMat.bumpScale = 0.5;
            planetMat.needsUpdate = true;
        },loadP.onProgress,loadP.onError);
       // earth_clouds_2048
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
        var floader = new FileLoader();
        var name = ['hdr.vs','hdr.fs'];
        floader.loadShader(name).then(
            function(){
            loader.load( urls,function(tex){
            tex.format = THREE.RGBFormat;
            var lib = THREE.ShaderLib[ "cube" ];
            lib.uniforms[ "tCube" ].value = tex;
            universeMat.uniforms = lib.uniforms;
            universeMat.uniforms.exposure = {value:1.5};
            universeMat.uniforms.bright = {value:0.6};
            universeMat.depthWrite = false;
            universeMat.side = THREE.BackSide;
            universeMat.needsUpdate = true;
            universeMat.fragmentShader = floader.getfShader();
            universeMat.vertexShader = floader.getvShader();
            //console.log(universeMat.vertexShader,universeMat.fragmentShader);
            },loadP.onProgress,loadP.onError);}
        );     
    }
    var spangle_flag = false;
    function animate(){
        requestAnimationFrame(animate);
        controlPart();
        render();
        stats.update();
        orbit.update();
    }
    function render(){
        rotationForY(sunLight,0.002);
        universeCamera.rotation.copy( camera.rotation );
        renderer.render(universeScene,universeCamera);
        

        renderer.autoClear = false;
        raycasterRender();
        lodRender();
        fogContorl();
        spangleStar();
        ProssRT();
        
        renderer.render(scene,camera);
        //renderer.clearColor ();
    }
    function fogContorl(){
        var lengthCam = camera.position.length();
        if(lengthCam>10){
            scene.fog.far = lengthCam;
            scene.fog.near = lengthCam - (planetR/2);
        }else{
            scene.fog.near = 1;
            scene.fog.far = 1000;
        }

        //var lib = THREE.ShaderLib[ "phong" ];
        //console.log(lib);
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
    function ProssRT(){
        for(var rt in renderTargets){
            renderer.clearTarget(renderTargets[rt]);
            //camera.updateProjectionMatrix();
            
            renderer.render(sceneForRT,camera,renderTargets[rt],false);
        }
    }
    function spangleStar(){
        
        if(universeMat.uniforms.bright!=undefined){
            var brv = universeMat.uniforms.bright.value;
            if(brv >2.0) spangle_flag = true;
            if(brv <0.5) spangle_flag = false;
            if(spangle_flag)  brv-=0.01;
            else brv +=0.01;
            universeMat.uniforms.bright.value = brv;
        }
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
            pointerLoLa.valid = false;
            return ;
        }
        pointerLoLa.valid = true;
        var t = UVconvertTOLoLa(O);
        var tx = t.x;
        var ty = t.y;
        var N='北纬N',S='南纬S',W='西经W',E='东经E';
        if(tx<0) pointerLoLa.loF = W + Math.abs(tx);
        else pointerLoLa.loF = E + tx;
        if(ty<0) pointerLoLa.laF = S + Math.abs(ty);
        else pointerLoLa.laF = N + ty;
        pointerLoLa.lo = tx;
        pointerLoLa.la = ty;
    }
    function UVconvertTOLoLa(O){
        var t = new THREE.Vector2();
        t.x = (O.x * 360.0 - 180.0).toFixed(4);
        t.y = (O.y * 180.0 - 90.0).toFixed(4);
        return t;
    }
    function LoLaconvertTUV(lola){
        var t = new THREE.Vector2();
        t.x = ( lola.x +180.0) /360.0;
        t.y = ( lola.y +90.0) /180.0;
        return t;
    }
    function LoLaconvertToXYZ(uv){
        var u = uv.x/180.0;
        var v = uv.y/180.0;
        var r = planetR;
        var pos = new THREE.Vector3();
        pos.y = r*(Math.sin((v)*PI));
        var t_u;
        if(u<-0.5||u>0.5);
            t_u = 1.0 - Math.abs(u);
        
        var t = Math.tan((t_u)*PI);

        pos.x = Math.sqrt((1.0-pos.y*pos.y)/(t*t + 1.0));
        pos.z = Math.sqrt(1.0 - pos.x*pos.x - pos.y*pos.y);
        if(u<-0.5||u>0.5) pos.x = 0.0 - pos.x;
        if(u> 0.0) pos.z = 0.0 - pos.z;
        if(Math.abs(pos.x) <0.00001) pos.x = 0;
        return pos;
    }
    function XYZconvertToLoLa(position){
        var x= position.x;
        var y = position.y;
        var z = position.z;
        var r = planetR;
        var rt = new THREE.Vector2();
        rt.x = Math.abs(Math.atan(z/x)/PI);
        if(x < 0.0 ) rt.x = (1.0 - rt.x); 
        if(z > 0.0 ) rt.x = 0.0-rt.x;
        
        rt.y = Math.asin(y/r)/PI;      
        if(isNaN(rt.x)) rt.x = y;
        rt.x *= 180.0;
        rt.y *= 180.0;
        return rt;
    }
    function positionMesh(mesh,lo,la,height){
        var height = height!== undefined ? height:0;
        var pos = LoLaconvertToXYZ(new THREE.Vector2(lo,la));
        var sacl = 1.0 + height;
        mesh.position.set(pos.x*sacl,pos.y*sacl,pos.z*sacl);
        //mesh.lookAt(new THREE.Vector3(0,0,0));   
        mesh.lookAt(new THREE.Vector3(pos.x*10,pos.y*10,pos.z*10));
    }
    function rotationForY(mesh,ri){
        var x = mesh.position.x;
        var z = mesh.position.z;
        var Rm = Math.sqrt(x*x+z*z);
        var ang = Math.acos(z/Rm);
        if(x<0) ang =( PI*2 )- ang;
        var angTo =  (ang+ri)%( PI*2 );
        mesh.position.x = Rm*Math.sin(angTo);
        mesh.position.z = Rm*Math.cos(angTo);
        mesh.rotation.y=angTo;
    }
    function controlPart(){
        //lanetMesh.visible = false;
        cloudMesh.visible = params_control.cloudShow;
        loLaLineLod.visible = params_control.lolaLinesShow;
        orbit.autoRotate = params_control.autoRotate;
    }
    function makeMapLines(arrs,R){
        if(arrs === undefined||arrs.length <1) return 0;
        if(arrs[0].length>0)if(arrs[0][0] instanceof Array) arrs = arrs[0];
        var vec = new Array();
        var t;
        for(var i=0;i<arrs.length;i++){
            t = LoLaconvertToXYZ(new THREE.Vector2(arrs[i][0],arrs[i][1]));
            if(R !== undefined){
                for(var v in t) t[v] *= R;
            }
            vec.push(t);
        }
        return vec;
    }
    function makeMapMesh(data){
        var R = planetR*1.1;
        if(data.type!="FeatureCollection") return ;
        var features = data.features;
        var mapG = new THREE.Group();
        var colorSet = 0xcccccc;
        for(var i =0;i<features.length;i++){
            var io = 0,unit;
            var coo = features[i].geometry;
            if(coo.type == "MultiPolygon"){     
                unit= new THREE.Group();
                for(var j = 0;j<coo.coordinates.length ; j++){
                    var geometry = new THREE.Geometry();
                    var material = new THREE.LineBasicMaterial({color:colorSet});
                    var temp =  makeMapLines(coo.coordinates[j]);
                    geometry.vertices = temp;
                    unit.add(new THREE.Line(geometry,material));
                }
            }
            if(coo.type == "Polygon"){
                var geometry = new THREE.Geometry();
                var material = new THREE.LineBasicMaterial({color:colorSet});
                var temp =  makeMapLines(coo.coordinates);
                geometry.vertices = temp;
                unit = new THREE.Line(geometry,material);
            }
            mapG.add(unit);
        }
        console.log(mapG);
        return mapG;

    }
    return {
        /**
         * @param 
         * lo and la is from the left-down corner
         */
        addMesh:function(mesh,name,lo,la,height,flagRT){    
            var lo = lo!==undefined?lo:0,
                la = la!==undefined?la:0,
                flagRT = flagRT!==undefined?flagRT:false;
            positionMesh(mesh,lo,la,height);
            mesh.name = name;
            if(flagRT)
               sceneForRT.add(mesh);
            else
                scene.add(mesh);
        },
        addRenderTarget:function(rt,name){
            renderTargets[name] = rt;
        },
        romoveMesh:function(name){   
            scene.remove(scene.getObjectByName(name));
            sceneForRT.remove(sceneForRT.getObjectByName(name));
        },
        removeRenderTarget:function(name){
            for(var rt in renderTargets){
                if(rt === name ){
                    renderer.clearTarget(renderTargets[rt]);
                    delete renderTargets[rt];
                }
                
            }
        },
        /**
         * add GeoJSON data to planet surface
         */
        addMap:function(data,mapname){
            var meshMap  = makeMapMesh(data);
            meshMap.name = mapname;
            scene.add(meshMap);
        },
        params:params_control,
        setMouse:function(v){
           mouse = v; 
        },
        pointerLoLa:pointerLoLa,
        container:container
    }
};
