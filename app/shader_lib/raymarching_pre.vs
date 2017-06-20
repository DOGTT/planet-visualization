varying vec3 wsCoords;
void main()
{
	//设置背面的世界坐标 传到片元着色器
	//Set the world space coordinates of the back faces vertices as output.
	wsCoords = position + vec3(0.5); //move it from [-0.5;0.5] to [0,1]
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}