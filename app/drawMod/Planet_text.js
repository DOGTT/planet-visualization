 /**
  * @param str the string show
  */
 Planet.prototype.setTextMesh = function(str) {

     var Text = str || "null String";
     this._fontMeshConfig = {
         TypeFaceFile: 'fonts/helvetiker_regular.typeface.json',
         size: 80,
         height: 5,
         curveSegments: 12,
         color: 0xffff00
     };
     var _this = this;
     var loader = new THREE.FontLoader();

     loader.load(_this._fontMeshConfig.TypeFaceFile, function(font) {

         var geometry = new THREE.TextGeometry(Text, {
             font: font,
             size: _this._fontMeshConfig.size,
             height: _this._fontMeshConfig.height,
             curveSegments: _this._fontMeshConfig.curveSegments,
             bevelEnabled: true,
             bevelThickness: 1,
             bevelSize: 8,
             bevelSegments: 5
         });
         var tm = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
             color: _this._fontMeshConfig.color
         }));
         geometry.computeBoundingBox();

         var xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
         console.log(geometry.boundingBox, geometry.boundingBox.min.x, geometry.center());
         tm.scale.x = tm.scale.y = tm.scale.z = 0.001;
         _this.addMesh(tm, Text, new PlanetLoLa(117.5, -22.35), 0.3);
     });
 };