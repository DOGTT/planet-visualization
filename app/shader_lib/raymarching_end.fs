varying vec3 wsCoords;
varying vec4 pjCorrds;

uniform sampler2D _mapIn,_mapInUV,_mapIntransfer;
uniform float _stepN;
uniform float _correctionAlpha;
uniform float _textureZNumber;
uniform float _textureYNumber;

struct Ray{
	vec3 temp;
	vec3 o_p;
	vec3 dir;
	float length;
	float del;
	vec3 dir_del;
	float length_del;
	float length_marched;
};
//最大步数 对于一个正方体，最长的射线长度为对角线即 sqrt(3)
//此时把正方体的单维步进范围为1到512 ，则最大步进数量为 sqrt(3)*512=887
#define MAX_STEPN 887
//三维材质模拟，利用z轴数值定位xy，从二维材质获取颜色
vec4 texture3DSimulation(vec3 texCoord){
	vec4 colorF,colorB;
	vec2 texCoordF,texCoordB;

	float zDiff = (texCoord.z * _textureZNumber);//zDiff pre
	float zIndexF = min(floor(zDiff),_textureZNumber-1.0);
	float zIndexB = min(zIndexF +1.0 ,_textureZNumber-1.0);

	float allLength = _textureZNumber * _textureYNumber;
	float yin = (1.0-texCoord.y) * _textureYNumber;
	texCoordF.x = texCoordB.x = texCoord.x;
	texCoordF.y = (((zIndexF*_textureYNumber) + yin)/allLength);
	texCoordB.y = (((zIndexB*_textureYNumber) + yin)/allLength);

	colorF = texture2D(_mapIn,texCoordF);
	colorB = texture2D(_mapIn,texCoordB);
	colorF.rgb =  texture2D(_mapIntransfer,vec2(colorF.a,1.0)).rgb;
	colorB.rgb =  texture2D(_mapIntransfer,vec2(colorB.a,1.0)).rgb;

	zDiff = mod(zDiff,1.0);

	//return vec4(texCoord,0.9);
	return mix(colorF,colorB,zDiff);
}
Ray getRayInfo(){
	Ray r;
	//坐标转换
	vec2 textP = vec2(((pjCorrds.x/pjCorrds.w)+1.0)/2.0,((pjCorrds.y/pjCorrds.w)+1.0)/2.0);

	//取出存在UV材质中的背面位置世界坐标
	vec3 pBack = texture2D(_mapInUV,textP).xyz;
	//取出前面位置的世界坐标
	vec3 pFront = wsCoords;
	
	//define rayMarching Ray
	r.o_p = pFront;
	r.dir = pBack - pFront;
	r.length = length(r.dir);
	r.del = 1.0/_stepN;
	r.dir_del = normalize(r.dir) * r.del;
	r.length_del = length(r.dir_del);
	r.length_marched = 0.0;

	r.temp = pFront;
	return r;
}
void main()
{
	//get the ray
	Ray ray = getRayInfo();
	//color 
	vec4 accumulatedColor = vec4(0.0);
	float accumulatedAlpha = 0.0;
	float scaleFactorAlpha = 25.6*ray.del;
	vec4 samplingColor;
	float samplingAlpha;
	//rayMarching
	for(int i = 0 ;i < MAX_STEPN ;i++){
		samplingColor = texture3DSimulation(ray.o_p);
		
		samplingAlpha = samplingColor.a * _correctionAlpha;

		samplingAlpha *= (1.0 - accumulatedAlpha);

		samplingAlpha *= scaleFactorAlpha;

		accumulatedColor += samplingColor * samplingAlpha;

		accumulatedAlpha += samplingAlpha;

		//advance th ray
		ray.o_p += ray.dir_del;
		ray.length_marched += ray.length_del;
		
		if(ray.length_marched >= ray.length || accumulatedAlpha >= 1.0)
			break;
	}
	//gl_FragColor = texture2D(_mapIn,texcoord_v);
	//gl_FragColor = vec4(ray.temp,1.0);
   	// if((accumulatedColor.r + accumulatedColor.b +accumulatedColor.g)<0.1)
	//   gl_FragColor = vec4(1.0,1.0,1.0,0.5);
	// else
	 gl_FragColor = accumulatedColor;
}