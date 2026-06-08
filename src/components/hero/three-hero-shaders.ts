// Background shader ported from the Pixi metaball hero.
export const BG_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uMouseActive;
uniform vec3  uAccent;
uniform vec3  uAccent2;
uniform vec3  uPageBg;
uniform vec3  uBaseDot;
uniform float uLight;
uniform float uTime;

float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float s=0.0,a=0.5;mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<4;i++){s+=a*vnoise(p);p=r*p*2.0;a*=0.5;}return s;}
float grain(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}

vec4 buf[8];
vec4 sigmoid(vec4 x){return vec4(1.0)/(vec4(1.0)+exp(-x));}
vec4 cppn_fn(vec2 coordinate,float in0,float in1,float in2){
    buf[6]=vec4(coordinate.x,coordinate.y,0.3948333106474662+in0,0.36+in1);
    buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
    buf[0]=mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),vec4(2.4582713,3.1660357,1.2219609,0.06276096),vec4(-5.478085,-6.159632,1.8701609,-4.7742867),vec4(6.039214,-5.542865,-0.90925294,3.251348))*buf[6]+mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
    buf[1]=mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),vec4(0.8631464,1.7432913,5.643898,1.6106541),vec4(2.4941394,-3.5012043,1.7184316,6.357333),vec4(3.310376,8.209261,1.1355612,-1.165539))*buf[6]+mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),vec4(2.987511,3.129433,-0.89023495,-1.6822904),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
    buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
    buf[2]=mat4(vec4(-15.219568,8.095543,-2.429353,-1.9381982),vec4(-5.951362,4.3115187,2.6393783,1.274315),vec4(-7.3145227,6.7297835,5.2473326,5.9411426),vec4(5.0796127,8.979051,-1.7278991,-1.158976))*buf[6]+mat4(vec4(-11.967154,-11.608155,6.1486754,11.237008),vec4(2.124141,-6.263192,-1.7050359,-0.7021966),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-4.17164,-3.2281182,-4.576417,-3.6401186);
    buf[3]=mat4(vec4(3.1832156,-13.738922,1.879223,3.233465),vec4(0.64300746,12.768129,1.9141049,0.50990224),vec4(-0.049295485,4.4807224,1.4733979,1.801449),vec4(5.0039253,13.000481,3.3991797,-4.5561905))*buf[6]+mat4(vec4(-0.1285731,7.720628,-3.1425676,4.742367),vec4(0.6393625,3.714393,-0.8108378,-0.39174938),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-1.1811101,-21.621881,0.7851888,1.2329718);
    buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
    buf[4]=mat4(vec4(5.214916,-7.183024,2.7228765,2.6592617),vec4(-5.601878,-25.3591,4.067988,0.4602802),vec4(-10.57759,24.286327,21.102104,37.546658),vec4(4.3024497,-1.9625226,2.3458803,-1.372816))*buf[0]+mat4(vec4(-17.6526,-10.507558,2.2587414,12.462782),vec4(6.265566,-502.75443,-12.642513,0.9112289),vec4(-10.983244,20.741234,-9.701768,-0.7635988),vec4(5.383626,1.4819539,-4.1911616,-4.8444734))*buf[1]+mat4(vec4(12.785233,-16.345072,-0.39901125,1.7955981),vec4(-30.48365,-1.8345358,1.4542528,-1.1118771),vec4(19.872723,-7.337935,-42.941723,-98.52709),vec4(8.337645,-2.7312303,-2.2927687,-36.142323))*buf[2]+mat4(vec4(-16.298317,3.5471997,-0.44300047,-9.444417),vec4(57.5077,-35.609753,16.163465,-4.1534753),vec4(-0.07470326,-3.8656476,-7.0901804,3.1523974),vec4(-12.559385,-7.077619,1.490437,-0.8211543))*buf[3]+vec4(-7.67914,15.927437,1.3207729,-1.6686112);
    buf[5]=mat4(vec4(-1.4109162,-0.372762,-3.770383,-21.367174),vec4(-6.2103205,-9.35908,0.92529047,8.82561),vec4(11.460242,-22.348068,13.625772,-18.693201),vec4(-0.3429052,-3.9905605,-2.4626114,-0.45033523))*buf[0]+mat4(vec4(7.3481627,-4.3661838,-6.3037653,-3.868115),vec4(1.5462853,6.5488915,1.9701879,-0.58291394),vec4(6.5858274,-2.2180402,3.7127688,-1.3730392),vec4(-5.7973905,10.134961,-2.3395722,-5.965605))*buf[1]+mat4(vec4(-2.5132585,-6.6685553,-1.4029363,-0.16285264),vec4(-0.37908727,0.53738135,4.389061,-1.3024765),vec4(-0.70647055,2.0111287,-5.1659346,-3.728635),vec4(-13.562562,10.487719,-0.9173751,-2.6487076))*buf[2]+mat4(vec4(-8.645013,6.5546675,-6.3944063,-5.5933375),vec4(-0.57783127,-1.077275,36.91025,5.736769),vec4(14.283112,3.7146652,7.1452246,-4.5958776),vec4(2.7192075,3.6021907,-4.366337,-2.3653464))*buf[3]+vec4(-5.9000807,-4.329569,1.2427121,8.59503);
    buf[4]=sigmoid(buf[4]);buf[5]=sigmoid(buf[5]);
    buf[6]=mat4(vec4(-1.61102,0.7970257,1.4675229,0.20917463),vec4(-28.793737,-7.1390953,1.5025433,4.656581),vec4(-10.94861,39.66238,0.74318546,-10.095605),vec4(-0.7229728,-1.5483948,0.7301322,2.1687684))*buf[0]+mat4(vec4(3.2547753,21.489103,-1.0194173,-3.3100595),vec4(-3.7316632,-3.3792162,-7.223193,-0.23685838),vec4(13.1804495,0.7916005,5.338587,5.687114),vec4(-4.167605,-17.798311,-6.815736,-1.6451967))*buf[1]+mat4(vec4(0.604885,-7.800309,-7.213122,-2.741014),vec4(-3.522382,-0.12359311,-0.5258442,0.43852118),vec4(9.6752825,-22.853785,2.062431,0.099892326),vec4(-4.3196306,-17.730087,2.5184598,5.30267))*buf[2]+mat4(vec4(-6.545563,-15.790176,-6.0438633,-5.415399),vec4(-43.591583,28.551912,-16.00161,18.84728),vec4(4.212382,8.394307,3.0958717,8.657522),vec4(-5.0237565,-4.450633,-4.4768,-5.5010443))*buf[3]+mat4(vec4(1.6985557,-67.05806,6.897715,1.9004834),vec4(1.8680354,2.3915145,2.5231109,4.081538),vec4(11.158006,1.7294737,2.0738268,7.386411),vec4(-4.256034,-306.24686,8.258898,-17.132736))*buf[4]+mat4(vec4(1.6889864,-4.5852966,3.8534803,-6.3482175),vec4(1.3543309,-1.2640043,9.932754,2.9079645),vec4(-5.2770967,0.07150358,-0.13962056,3.3269649),vec4(28.34703,-4.918278,6.1044083,4.085355))*buf[5]+vec4(6.6818056,12.522166,-3.7075126,-4.104386);
    buf[7]=mat4(vec4(-8.265602,-4.7027016,5.098234,0.7509808),vec4(8.6507845,-17.15949,16.51939,-8.884479),vec4(-4.036479,-2.3946867,-2.6055532,-1.9866527),vec4(-2.2167742,-1.8135649,-5.9759874,4.8846445))*buf[0]+mat4(vec4(6.7790847,3.5076547,-2.8191125,-2.7028968),vec4(-5.743024,-0.27844876,1.4958696,-5.0517144),vec4(13.122226,15.735168,-2.9397483,-4.101023),vec4(-14.375265,-5.030483,-6.2599335,2.9848232))*buf[1]+mat4(vec4(4.0950394,-0.94011575,-5.674733,4.755022),vec4(4.3809423,4.8310084,1.7425908,-3.437416),vec4(2.117492,0.16342592,-104.56341,16.949184),vec4(-5.22543,-2.994248,3.8350096,-1.9364246))*buf[2]+mat4(vec4(-5.900337,1.7946124,-13.604192,-3.8060522),vec4(6.6583457,31.911177,25.164474,91.81147),vec4(11.840538,4.1503043,-0.7314397,6.768467),vec4(-6.3967767,4.034772,6.1714606,-0.32874924))*buf[3]+mat4(vec4(3.4992442,-196.91893,-8.923708,2.8142626),vec4(3.4806502,-3.1846354,5.1725626,5.1804223),vec4(-2.4009497,15.585794,1.2863957,2.0252278),vec4(-71.25271,-62.441242,-8.138444,0.50670296))*buf[4]+mat4(vec4(-12.291733,-11.176166,-7.3474145,4.390294),vec4(10.805477,5.6337385,-0.9385842,-4.7348723),vec4(-12.869276,-7.039391,5.3029537,7.5436664),vec4(1.4593618,8.91898,3.5101583,5.840625))*buf[5]+vec4(2.2415268,-6.705987,-0.98861027,-2.117676);
    buf[6]=sigmoid(buf[6]);buf[7]=sigmoid(buf[7]);
    buf[0]=mat4(vec4(1.6794263,1.3817469,2.9625452,0.),vec4(-1.8834411,-1.4806935,-3.5924516,0.),vec4(-1.3279216,-1.0918057,-2.3124623,0.),vec4(0.2662234,0.23235129,0.44178495,0.))*buf[0]+mat4(vec4(-0.6299101,-0.5945583,-0.9125601,0.),vec4(0.17828953,0.18300213,0.18182953,0.),vec4(-2.96544,-2.5819945,-4.9001055,0.),vec4(1.4195864,1.1868085,2.5176322,0.))*buf[1]+mat4(vec4(-1.2584374,-1.0552157,-2.1688404,0.),vec4(-0.7200217,-0.52666044,-1.438251,0.),vec4(0.15345335,0.15196142,0.272854,0.),vec4(0.945728,0.8861938,1.2766753,0.))*buf[2]+mat4(vec4(-2.4218085,-1.968602,-4.35166,0.),vec4(-22.683098,-18.0544,-41.954372,0.),vec4(0.63792,0.5470648,1.1078634,0.),vec4(-1.5489894,-1.3075932,-2.6444845,0.))*buf[3]+mat4(vec4(-0.49252132,-0.39877754,-0.91366625,0.),vec4(0.95609266,0.7923952,1.640221,0.),vec4(0.30616966,0.15693925,0.8639857,0.),vec4(1.1825981,0.94504964,2.176963,0.))*buf[4]+mat4(vec4(0.35446745,0.3293795,0.59547555,0.),vec4(-0.58784515,-0.48177817,-1.0614829,0.),vec4(2.5271258,1.9991658,4.6846647,0.),vec4(0.13042648,0.08864098,0.30187556,0.))*buf[5]+mat4(vec4(-1.7718065,-1.4033192,-3.3355875,0.),vec4(3.1664357,2.638297,5.378702,0.),vec4(-3.1724713,-2.6107926,-5.549295,0.),vec4(-2.851368,-2.249092,-5.3013067,0.))*buf[6]+mat4(vec4(1.5203838,1.2212278,2.8404984,0.),vec4(1.5210563,1.2651345,2.683903,0.),vec4(2.9789467,2.4364579,5.2347264,0.),vec4(2.2270417,1.8825914,3.8028636,0.))*buf[7]+vec4(-1.5468478,-3.6171484,0.24762098,0.);
    buf[0]=sigmoid(buf[0]);
    return vec4(buf[0].x,buf[0].y,buf[0].z,1.);
}

