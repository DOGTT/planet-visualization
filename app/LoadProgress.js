(function (global,factory){
    typeof exports === 'object' && typeof module!=='undefined'?module.exports=factory():
    typeof define === 'function' && define.amd?define(factory):(global.LoadProgress=factory());   
}(this,(function(){
    'use strict';
/**
 * @author tide_h
 * loading progress control
 */
var LoadProgress = function(){
    var cte = document.createElement('div');
    cte.style.cssText = 'position:fixed;bottom:10px;left:10px;cursor:pointer;opacity:0.9;z-index:10000';
    return{
        dom:cte,
        onProgress:function(xhr){
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                percentComplete = Math.round(percentComplete, 2);
                cte.innerHTML=percentComplete;
                console.log( percentComplete + '% downloaded' );
             }
        },
        onError : function ( xhr ) {
        }
    }
}
return LoadProgress;
})));