Planet.prototype.addSingleLine = function(lolaS, lolaE, color) {

    var _this = this;
    var _color = color !== undefined ? color : 0xffffff;
    if (!_this.linesGroup) {
        _this.linesGroup = new THREE.Group();
        _this.scene.add(_this.linesGroup);
    }
    const _renderName = "_lines_render";
    if (!_this.renderProcesses[_renderName]) {
        _this.renderProcesses[_renderName] = lines_render;
    }

    function lines_render() {
        var show_range = 0.5;
        var moveSpeed = 0.5; //one second move 0.1
        this.linesGroup.traverse(
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
        );
    }

    if (lolaS instanceof PlanetLoLa && lolaE instanceof PlanetLoLa) {
        addLine(lolaS, lolaE, _color, true);
    }

    function addLine(p1, p2, color, dynamic) {
        var p1 = _this.LoLaconvertToXYZ(p1);
        var p2 = _this.LoLaconvertToXYZ(p2);
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
        // if (dynamic) {

        // }
        var material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 2
        });

        var line = new THREE.Line(geometry, material);
        line.dynamic = dynamic;
        _this.linesGroup.add(line);
    }
};