(function (global,factory){
    typeof exports === 'object' && typeof module!=='undefined'?module.exports=factory():
    typeof define === 'function' && define.amd?define(factory):(global.FileLoader=factory());   
}(this,(function(){
'use strict';
/**
 * @author tide_h 
 * loader need fixed
 */
var FileLoader = function(){
    var fShader,vShader;
    var path = 'app/shader_lib/';
    return {
        getvShader:function(){
            return vShader;
        },
        getfShader:function(){
            return fShader;
        },
        loadShader:function(name){     
            return new Promise((resolve,reject)=>{
                if(name.length<2) return;
                $.get(path+name[0],function(vs){
                    $.get(path+name[1],function(fs){
                        fShader = fs;
                        vShader = vs;
                        resolve(name);
                    });
                });
            });
        },
        setPath:function(p){
            path=p;
        }
    }
};
return FileLoader;

})));