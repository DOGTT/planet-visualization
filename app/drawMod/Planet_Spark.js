/**
 * 
 */
Planet.prototype.ShowSpark = function(num) {
    var NUM = num || 10000;
    var _this = this;
    var uniforms = {
        color: { value: new THREE.Color(0xffffff) },
        texture: { value: new THREE.TextureLoader().load("textures/spark1.png") }
    };
    var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        transparent: true
    });
    var floader = new FileLoader();
    floader.setPath(_this.config.universe_texture_shader_path);
    var shader_name = ["particles.vs", "particles.fs"];
    floader.loadShader(shader_name).then(
        function() {
            shaderMaterial.fragmentShader = floader.getfShader();
            shaderMaterial.vertexShader = floader.getvShader();
            var p_n = NUM;
            var geo = new THREE.BufferGeometry();
            var positions = new Float32Array(p_n * 3);
            var colors = new Float32Array(p_n * 3);
            var sizes = new Float32Array(p_n);
            for (var i = 0; i < p_n; i++) {
                var s1 = Math.random() - 0.5;
                var s2 = Math.random() - 0.5;
                var poin = _this.LoLaconvertToXYZ(new PlanetLoLa(s1 * 360, s2 * 180));
                positions[i * 3] = poin.x * 1.1;
                positions[i * 3 + 1] = poin.y * 1.1;
                positions[i * 3 + 2] = poin.z * 1.1;
                colors[i * 3] = poin.x;
                colors[i * 3 + 1] = poin.y;
                colors[i * 3 + 2] = poin.z;
                sizes[i] = 1;
            }
            var color = new THREE.Color();
            //color.setHSL(0.5,1.0,0.5);

            geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
            geo.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
            var particlesMesh = new THREE.Points(geo, shaderMaterial);
            _this.scene.add(particlesMesh);
        }
    );
};