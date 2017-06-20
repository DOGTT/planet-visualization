varying vec3 wsCoords;
varying vec4 pjCorrds;

void main()
{
	wsCoords = position + vec3(0.5);
   // wsCoords = (modelMatrix * vec4(position + vec3(0.5),1.0)).xyz;
	pjCorrds = projectionMatrix * modelViewMatrix * vec4(position,1.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}