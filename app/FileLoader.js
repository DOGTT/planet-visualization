/**
 * @author tide_h 
 * loader need fixed
 * 
 * 
 */
function FileLoader() {
    'use strict';
    var vShader = null;
    var fShader = null;
    var path = 'app/shader_lib/';
    return {
        loadShader: function(name) {
            return new Promise((resolve, reject) => {
                if (name.length < 2) return;
                $.get(path + name[0], function(vs) {
                    $.get(path + name[1], function(fs) {
                        fShader = fs;
                        vShader = vs;
                        resolve(name);
                    });
                });
            });
        },
        setPath: function(p) {
            path = p;
        },
        getvShader: function() {
            return vShader;
        },
        getfShader: function() {
            return fShader;
        }
    };
}