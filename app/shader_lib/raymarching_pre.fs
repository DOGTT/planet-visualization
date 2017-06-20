varying vec3 wsCoords;
void main()
{
	//设置背面的世界坐标 作为表面值的颜色输出
	//The fragment's world space coordinates as fragment output.
	gl_FragColor = vec4( wsCoords.x , wsCoords.y, wsCoords.z, 1 );
}