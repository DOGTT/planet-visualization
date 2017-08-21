/**
 * @author tide_h 
 * geometry 
 * @param center, center of lolaBall
 * @param R , the radius
 * @param lo ,the logitude's number
 * @param laN ,the laitide's number
 * @param inter , the point's number of one circle
 */
'use strict';

function LoLaBall(center, R, lo, laN, inter) {
    var center = center !== undefined ? center : new THREE.Vector3(0, 0, 0),
        R = R !== undefined ? R : 1,
        lo = lo !== undefined ? lo : 18,
        laN = laN !== undefined ? laN : 9,
        inter = inter != undefined ? inter : 20;
    var laStart = Math.PI / 18; //the laitide circle start angle
    var laEnd = Math.PI / 18 * 17; //the laitide circle end angle
    var vec = new Array();
    var t1, t2, t3;
    var centerT = new THREE.Vector3();

    var laGi = (laEnd - laStart) / (laN - 1);
    var interla = inter + 1;
    for (var i = 0; i < laN; i++) {
        t1 = laStart + laGi * i;
        t2 = Math.sin(t1) * R; //t R
        t3 = Math.cos(t1) * R;
        centerT = new THREE.Vector3(center.x, center.y, center.z);
        centerT.y += t3;
        vec.push(createCricleY(centerT, t2, inter));
    }
    var loGi = Math.PI * 2 / lo;
    var interlo = Math.floor(inter / 2);
    for (var i = 0; i < lo; i++) {
        t1 = loGi * i;
        vec.push(createHalfCricleX(center, R, interlo, laStart, laEnd, t1));
    }
    var pointN = (lo * (interlo) + laN * (interla));
    return {
        geo: vec,
        pointN: pointN
    };
}

function createHalfCricleX(center, R, dotN, angleS, angleE, angleRo) {
    var vec = new Array();
    var temp = new THREE.Vector3();

    var Rtemp;
    var angleI = (angleE - angleS) / (dotN - 1);
    if (dotN < 2)
        vec.push(center);
    else {
        for (var i = 0; i < dotN; i++) {
            temp = new THREE.Vector3(center.x, center.y, center.z);
            var ang = angleS + angleI * i;
            temp.y += R * Math.cos(ang);
            Rtemp = R * Math.sin(ang);
            temp.x += Rtemp * Math.sin(angleRo);
            temp.z += Rtemp * Math.cos(angleRo);
            vec.push(temp);
        }
    }
    return vec;
}

function createCricleY(center, R, dotN) {
    var vec = new Array();
    var temp = new THREE.Vector3();

    if (dotN < 2)
        vec.push(center);
    else {
        for (var i = 0; i <= dotN; i++) {
            temp = new THREE.Vector3(center.x, center.y, center.z);
            var ang = (i / dotN) * Math.PI * 2;
            temp.x += R * Math.sin(ang);
            temp.z += R * Math.cos(ang);
            vec.push(temp);
        }
    }
    return vec;
}

function drawAxes(length) {
    var rG = new THREE.Group();
    var xGeo = new THREE.Geometry();
    xGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    xGeo.vertices.push(new THREE.Vector3(length, 0, 0));
    var xMat = new THREE.LineBasicMaterial({
        color: 0xff0000
    });
    var xAxis = new THREE.Line(xGeo, xMat);
    rG.add(xAxis);
    // y-axis
    var yGeo = new THREE.Geometry();
    yGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    yGeo.vertices.push(new THREE.Vector3(0, length, 0));
    var yMat = new THREE.LineBasicMaterial({
        color: 0x00ff00
    });
    var yAxis = new THREE.Line(yGeo, yMat);
    rG.add(yAxis);
    // z-axis
    var zGeo = new THREE.Geometry();
    zGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    zGeo.vertices.push(new THREE.Vector3(0, 0, length));
    var zMat = new THREE.LineBasicMaterial({
        color: 0x00ccff
    });
    var zAxis = new THREE.Line(zGeo, zMat);
    rG.add(zAxis);
    return rG;
}
/**
 * Two connections create a parabola
 * Center of parabola is(0,0,0)
 * @param {p1} the point of start (Vector3) 
 * @param {p2} the point of end (Vector3) 
 * @param {height} the height of parabola
 * @param {N} the number of the point made 
 */
function PointToPoint(p1, p2, height, N) {
    //var R = 1.0;
    var H = height !== undefined ? height : 0.5,
        pointN = N !== undefined ? (N - 2) : 10;

    var pO = new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
    var M = pO.length();
    var L = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
    var Lhalf = L / 2;
    //P*y = x^2
    var P = Math.pow(L, 2) / (4 * H);
    var arr = new Array();
    arr.push(p1);
    var lt = L / pointN;
    var tx = Lhalf,
        ty = 0;
    for (let i = 0; i < pointN; i++) {
        tx = tx - lt;
        ty = (tx * tx) / P;
        var bl = (M / (M + H - ty));
        var x0 = tx * bl;
        var I = (Lhalf - x0) / L;
        var Pointt = rotation(p1, p2, I);
        arr.push(sufang(Pointt, 1 / bl));
    }
    arr.push(p2);
    return arr;
}

function sufang(p, v) {
    var temp = new THREE.Vector3(0, 0, 0);
    temp.x = p.x * v;
    temp.y = p.y * v;
    temp.z = p.z * v;
    return temp;
}

function rotation(p1, p2, I) {
    var temp = new THREE.Vector3(0, 0, 0);
    temp.x = (p2.x - p1.x) * I + p1.x;
    temp.y = (p2.y - p1.y) * I + p1.y;
    temp.z = (p2.z - p1.z) * I + p1.z;
    return temp;
}