void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 uv = p / max(uResolution.x, uResolution.y);
  float t = uTime * 0.08;
  vec2 q = vec2(fbm(uv*2.0+vec2(0.0,t)), fbm(uv*2.0+vec2(5.2,t*0.9)));
  vec2 r = vec2(fbm(uv*2.0+3.0*q+vec2(1.7,9.2)+t), fbm(uv*2.0+3.0*q+vec2(8.3,2.8)+t*1.1));
  float aurora = smoothstep(0.35, 0.85, fbm(uv*2.0+3.5*r));

  float gridSize = 26.0;
  vec2 g = fract(p/gridSize) - 0.5;
  float gridDot = smoothstep(2.2, 0.6, length(g)*gridSize);
  float dotBright = mix(0.18 + aurora*0.65, 0.14 + aurora*0.34, uLight);

  float mDist = length(p - uMouse);
  float mGlow = exp(-mDist*mDist/42000.0);
  float mLocal = exp(-mDist*mDist/120000.0);

  // Green-dominant Aurora palette
  vec3 cMint = vec3(0.65, 0.98, 0.75); // Vivid Mint Green
  vec3 cEmerald = vec3(0.45, 0.95, 0.60); // Bright Emerald Green
  vec3 cCyan = vec3(0.65, 0.95, 0.90); // Soft Cyan

  float hue = smoothstep(0.2, 0.9, aurora*0.6 + 0.25*fbm(uv*1.4 - vec2(t*1.3, t)));
  vec3 accSmoke = mix(uAccent, uAccent2, hue*0.62);
  vec3 accHover = uAccent;
  vec3 dotTint = mix(accSmoke, accHover, mLocal*uMouseActive);

  vec3 baseDot = uBaseDot;
  vec3 dotColor = mix(baseDot, dotTint, mix(0.35, 0.24, uLight) + mLocal*uMouseActive*mix(0.85, 0.20, uLight));
  vec3 col = vec3(0.0);
  col += gridDot * dotColor * dotBright * (mix(0.55, 0.42, uLight) + mLocal*uMouseActive*mix(0.5, 0.10, uLight));
  col += accSmoke * aurora*aurora * mix(0.05, 0.018, uLight);
  
  // Spotlight is a rotating gradient of the Aurora colors
  float spotAngle = atan(p.y - uMouse.y, p.x - uMouse.x) + uTime * 0.8;
  vec3 spotGrad = mix(cMint, cEmerald, sin(spotAngle) * 0.5 + 0.5);
  spotGrad = mix(spotGrad, cCyan, cos(spotAngle * 1.3) * 0.5 + 0.5);
  vec3 spotColorLight = mix(spotGrad, vec3(0.2, 0.85, 0.45), 0.3); // add punch so it isn't too white
  
  vec3 spotColor = mix(accHover, spotColorLight, uLight);
  float spotAlpha = mGlow * uMouseActive;
  col += accHover * spotAlpha * mix(0.42, 0.0, uLight); // keep original in dark mode
  col += (grain(p+uTime*13.0)-0.5) * 0.006;
  vec2 vc = p/uResolution - 0.5;
  float vd = length(vc);
  // Dark: full vignette to frame the scene. Light: barely-there (far corners
  // only, ~5%) so the pale background stays clean instead of looking muddy.
  float vigDark = 0.45 + (1.0 - smoothstep(0.30, 0.85, vd)) * 0.55;
  float vigLight = 0.95 + (1.0 - smoothstep(0.45, 1.10, vd)) * 0.05;
  col *= mix(vigDark, vigLight, uLight);

  // Darken the light theme background to a soft pastel grey-green so the bright glass stands out
  vec3 pageBg = mix(uPageBg, vec3(0.84, 0.87, 0.86), uLight);
  // Light theme: an awwwards level fluid mesh gradient aurora.
  // Using the organic CPPN neural fluid animation!
  vec2 cppnUv = vec2(vUv.x, 1.0 - vUv.y) * 2.0 - 1.0;
  cppnUv.x *= uResolution.x / uResolution.y;
  // uWarp effect from original shader
  cppnUv += 0.05 * vec2(sin(cppnUv.y*6.283 + uTime*0.5), cos(cppnUv.x*6.283 + uTime*0.5));
  vec4 cppn_val = cppn_fn(cppnUv, 0.1*sin(0.3*uTime), 0.1*sin(0.69*uTime), 0.1*sin(0.44*uTime));
  
  float q1 = cppn_val.x;
  float q2 = cppn_val.y;
  float q3 = cppn_val.z;
  
  vec3 cSoftGreen = vec3(0.85, 0.98, 0.85); // Very soft background green
  
  vec3 auroraCol = mix(cSoftGreen, cMint, smoothstep(0.2, 0.8, q1));
  auroraCol = mix(auroraCol, cEmerald, smoothstep(0.3, 0.7, q2));
  auroraCol = mix(auroraCol, cCyan, smoothstep(0.4, 0.8, q3));
  
  float mask = smoothstep(0.1, 0.9, fbm(uv * 0.9 + t * 0.05));
  pageBg = mix(pageBg, auroraCol, uLight * mask * 0.95);
  pageBg = mix(pageBg, spotColorLight, spotAlpha * uLight * 0.15);
  vec3 finalBg = pageBg + col;
  
  vec2 uv2 = vUv * (1.0 - vUv.yx);
  float vig = pow(uv2.x * uv2.y * 15.0, 0.15);
  // Light theme: nearly remove this edge darkening so the corners and the area
  // under the header stay clean. Dark theme keeps the full frame.
  vig = mix(vig, 1.0, uLight * 0.9);

  gl_FragColor = vec4(finalBg * vig, 1.0);
}
`;

export const COMPOSITE_FRAG = /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUv;
uniform sampler2D uScene;

void main() {
  gl_FragColor = texture2D(uScene, vUv);
}
`;

