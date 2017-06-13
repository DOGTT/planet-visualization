/**
 * @author tide_h 
 * geometry 
 * @param center, center of lonlatBall
 * @param R , the radius
 * @param lonN ,the longitude's number
 * @param latN ,the latitide's number
 * @param inter , the point's number of one circle
 */
'use strict';
var latStart = Math.PI/18; //the latitide circle start angle
var latEnd = Math.PI/18*17; //the latitide circle end angle
function lonlatBall(center,R,lonN,latN,inter){
    var center = center!== undefined ? center:new THREE.Vector3(0,0,0),
        R = R!== undefined ? R:1,
        lonN = lonN!==undefined ? lonN:18,
        latN = latN!==undefined ? latN:9,
        inter = inter!=undefined ? inter:20;
    var vec = new Array();
    var t1,t2,t3;
    var centerT = new THREE.Vector3();
    
    var latGi = (latEnd - latStart)/(latN-1); 
    var interLat = inter+1;
    for(var i = 0 ; i < latN ; i++){
        t1 = latStart + latGi*i;
        t2 = Math.sin(t1)*R;//t R
        t3 = Math.cos(t1)*R;
        centerT = new THREE.Vector3(center.x,center.y,center.z);
        centerT.y += t3;
        vec.push(createCricleY(centerT,t2,inter));
    }
    var lonGi = Math.PI*2/lonN;
    var interLon = Math.floor(inter/2);
    for(var i = 0 ; i < lonN ; i++){
        t1 = lonGi*i;
        vec.push(createHalfCricleX(center,R,interLon,latStart,latEnd,t1));
    }
    var pointN = (lonN*(interLon)+latN*(interLat));
    return {
        geo:vec,
        pointN:pointN
    };
}
function createHalfCricleX(center,R,dotN,angleS,angleE,angleRo){
    var vec = new Array();
    var temp = new THREE.Vector3();
    
    var Rtemp;
    var angleI = (angleE-angleS)/(dotN-1);
    if(dotN<2)
        vec.push(center);
    else{
        for(var i = 0;i< dotN;i++){
            temp = new THREE.Vector3(center.x,center.y,center.z);
            var ang = angleS+angleI*i;
            temp.y += R*Math.cos(ang);
            Rtemp = R*Math.sin(ang);
            temp.x += Rtemp*Math.sin(angleRo);
            temp.z += Rtemp*Math.cos(angleRo);
            vec.push(temp);
        }
    }
    return vec;    
}
function createCricleY(center,R,dotN){
    var vec = new Array();
    var temp = new THREE.Vector3();
    
    if(dotN<2)
        vec.push(center);
    else{
        for(var i = 0;i<= dotN;i++){
            temp = new THREE.Vector3(center.x,center.y,center.z);
            var ang = (i/dotN)*Math.PI*2;
            temp.x += R*Math.sin(ang);
            temp.z += R*Math.cos(ang);
            vec.push(temp);
        }
    }
    return vec;      
}