varying vec3 wsCoords;
void main()
{
	//���ñ������������ ��Ϊ����ֵ����ɫ���
	//The fragment's world space coordinates as fragment output.
	gl_FragColor = vec4( wsCoords.x , wsCoords.y, wsCoords.z, 1 );
}