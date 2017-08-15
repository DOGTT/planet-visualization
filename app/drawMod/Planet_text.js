 //text
 var loader = new THREE.FontLoader();

 loader.load('fonts/helvetiker_regular.typeface.json', function(font) {

     var geometry = new THREE.TextGeometry('Hello World!', {
         font: font,
         size: 80,
         height: 5,
         curveSegments: 12,
         bevelEnabled: true,
         bevelThickness: 1,
         bevelSize: 8,
         bevelSegments: 5
     });
     var tm = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
         color: 0xee02ff
     }));
     geometry.computeBoundingBox();

     var xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
     console.log(geometry.boundingBox, geometry.boundingBox.min.x, geometry.center());
     tm.scale.x = tm.scale.y = tm.scale.z = 0.001;
     positionMesh(tm, 146, 25, 0);
     scene.add(tm);
 });