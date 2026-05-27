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
uniform float uTime;

float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float s=0.0,a=0.5;mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<4;i++){s+=a*vnoise(p);p=r*p*2.0;a*=0.5;}return s;}
float grain(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}

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
  float dotBright = 0.18 + aurora*0.65;

  float mDist = length(p - uMouse);
  float mGlow = exp(-mDist*mDist/42000.0);
  float mLocal = exp(-mDist*mDist/120000.0);

  float hue = smoothstep(0.2, 0.9, aurora*0.6 + 0.25*fbm(uv*1.4 - vec2(t*1.3, t)));
  vec3 accSmoke = mix(uAccent, uAccent2, hue*0.62);
  vec3 accHover = uAccent;
  vec3 dotTint = mix(accSmoke, accHover, mLocal*uMouseActive);

  vec3 baseDot = vec3(0.32,0.34,0.40);
  vec3 dotColor = mix(baseDot, dotTint, 0.35 + mLocal*uMouseActive*0.85);
  vec3 col = vec3(0.0);
  col += gridDot * dotColor * dotBright * (0.55 + mLocal*uMouseActive*0.5);
  col += accSmoke * aurora*aurora * 0.05;
  col += accHover * mGlow * uMouseActive * 0.42;
  col += (grain(p+uTime*13.0)-0.5) * 0.006;
  vec2 vc = p/uResolution - 0.5;
  col *= 0.45 + (1.0 - smoothstep(0.30,0.85,length(vc))) * 0.55;

  vec3 pageBg = vec3(0.052,0.055,0.062);
  gl_FragColor = vec4(pageBg + col, 1.0);
}
`;

export const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
void main(){ gl_FragColor = texture2D(uScene, vUv); }
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
uniform float uReveal;

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(-vP);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

  vec2 suv = gl_FragCoord.xy / uRes;
  vec2 refrUV = clamp(suv + N.xy * 0.16, 0.002, 0.998);
  vec3 refr = texture2D(uScene, refrUV).rgb;
  vec2 reflUV = clamp(suv - N.xy * 0.34, 0.002, 0.998);
  vec3 refl = texture2D(uScene, reflUV).rgb;

  vec3 col = mix(refr, refl, fres * 0.85);
  col += uAccent * fres * 0.16;
  col += vec3(0.04, 0.045, 0.05);
  col *= 0.74 + 0.26 * clamp(N.z * 0.5 + 0.5, 0.0, 1.0);
  col += vec3(0.7, 0.74, 0.8) * pow(fres, 2.0) * 0.5;

  float alpha = (0.85 + fres * 0.15) * uReveal;
  gl_FragColor = vec4(col, alpha);
}
`;
