Planet.prototype.addSingleLine = function(lolaS, lolaE, color) {
    var color = color !== undefined ? color : 0xffffff;
    var _this = this;
    if (lolaS instanceof PlanetLoLa && lolaE instanceof PlanetLoLa) {
        addLine(lolaS, lolaE, color, true);
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
};