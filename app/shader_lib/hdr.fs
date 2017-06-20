uniform float exposure;
uniform float bright;

uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldPosition;
#include <common>
vec3 effect_color( const in vec4 color ) {
	vec3 ves;
	ves = color.xyz;
	float co = color.x + color.y+color.z ;
	float br = bright;
	if(br>2.0) br=2.0;
	if(br>0.4){
		if(co>1.0&&co < 2.5){
			ves = color.xyz * br;
		}
	}
	
	return ves;
}
void main() {
	vec4 color = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	float a = color.a * opacity;
	
	color.xyz  = effect_color( color );
	
	gl_FragColor = vec4( color.rgb, a );
}