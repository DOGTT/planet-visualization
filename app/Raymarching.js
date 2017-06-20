/**
 * @author  tideh
 * raymarching
 */
var RayMarching = function(data){
    'use strict';
    var viewSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
    var xdion = 110.949*1000;
    var configure = {
        stepN:200,
        correctionAlpha:1.0
    }
    var mapIntransfer,map,mapUV_RT;
    var cubeMesh = new THREE.Mesh();
    var cubeMeshUV= new THREE.Mesh();
    //var groupMesh = new THREE.Group();
    //var groupMeshUV = new THREE.Group();
    //后台渲染同时渲染计算出uv材质
    var rtOptions = {
        minFilter:THREE.LinearFilter,
        magFilter:THREE.LinearFilter,
        wrapS:THREE.ClampToEdgeWarpping,
        warpT:THREE.ClampToEdgeWarpping,
        format:THREE.RGBFormat,
        type:THREE.FloatType,
        generateMipmaps:false
    };
    mapUV_RT = new THREE.WebGLRenderTarget(viewSize.x,viewSize.y,rtOptions);
                      
    init();
    function init(){
        var floader1 = new FileLoader();
        var name1 = ['raymarching_pre.vs','raymarching_pre.fs'];
        var l1 = floader1.loadShader(name1);
        var floader2 = new FileLoader();
        var name2 = ['raymarching_end.vs','raymarching_end.fs'];
        var l2 =  floader2.loadShader(name2);
        
        var dataT = dataDisposeProsss(data);
        l1.then(l2.then(function(){
            console.log(floader1.getfShader());
            console.log(RayMarching);
            textureDispose(dataT,floader1,floader2);
                  
           
        }));    
    }

    
    function textureDispose(dataText,floaderP,floaderE){  
        //console.log(dataText);
        var stepN = configure.stepN;
        var correctionAlpha = configure.correctionAlpha;
        var x_n = dataText.x;
        var z_n = dataText.z;
        var y_n = dataText.y;
        map= new THREE.DataTexture( dataText.texture, x_n, y_n*z_n, THREE.RGBAFormat, THREE.FloatType);
        map.generateMipmaps = false;
        map.needsUpdate = true;
        var mapIntransfer = makeTransferFunction();
        
        var uniforms = {
            _mapIn:{
                type: "t",value:map
            },
            _mapInUV:{
                type: "t",value:mapUV_RT.texture
            },
            _mapIntransfer:{
                type: "t",value:mapIntransfer
            },                               
            _stepN:{
                type: "1f",value:stepN
            },
            _correctionAlpha:{
                type: "1f",value:correctionAlpha
            },
            _textureZNumber:{
                type: "1f",value:(z_n)
            },
            _textureYNumber:{
                type: "1f",value:(y_n)
            }
        }
        var cubeGeometry = new THREE.BoxGeometry(1,1,1);
        cubeGeometry.doubleSided = true;
        var material_pre = new THREE.ShaderMaterial({
            vertexShader:floaderP.getvShader(),
            fragmentShader:floaderP.getfShader(),
            //transparent:true,
            side:THREE.BackSide
        });
        var material_end = new THREE.ShaderMaterial({
            uniforms:uniforms,
            vertexShader:floaderE.getvShader(),
            fragmentShader:floaderE.getfShader(),
            transparent:true,
            side:THREE.FrontSide
        });
        cubeMeshUV.material = material_pre;
        cubeMeshUV.geometry = cubeGeometry;
        cubeMesh.material = material_end;
        cubeMesh.geometry = cubeGeometry;

         //cubeMeshUV = new THREE.Mesh(cubeGeometry,material_pre);
         //cubeMesh = new THREE.Mesh(cubeGeometry,material_end);
        cubeMesh.needsUpdate = true;
        cubeMeshUV.needsUpdate = true;
        

    }
    function dataDisposeProsss(dataLoad){
        var x_number = dataLoad.header['x-number'];
        var y_number = dataLoad.header['y-number'];
        var z_number = dataLoad.header['z-number'];
        var z_height = dataLoad.header['z-height'];
        var dataTemp = dataLoad.data;
        var inter = z_height[1] - z_height[0];
        var z_number_fin =Math.floor((z_height[z_height.length-1] - z_height[0])/inter);  
        var height_now = 0.5,h_index = 0;
        var x_fin = Math.ceil(x_number/2);  //数据缩放
        var y_fin = Math.ceil(y_number/2); //数据缩放
        //z_number_fin+=2;
        var z_fin = z_number_fin;
        var arrLength = x_fin*y_fin*z_fin;
        var dataText = new Float32Array(arrLength*4);
        var dt_index = 0;
        var color_alpha = 100;
        var block_length = x_number*y_number;
        for(var i = 0;i<z_number_fin;i++){
            var tempi = 0;
            if(i==0||i==z_number_fin-1){
                    // for(var x = 0;x<block_length;x++){
                    //     setColor(dataText,dt_index,1.0,1.0,1.0,0.1);
                    //     dt_index+=4;
                    // }
            }else{
                if(Math.abs(height_now - z_height[h_index])<0.001){
                    var s_n = block_length*h_index;
                    var colorG = height_now/19;
                    for(var n = 0;n<y_number;n++){
                        for(var m = 0;m<x_number;m++){
                            if(n%2==0&&m%2==0){
                                    setColor(dataText,dt_index,0.0,0.0,0.0,0.0);
                                    tempi = dataTemp[s_n+n*x_number+m];
                                    if(tempi>0){
                                        setColor(dataText,dt_index,tempi/color_alpha,0.0,1-colorG,tempi/color_alpha);
                                    }
                                    dt_index+=4;
                            }       
                        }
                    }
                    h_index++;
                }
                else{
                    if(h_index < 1 || h_index > (z_number-1)) break;
                    var s_n1 = block_length*(h_index-1);
                    var s_n2 = block_length*h_index;
                    var colorG = height_now/19;
                    for(var n = 0;n<y_number;n++){
                        for(var m = 0;m<x_number;m++){
                            if(n%2==0&&m%2==0){
                                var xyI = n*x_number+m;
                                setColor(dataText,dt_index,0.0,0.0,0.0,0.0);
                                tempi =  getInterPolation(dataTemp[s_n1+xyI],dataTemp[s_n2+xyI],z_height[h_index-1],z_height[h_index]);
                                if(tempi>0){
                                        setColor(dataText,dt_index,tempi/color_alpha,1-colorG,0.0,tempi/color_alpha);
                                    }
                                dt_index+=4;

                            }
                        }
                    }
                }
                height_now += inter;
            }
        }
        return {
            texture:dataText,
            x:x_fin,
            y:y_fin,
            z:z_fin
        }
        //delete dataLoad
    }
    function makeTransferFunction(){
        var canvas = document.createElement('canvas');
        canvas.height = 16;
        canvas.width = 256;

        var ctx = canvas.getContext('2d');

        var grd = ctx.createLinearGradient(0, 0, canvas.width -1 , canvas.height - 1);
        grd.addColorStop(0.3, "#00FA58");
        grd.addColorStop(0.5, "#CC6600");
        grd.addColorStop(1.0, "#F2F200");

        ctx.fillStyle = grd;
        ctx.fillRect(0,0,canvas.width -1 ,canvas.height -1 );

        mapIntransfer =  new THREE.Texture(canvas);
        mapIntransfer.wrapS = mapIntransfer.wrapT =  THREE.ClampToEdgeWrapping;
        mapIntransfer.needsUpdate = true;
        return mapIntransfer;
        
    }
    function setColor(arr,i,R,G,B,A){
        arr[i] = R;
        arr[i+1] = G;
        arr[i+2] = B;
        arr[i+3] = A;
    }
    //插值
    function getInterPolation(arr1,arr2,L,M,R){
        var LM = L-M;
        var MR = M-R;
        var LR = L-R;  
        return arr1*(LM/LR)+arr2*(MR/LR);
    }
    return {
        mesh:cubeMesh,
        meshRT:cubeMeshUV,
        rtObj:mapUV_RT
    }
};