export const CUBE_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
void main(){
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vP = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const CUBE_FRAG = /* glsl */ `
precision highp float;
varying vec3 vN;
varying vec3 vP;
uniform sampler2D uScene;
uniform vec2  uRes;
uniform vec3  uAccent;
uniform vec3  uAccent2;
uniform float uLight;
uniform float uReveal;

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(-vP);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

  vec2 suv = gl_FragCoord.xy / uRes;
  
  // Clean single-tap refraction (no chromatic dispersion) so text stays sharp and black
  vec3 refr = texture2D(uScene, clamp(suv + N.xy * 0.16, 0.002, 0.998)).rgb;
  vec3 refl = texture2D(uScene, clamp(suv - N.xy * 0.34, 0.002, 0.998)).rgb;
  vec3 col = mix(refr, refl, fres * 0.85);
  
  // Sharp specular highlight from a virtual top-right studio light
  vec3 lightDir = normalize(vec3(0.8, 1.0, 0.5));
  vec3 halfVector = normalize(lightDir + V);
  float specular = pow(max(dot(N, halfVector), 0.0), 150.0);
  col += vec3(1.0) * specular * 0.6 * uLight;

  float facing = clamp(N.z * 0.5 + 0.5, 0.0, 1.0);
  float edge = pow(fres, 1.35);

  // Dark theme keeps the original almost-white glass (accent-tinted edges).
  // Light theme is CLEAR glass: no heavy white wash, just a tiny cool edge tint.
  vec3 lightWash = vec3(0.95, 0.96, 0.98);
  col = mix(col, lightWash, uLight * edge * 0.12);
  
  col += uAccent * fres * mix(0.16, 0.02, uLight);
  // accent2 backscatter was a light-only tint; drop it so light glass stays clear
  col += uAccent2 * (1.0 - facing) * 0.12 * uLight * 0.0;
  col += mix(vec3(0.04, 0.045, 0.05), vec3(0.0, 0.0, 0.0), uLight);
  col *= mix(0.74, 0.9, uLight) + mix(0.26, 0.1, uLight) * facing;
  vec3 rim = mix(vec3(0.7, 0.74, 0.8), vec3(0.66, 0.70, 0.78), uLight);
  col += rim * pow(fres, 2.0) * mix(0.5, 0.2, uLight);
  col = clamp(col, 0.0, 1.0);

  float alpha = (0.85 + fres * 0.15) * uReveal;
  gl_FragColor = vec4(col, alpha);
}
`;

export const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const GLOW_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uLight;
uniform float uTime;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float dist = length(uv);
  if (dist > 1.0) discard;
  
  // Natural volumetric light falloff (inverse square-like)
  // No separated rays, just a pure, smooth glowing orb.
  // The glass cubes will naturally break this light into complex patterns.
  float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
  
  // Dark: acid core (additive). Light: clean vibrant green core, smaller radius.
  float glowLight = pow(alpha, 2.5) * 1.5;
  float glow = mix(pow(alpha, 1.8) * 0.85, glowLight, uLight);
  
  // Gradient spotlight to match the Aurora palette
  vec3 cMint = vec3(0.65, 0.98, 0.75);
  vec3 cEmerald = vec3(0.45, 0.95, 0.60);
  vec3 cCyan = vec3(0.65, 0.95, 0.90);
  float spotAngle = atan(uv.y, uv.x) - uTime * 0.8;
  vec3 spotGrad = mix(cMint, cEmerald, sin(spotAngle) * 0.5 + 0.5);
  spotGrad = mix(spotGrad, cCyan, cos(spotAngle * 1.3) * 0.5 + 0.5);
  vec3 spotColorLight = mix(spotGrad, vec3(0.2, 0.85, 0.45), 0.3);
  
  vec3 glowColor = mix(uColor, spotColorLight, uLight);
  
  float outAlpha = glow * uIntensity;
  // For dark mode (AdditiveBlending), the acid core expects premultiplied intensity.
  // For light mode (NormalBlending), we output pure color so it doesn't get muddied.
  vec3 finalRgb = mix(glowColor * glow * uIntensity, glowColor, uLight);
  gl_FragColor = vec4(finalRgb, outAlpha * mix(1.0, 0.4, uLight));
}
`;
