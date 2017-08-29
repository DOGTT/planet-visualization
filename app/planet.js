/**
 * @author tide_h
 * make a planet 
 * @configP 
 * @domElement
 */

var Planet = function(configP, domElement) {
    'use strict';
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    var _this = this;
    this.domElement = (domElement !== undefined) ? domElement : document.body;
    var LoLa = function(lo, la) {
        this.lo = lo;
        this.la = la;
        //the description of lalo
        this.loF = null;
        this.laF = null;
        this.valid = false;
    };
    this.config = {
        cloudShow: false,
        textShow: false,
        nameShow: false,
        lolaLinesShow: true,
        autoRotate: false,
        renderQuality: 0,
        //--basic
        planetR: 1.0,
        cameraPosR: 14,
        sunLightPower: 4,
        colorPlant: 0x6ec1ff,
        sunR: 5,
        //--basic
        //planet_texture
        planet_texture_path: 'textures/planet/',
        planet_texture_basic_file: '006.jpg',
        planet_texture_specular_file: 'earth_specular_2048.jpg',
        planet_texture_bump_file: 'earth-bump-4k.jpg',
        planet_texture_clouds_file: 'earth_clouds_2048.png',
        //universe
        universe_texture_path: 'textures/universe/',
        universe_texture_basic_file: [
            "px.jpg", "nx.jpg",
            "py.jpg", "ny.jpg",
            "pz.jpg", "nz.jpg"
        ],
        universe_texture_shader_path: 'app/shader_lib/',
        universe_texture_shader_file: ['hdr.vs', 'hdr.fs'],

        DirectionText: {
            N: '北纬N',
            S: '南纬S',
            W: '西经W',
            E: '东经E'
        }

    };
    if (configP !== undefined) {
        for (var item in configP) {
            _this.config[item] = configP[item];
        }
    }
    // methods


    var DefaultMeshName = "nameless";
    var sunLight;
    var PI = Math.PI;
    var planetCenter = new THREE.Vector3(0, 0, 0);
    var container, camera, renderer;
    this.scene = null;
    //renderTargets

    var cameraForRT;
    this.sceneForRT = null;
    this.renderTargets = {};
    var viewControler, stats, loadP;
    //planet texture
    var planetMesh, planetMat, planetGeo, cloudMesh, cloudsMat;
    //universe scene and texture
    var universeCamera, universeScene;
    var universeMesh, universeMat, universeGeo;
    //the Latitude and longitude Lod 
    var loLaLineLod;

    var i, j;
    var mouse = new THREE.Vector2();
    var raycaster, intersects, pointerMesh;
    var pointerLoLa = new LoLa();
    this.viewSize = new THREE.Vector2(0, 0);
    this.handleResize = function() {

        if (this.domElement === document.body) {

            this.viewSize.x = window.innerWidth;
            this.viewSize.y = window.innerHeight;

        } else {

            var box = this.domElement.getBoundingClientRect();
            this.viewSize.x = box.width;
            this.viewSize.y = box.height;

        }

    };
    _this.handleResize();

    init();
    makeAmbient();
    animate();

    //Group
    var linesGroup, MeshsGroup;

    //init function
    function init() {
        container = document.createElement('div');
        _this.domElement.appendChild(container);
        //LoadProgress
        loadP = new LoadProgress();
        container.appendChild(loadP.dom);
        loadPlanetText();
        loadUniverseText();
        //scene
        _this.scene = new THREE.Scene();
        universeScene = new THREE.Scene();
        _this.sceneForRT = new THREE.Scene();
        //scene.fog = new THREE.Fog(config.colorPlant,config.cameraPosR-(config.planetR/2),config.cameraPosR);//0xf2f7ff

        //camera
        camera = new THREE.PerspectiveCamera(10, _this.viewSize.x / _this.viewSize.y, 1, 2000);
        camera.position.set(0, 0, -_this.config.cameraPosR);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        _this.scene.add(camera);
        //cameraForRT.copy(camera);
        //sceneForRT.add(cameraForRT);

        universeCamera = new THREE.PerspectiveCamera(90, _this.viewSize.x / _this.viewSize.y, 1, 2000);

        //light
        var ambient = new THREE.AmbientLight(0xcccccc);
        _this.scene.add(ambient);
        sunLight = new THREE.DirectionalLight(0xffffff, _this.config.sunLightPower);
        sunLight.position.set(_this.config.sunR, _this.config.sunR, 0 - _this.config.sunR);
        _this.scene.add(sunLight);

        //make a planet
        makePlanet();

        //raycaster
        makePointer();
        raycaster = new THREE.Raycaster();
        //renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(_this.viewSize.x, _this.viewSize.y);
        renderer.setClearColor(0xf0f0f0);
        container.appendChild(renderer.domElement);
        //viewControler control and stats
        viewControler = new PlanetViewControler(camera, renderer.domElement);
        viewControler.target.set(0.0, 0.0, 0.0);
        viewControler.zoomSpeed = 0.05;
        viewControler.rotateSpeed = 4.0;
        //viewControler.enableDamping = true;
        viewControler.minDistance = 4;
        viewControler.maxDistance = 14;
        viewControler.autoRotateSpeed = 0.5;
        viewControler.autoRotate = true;
        stats = new Stats();
        container.appendChild(stats.dom);
        _this.scene.add(drawAxes(2));

        linesGroup = new THREE.Group();
        MeshsGroup = new THREE.Group();
        _this.scene.add(MeshsGroup);
        _this.scene.add(linesGroup);

        function keydown(event) {
            if (event.keyCode === 82) {
                viewControler.reset();
            }
        }
        window.addEventListener('keydown', keydown, false);
        //test
        //test();
    }

    function test() {
        var p1 = new THREE.Vector3(0, 0, 0);
        var p2 = new THREE.Vector3(-0.5, Math.sqrt(0.75), 0.5);
        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });
        var geometry = new THREE.Geometry();
        geometry.vertices = PointToPoint(p1, p2);
        //console.log(PointToPoint(p1,p2));
        //var line = new THREE.Line( geometry, material );
        // scene.add(line);
        //planetMesh.visible = false;
        //  var   group = new THREE.Group();
        // scene.add( group );
        // var cdsac = new THREE.SphereGeometry(0.01 );
        // var cdaca = new THREE.MeshBasicMaterial( {color:0xff0000} );
        // var cs2 = new THREE.Mesh(cdsac,cdaca);
        // cs2.position.copy(LoLaconvertToXYZ(new THREE.Vector2(117.5,22.35)));
        // scene.add(cs2);
        // var cs3 = new THREE.Mesh(cdsac,cdaca);
        // scene.add(cs3);
        // //planetMesh.visible = false;





    }

    function addLine(p1, p2, color, dynamic) {
        var p1 = LoLaconvertToXYZ(p1);
        var p2 = LoLaconvertToXYZ(p2);
        var high = 0.4,
            pointMount = 40;
        var linePoints = PointToPoint(p1, p2, high, pointMount);

        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(pointMount * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(
            positions, 3
        ));
        for (let i = 0; i < pointMount; i++) {
            positions[i * 3] = linePoints[i].x;
            positions[i * 3 + 1] = linePoints[i].y;
            positions[i * 3 + 2] = linePoints[i].z;
        }
        if (dynamic) {

        }
        var material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 2
        });

        //console.log(linesGroup);
        var line = new THREE.Line(geometry, material);
        line.dynamic = dynamic;
        linesGroup.add(line);
    }

    function makeAmbient() {
        makeUniverse();
        makeLoLaLine();

    }

    function makePointer() {
        var geometry = new THREE.SphereGeometry(0.01);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        pointerMesh = new THREE.Mesh(geometry, material);
        pointerMesh.visible = false;
        _this.scene.add(pointerMesh);
    }

    function makeLoLaLine() {
        //Lo,LaN,distance
        var R = _this.config.planetR * 1.001;
        var LolaN = [
            [0, 0, 10],
            [9, 5, 8],
            [18, 9, 6],
            [36, 17, 4],
            [72, 33, 2]
        ];
        var circleN = 40;
        loLaLineLod = new THREE.LOD();
        for (var index = 0; index < LolaN.length; index++) {
            var lolaball = LoLaBall(planetCenter, R, LolaN[index][0], LolaN[index][1], circleN * (index + 1));
            var lolaline = lolaball.geo;
            // var spline = new THREE.Spine(ti);
            var pointN = lolaball.pointN * 3;
            var positions = new Float32Array(pointN);
            var lineGeo = new THREE.BufferGeometry();
            var lineMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
            lineGeo.addAttribute('position', new THREE.BufferAttribute(
                positions, 3
            ));
            var k = 0;
            for (var id = 0; id < lolaline.length; id++) {
                var ti = lolaline[id];
                for (i = 0; i < ti.length; i++) {
                    positions[k++] = (ti[i].x);
                    positions[k++] = (ti[i].y);
                    positions[k++] = (ti[i].z);
                }
            }
            var lineMesh = new THREE.Line(lineGeo, lineMat);
            lineMesh.updateMatrix();
            loLaLineLod.addLevel(lineMesh, LolaN[index][2]);
        }
        loLaLineLod.updateMatrix();
        loLaLineLod.matrixAutoUpdate = false;
        _this.scene.add(loLaLineLod);
    }

    function makePlanet() {
        planetGeo = new THREE.SphereGeometry(1, 200, 100);
        planetMat = new THREE.MeshPhongMaterial({
            color: _this.config.colorPlant,
            shininess: 20
        });
        planetMesh = new THREE.Mesh(planetGeo, planetMat);
        cloudsMat = new THREE.MeshLambertMaterial({
            blending: THREE.NormalBlending,
            transparent: true,
            depthTest: false
        });
        cloudMesh = new THREE.Mesh(planetGeo, cloudsMat);
        _this.scene.add(planetMesh);
        _this.scene.add(cloudMesh);
        var atmoShader = {
            side: THREE.BackSide,
            // blending: THREE.AdditiveBlending,
            transparent: true,
            lights: true,
            uniforms: THREE.UniformsUtils.merge([

                THREE.UniformsLib["common"],
                THREE.UniformsLib["lights"]

            ]),
            vertexShader: [
                "varying vec3 vViewPosition;",
                "varying vec3 vNormal;",
                "void main() {",
                THREE.ShaderChunk["beginnormal_vertex"],
                THREE.ShaderChunk["defaultnormal_vertex"],

                "	vNormal = normalize( transformedNormal );",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vViewPosition = -mvPosition.xyz;",
                "gl_Position = projectionMatrix * mvPosition;",
                "}"

            ].join("\n"),

            fragmentShader: [

                THREE.ShaderChunk["common"],
                THREE.ShaderChunk["bsdfs"],
                THREE.ShaderChunk["lights_pars"],
                THREE.ShaderChunk["lights_phong_pars_fragment"],

                "void main() {",
                "vec3 normal = normalize( -vNormal );",
                "vec3 viewPosition = normalize( vViewPosition );",
                "#if NUM_DIR_LIGHTS > 0",

                "vec3 dirDiffuse = vec3( 0.0 );",

                "for( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {",

                "vec4 lDirection = viewMatrix * vec4( directionalLights[i].direction, 0.0 );",
                "vec3 dirVector = normalize( lDirection.xyz );",
                "float dotProduct = dot( viewPosition, dirVector );",
                "dotProduct = 1.0 * max( dotProduct, 0.0 ) + (1.0 - max( -dot( normal, dirVector ), 0.0 ));",
                "dotProduct *= dotProduct;",
                "dirDiffuse += max( 0.5 * dotProduct, 0.0 ) * directionalLights[i].color;",
                "}",
                "#endif",

                //Fade out atmosphere at edge
                "float viewDot = abs(dot( normal, viewPosition ));",
                "viewDot = clamp( pow( viewDot + 0.6, 10.0 ), 0.0, 1.0);",

                "vec3 color = vec3( 0.05, 0.08, 0.15 ) * dirDiffuse;",
                //"vec3 color = vec3( 0.75, 0.69, 0.83 ) ;",
                "gl_FragColor = vec4( color, viewDot );",

                "}"

            ].join("\n")
        };
        var planetAtmoMat = new THREE.ShaderMaterial(atmoShader);
        var planetAtmoMesh = new THREE.Mesh(planetGeo, planetAtmoMat);
        planetAtmoMesh.scale.set(1.1, 1.1, 1.1);
        _this.scene.add(planetAtmoMesh);
        ///
        //     var geo = new THREE.SphereGeometry(1.1,100,50);
        //    var mat = new THREE.MeshBasicMaterial({color:0xcccccc,opacity:0.1,transparent :true});
        //     scene.add(new THREE.Mesh(geo,mat));
    }

    function loadPlanetText() {
        var loader = new THREE.TextureLoader();
        loader.setPath(_this.config.planet_texture_path);
        loader.load(_this.config.planet_texture_basic_file, function(tex) {
            planetMat.map = tex;
            planetMat.color.set(0xffffff);
            planetMat.needsUpdate = true;
        }, loadP.onProgress, loadP.onError);
        loader.load(_this.config.planet_texture_specular_file, function(tex) {
            planetMat.specularMap = tex;
            planetMat.needsUpdate = true;
        }, loadP.onProgress, loadP.onError);
        loader.load(_this.config.planet_texture_bump_file, function(tex) {
            tex.anisotropy = 4;
            planetMat.bumpMap = tex;
            planetMat.bumpScale = 0.5;
            planetMat.needsUpdate = true;
        }, loadP.onProgress, loadP.onError);
        //earth_clouds_2048
        loader.load(_this.config.planet_texture_clouds_file, function(tex) {
            cloudsMat.map = tex;
            cloudsMat.needsUpdate = true;
            console.log("yes");
        }, loadP.onProgress, loadP.onError);
    }

    function makeUniverse() {
        universeGeo = new THREE.BoxGeometry(10, 10, 10);
        universeMat = new THREE.ShaderMaterial();
        universeMesh = new THREE.Mesh(universeGeo, universeMat);
        universeScene.add(universeMesh);

    }

    function loadUniverseText() {
        var loader = new THREE.CubeTextureLoader();
        loader.setPath(_this.config.universe_texture_path);
        var urls = _this.config.universe_texture_basic_file;
        var floader = new FileLoader();
        floader.setPath(_this.config.universe_texture_shader_path);
        var shader_name = _this.config.universe_texture_shader_file;
        floader.loadShader(shader_name).then(
            function() {
                loader.load(urls, function(tex) {
                    tex.format = THREE.RGBFormat;
                    var lib = THREE.ShaderLib["cube"];
                    lib.uniforms["tCube"].value = tex;
                    universeMat.uniforms = lib.uniforms;
                    universeMat.uniforms.exposure = { value: 1.5 };
                    universeMat.uniforms.bright = { value: 0.6 };
                    universeMat.depthWrite = false;
                    universeMat.side = THREE.BackSide;
                    universeMat.needsUpdate = true;
                    universeMat.fragmentShader = floader.getfShader();
                    universeMat.vertexShader = floader.getvShader();
                    //console.log(universeMat.vertexShader,universeMat.fragmentShader);
                }, loadP.onProgress, loadP.onError);
            }
        );
    }
    var spangle_flag = false;

    function animate() {
        requestAnimationFrame(animate);
        controlPart();
        render();
        stats.update();
        viewControler.update();
    }

    function render() {
        rotationForY(sunLight, 0.002);
        universeCamera.rotation.copy(camera.rotation);
        renderer.render(universeScene, universeCamera);

        renderTimeControl();
        //
        renderer.autoClear = false;
        raycaster_render();
        lod_render();
        //fog_contorl();
        spangleStar_contorl();
        ProssRT_render();
        lines_render();
        renderer.render(_this.scene, camera);
        //renderer.clearColor ();
    }

    function renderTimeControl() {
        var t = (new Date()).getTime();
        if (_this.scene.timeNow !== undefined) {
            _this.scene.timeDifference = t - _this.scene.timeNow;
        } else {
            _this.scene.timeNow = t;
            _this.scene.timeDifference = 0;
        }
    }

    function lines_render() {
        var show_range = 0.5;
        var moveSpeed = 0.5; //one second move 0.1
        linesGroup.traverse(
            function(line) {
                if (line instanceof THREE.Line) {
                    if (line.dynamic) {
                        var n = line.geometry.attributes.position.count;
                        var add = Math.floor((_this.scene.timeDifference * moveSpeed * n) / 1000);
                        //console.log(add); 
                        var drawRange = line.geometry.drawRange.start;
                        var max_range = Math.floor(show_range * n);
                        drawRange = add % (n + max_range);
                        line.geometry.setDrawRange(drawRange - max_range, drawRange);
                    }
                }
            }
        )
    }

    function fog_contorl() {
        var lengthCam = camera.position.length();
        if (lengthCam > 12) {
            _this.scene.fog.far = lengthCam;
            _this.scene.fog.near = lengthCam - (_this.config.planetR / 2);
        } else {
            _this.scene.fog.near = 1;
            _this.scene.fog.far = 1000;
        }

        //var lib = THREE.ShaderLib[ "phong" ];
        //console.log(lib);
    }

    function lod_render() {
        _this.scene.traverse(
            function(obj) {
                if (obj instanceof THREE.LOD) {
                    obj.update(camera);
                }
            }
        );
    }

    function ProssRT_render() {
        for (var rt in _this.renderTargets) {
            renderer.clearTarget(_this.renderTargets[rt]);
            //camera.updateProjectionMatrix();

            renderer.render(_this.sceneForRT, camera, _this.renderTargets[rt], false);
        }
    }

    function spangleStar_contorl() {

        if (universeMat.uniforms.bright != undefined) {
            var brv = universeMat.uniforms.bright.value;
            if (brv > 2.0) spangle_flag = true;
            if (brv < 0.5) spangle_flag = false;
            if (spangle_flag) brv -= 0.01;
            else brv += 0.01;
            universeMat.uniforms.bright.value = brv;
        }
    }

    function raycaster_render() {
        //raycaster
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObject(planetMesh);
        var lengthCam = camera.position.length();
        var scaleL = 1.0 || (lengthCam / _this.config.cameraPosR);
        if (intersects.length > 0) {
            pointerMesh.visible = true;
            pointerMesh.position.copy(intersects[0].point);

            pointerMesh.scale.set(scaleL, scaleL, scaleL);
            pointerInfoUpdate(intersects[0].uv);
        } else {
            pointerMesh.visible = false;
            pointerInfoUpdate(null);
        }
    }

    function pointerInfoUpdate(O) {
        if (O === null) {
            pointerLoLa.valid = false;
            return;
        }
        pointerLoLa.valid = true;
        var t = UVconvertTOLoLa(O);
        var tx = t.lo;
        var ty = t.la;
        var N = _this.config.DirectionText.N || 'N',
            S = _this.config.DirectionText.S || 'S',
            W = _this.config.DirectionText.W || 'W',
            E = _this.config.DirectionText.E || 'E';
        if (tx < 0) pointerLoLa.loF = W + Math.abs(tx);
        else pointerLoLa.loF = E + tx;
        if (ty < 0) pointerLoLa.laF = S + Math.abs(ty);
        else pointerLoLa.laF = N + ty;
        pointerLoLa.lo = tx;
        pointerLoLa.la = ty;
    }

    function UVconvertTOLoLa(O) {
        var t = new LoLa();
        t.lo = (O.x * 360.0 - 180.0).toFixed(4);
        t.la = (O.y * 180.0 - 90.0).toFixed(4);
        return t;
    }

    function LoLaconvertTUV(lola) {
        var t = new THREE.Vector2();
        t.x = (lola.lo + 180.0) / 360.0;
        t.y = (lola.la + 90.0) / 180.0;
        return t;
    }

    function LoLaconvertToXYZ(lola) {
        var lo = lola.lo / 180.0;
        var la = lola.la / 180.0;
        var r = _this.config.planetR;
        var pos = new THREE.Vector3();
        pos.y = r * (Math.sin((la) * PI));
        var t_lo;
        if (lo < -0.5 || lo > 0.5);
        t_lo = 1.0 - Math.abs(lo);

        var t = Math.tan((t_lo) * PI);

        pos.x = Math.sqrt((1.0 - pos.y * pos.y) / (t * t + 1.0));
        pos.z = Math.sqrt(1.0 - pos.x * pos.x - pos.y * pos.y);
        if (lo < -0.5 || lo > 0.5) pos.x = 0.0 - pos.x;
        if (lo > 0.0) pos.z = 0.0 - pos.z;
        if (Math.abs(pos.x) < 0.00001) pos.x = 0;
        return pos;
    }

    function XYZconvertToLoLa(position) {
        var x = position.x;
        var y = position.y;
        var z = position.z;
        var r = _this.config.planetR;
        var rt = new LoLa();
        rt.lo = Math.abs(Math.atan(z / x) / PI);
        if (x < 0.0) rt.lo = (1.0 - rt.lo);
        if (z > 0.0) rt.lo = 0.0 - rt.lo;

        rt.la = Math.asin(y / r) / PI;
        if (isNaN(rt.x)) rt.lo = y;
        rt.lo *= 180.0;
        rt.la *= 180.0;
        return rt;
    }

    function positionMesh(mesh, lo, la, height) {
        var height = height !== undefined ? height : 0;
        var pos = LoLaconvertToXYZ(new LoLa(lo, la));
        var sacl = 1.0 + height;
        mesh.position.set(pos.x * sacl, pos.y * sacl, pos.z * sacl);
        //mesh.lookAt(new THREE.Vector3(0,0,0));   
        mesh.lookAt(new THREE.Vector3(pos.x * 10, pos.y * 10, pos.z * 10));
    }

    function rotationForY(mesh, ri) {
        var x = mesh.position.x;
        var z = mesh.position.z;
        var Rm = Math.sqrt(x * x + z * z);
        var ang = Math.acos(z / Rm);
        if (x < 0) ang = (PI * 2) - ang;
        var angTo = (ang + ri) % (PI * 2);
        mesh.position.x = Rm * Math.sin(angTo);
        mesh.position.z = Rm * Math.cos(angTo);
        mesh.rotation.y = angTo;
    }

    function controlPart() {
        //lanetMesh.visible = false;
        cloudMesh.visible = _this.config.cloudShow;
        loLaLineLod.visible = _this.config.lolaLinesShow;
        viewControler.autoRotate = _this.config.autoRotate;
    }

    function makeMapLines(arrs, R) {
        if (arrs === undefined || arrs.length < 1) return 0;
        if (arrs[0].length > 0)
            if (arrs[0][0] instanceof Array) arrs = arrs[0];
        var vec = new Array();
        var t;
        for (var i = 0; i < arrs.length; i++) {
            t = LoLaconvertToXYZ(new LoLa(arrs[i][0], arrs[i][1]));
            if (R !== undefined) {
                for (var v in t) t[v] *= R;
            }
            vec.push(t);
        }
        return vec;
    }

    function makeMapMesh(data) {
        var R = _this.config.planetR * 1.001;
        if (data.type != "FeatureCollection") return;
        var features = data.features;
        var mapG = new THREE.Group();
        var colorSet = 0x000000;
        for (var i = 0; i < features.length; i++) {
            var io = 0,
                unit;
            var coo = features[i].geometry;
            if (coo.type == "MultiPolygon") {
                unit = new THREE.Group();
                for (var j = 0; j < coo.coordinates.length; j++) {
                    var geometry = new THREE.Geometry();
                    var material = new THREE.LineBasicMaterial({ color: colorSet });
                    var temp = makeMapLines(coo.coordinates[j]);
                    geometry.vertices = temp;
                    unit.add(new THREE.Line(geometry, material));
                }
            }
            if (coo.type == "Polygon") {
                var geometry = new THREE.Geometry();
                var material = new THREE.LineBasicMaterial({ color: colorSet });
                var temp = makeMapLines(coo.coordinates, R);
                geometry.vertices = temp;
                unit = new THREE.Line(geometry, material);
            }
            mapG.add(unit);
        }
        console.log(mapG);
        return mapG;

    }

    /**
     * @param 
     * lo and la is from the left-down corner
     */
    this.addMesh = function(mesh, name, lola, height) {
        if (!(mesh instanceof THREE.Mesh))
            return 0;
        var lola = lola !== undefined ? lola : new LoLa(0, 0),
            name = name !== undefined ? name : DefaultMeshName,
            height = height !== undefined ? height : 0;
        positionMesh(mesh, lola.lo, lola.la, height);
        mesh.name = name;
        MeshsGroup.add(mesh);
    };
    this.addMeshToRT = function(mesh, name, lola, height) {
        if (!(mesh instanceof THREE.Mesh))
            return 0;
        var lola = lola !== undefined ? lola : new LoLa(0, 0),
            name = name !== undefined ? name : DefaultMeshName,
            height = height !== undefined ? height : 0;
        positionMesh(mesh, lola.lo, lola.la, height);
        mesh.name = name;
        this.sceneForRT.add(mesh);
    };
    this.addRenderTarget = function(rt, name) {
        if (!(rt instanceof THREE.WebGLRenderTarget))
            return 0;
        var name = name !== undefined ? name : DefaultMeshName;
        this.renderTargets[name] = rt;
    };
    this.addSingleLine = function(lolaS, lolaE, color) {
        var color = color !== undefined ? color : 0xffffff;
        if (lolaS instanceof LoLa && lolaE instanceof LoLa) {
            addLine(lolaS, lolaE, color, true);
        }
    };
    this.addAnimationLines = function(pointSArray, pointEArray) {
        if (pointSArray.length === pointEArray.length) {
            for (let i = 0; i < pointEArray.length; i++) {

            }
        }

    };
    this.romoveMesh = function(name) {
        var name = name !== undefined ? name : DefaultMeshName;
        MeshsGroup.remove(MeshsGroup.getObjectByName(name));
    };
    this.romoveMeshFromRT = function(name) {
        var name = name !== undefined ? name : DefaultMeshName;
        this.sceneForRT.remove(this.sceneForRT.getObjectByName(name));
    };
    this.removeRenderTarget = function(name) {
        var name = name !== undefined ? name : DefaultMeshName;
        for (var rt in this.renderTargets) {
            if (rt === name) {
                renderer.clearTarget(this.renderTargets[rt]);
                delete renderTargets[rt];
            }

        }
    };
    /**
     * add GeoJSON data to planet surface
     */
    this.addMap = function(data, mapname) {
        var meshMap = makeMapMesh(data);
        meshMap.name = mapname;
        this.scene.add(meshMap);
    };
    this.setMouse = function(v) {
        mouse = v;
    };
    this.pointerLoLa = pointerLoLa;
    this.container = this.domElement;
    this.LoLa = LoLa;


};