import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const COLORS = {
  bg: 0x070312,
  mint: 0x5ed29c,
  purple: 0x9d4edd,
  violet: 0xb14eff,
  orange: 0xff6b35,
  orangeSoft: 0xff8c42,
  yellow: 0xffd94a,
  lavender: 0xb9a8ff,
  white: 0xffffff,
};

/* The galaxy + nucleus system lives here; camera keyframes orbit around it */
const SYSTEM_POS = new THREE.Vector3(3.4, -0.3, -8);

const PATH = [
  { p: [0, 1.2, 12], t: [0, -0.6, -6] },
  { p: [11, 2.5, 0], t: [0, -0.5, -8] },
  { p: [-8, -7, 2], t: [0, 0, -8] },
  { p: [1, 9, -3], t: [0, -1, -9] },
];

const smoothstep = (x) => x * x * (3 - 2 * x);
const sstep = (a, b, x) => smoothstep(THREE.MathUtils.clamp((x - a) / (b - a), 0, 1));

/* ---------- shaders ---------- */

const pointsVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uForm;
  uniform float uGather;
  attribute float aScale;
  attribute float aRand;
  attribute vec3 aScatter;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec3 pos = mix(aScatter, position, uForm);
    /* gather: everything collapses toward the core before the blast */
    pos *= (1.0 - uGather * 0.9);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.72 + 0.28 * sin(uTime * (1.2 + aRand * 2.4) + aRand * 40.0);
    /* unformed particles are smaller and dimmer; clamp keeps near ones from ballooning */
    float ps = uSize * aScale * twinkle * (320.0 / -mv.z) * mix(0.55, 1.0, uForm);
    gl_PointSize = min(ps, 22.0);
    vColor = color;
    vTwinkle = twinkle * mix(0.5, 1.05, uForm);
  }
`;

const pointsFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha = pow(alpha, 2.2);
    gl_FragColor = vec4(vColor * vTwinkle, alpha);
  }
`;

const waveVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uKick;
  varying float vElev;
  varying vec2 vUv;
  varying vec2 vPos;
  varying float vDist;
  void main() {
    vUv = uv;
    vec3 p = position;
    float e = sin(p.x * 0.14 + uTime * 0.7) * cos(p.y * 0.11 + uTime * 0.5) * 2.2;
    e += sin(p.x * 0.05 - uTime * 0.3) * 3.0;
    e += sin((p.x + p.y) * 0.28 + uTime * 1.3) * 0.5 * (1.0 + uKick);
    p.z += e * uAmp;
    vElev = e;
    vPos = position.xy;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const waveFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vElev;
  varying vec2 vUv;
  varying vec2 vPos;
  varying float vDist;

  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float d = distance(vUv, vec2(0.5));
    float fade = smoothstep(0.5, 0.12, d);

    /* depth fade: farther lines dissolve — gives the grid real depth */
    float depthFade = exp(-vDist * 0.026);

    /* random dashed cells: some patches of the grid become stitched lines */
    vec2 cell = floor(vPos / 14.0);
    float h = hash2(cell);
    float dash = 1.0;
    if (h > 0.55) {
      dash = step(0.42, fract((vPos.x + vPos.y) * 0.35));
    }

    vec3 col = mix(uColorA, uColorB, clamp(vElev * 0.22 + 0.5, 0.0, 1.0));
    float alpha = fade * uOpacity * depthFade * mix(1.0, dash, 0.85);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* Plasma core: invisible sphere holding flame-like energy that whips
   outward from the center toward one direction at a time */
const plasmaVertex = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vPos = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const plasmaFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDir;
  uniform float uOpacity;
  varying vec3 vPos;
  varying vec3 vNormalW;
  varying vec3 vViewW;

  float hash31(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
          mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
          mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise3(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 n = normalize(vPos);
    vec3 dir = normalize(uDir);
    /* flames strongest along the current direction */
    float lobe = pow(clamp(dot(n, dir), 0.0, 1.0), 2.4);
    /* sharp tendrils flowing outward along that direction */
    float f = fbm(vPos * 2.8 - dir * uTime * 1.8 + vec3(0.0, uTime * 0.15, 0.0));
    float tendril = smoothstep(0.38, 0.8, f + lobe * 0.35);
    /* faint all-around simmer so the core never dies completely */
    float base = fbm(vPos * 3.6 + vec3(0.0, uTime * 0.4, 0.0));
    float baseGlow = smoothstep(0.55, 0.95, base) * 0.5;
    float e = min(tendril * (0.35 + lobe * 1.3) + baseGlow, 1.2);

    vec3 col = mix(vec3(0.37, 0.82, 0.61), vec3(0.69, 0.31, 1.0), clamp(e * 1.2, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.42, 0.21), clamp((e - 0.5) * 2.0, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.85, 0.3), clamp((e - 0.85) * 3.0, 0.0, 1.0));

    /* whisper of a glass shell: the sphere itself stays invisible */
    float fres = pow(1.0 - abs(dot(vViewW, vNormalW)), 3.0);
    col += vec3(0.5, 0.85, 0.75) * fres * 0.3;

    float alpha = (min(e, 1.0) * 0.55 + fres * 0.1) * uOpacity;
    gl_FragColor = vec4(col * (0.55 + e * 0.45), alpha);
  }
`;

/* Expanding synth shockwave ring (lives in the galaxy plane) */
const shockVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shockFragment = /* glsl */ `
  uniform float uAge;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float ang = atan(c.y, c.x);
    float r = length(c) * 2.0;
    /* wobbly synth-wave rim */
    r += sin(ang * 7.0 + uAge * 14.0) * 0.045 + sin(ang * 13.0 - uAge * 10.0) * 0.02;
    float ring = smoothstep(0.5, 0.78, r) * (1.0 - smoothstep(0.86, 1.0, r));
    vec3 col = mix(vec3(0.37, 0.82, 0.61), vec3(0.69, 0.31, 1.0), smoothstep(0.5, 0.8, r));
    col = mix(col, vec3(1.0, 0.42, 0.21), smoothstep(0.8, 0.96, r));
    col = mix(col, vec3(1.0, 0.87, 0.35), pow(1.0 - uAge, 3.0) * 0.55);
    gl_FragColor = vec4(col * 1.5, ring * (1.0 - uAge));
  }
`;

/* Final pass: chromatic shift + zone effects (glitch / ripple / pixel) + scanlines + vignette */
const SynthShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uRipple: { value: 0 },
    uPixel: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGlitch;
    uniform float uRipple;
    uniform float uPixel;
    varying vec2 vUv;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    float hash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 uv = vUv;
      float g = uGlitch;

      /* about: analog ripple — slow CRT-like wobble */
      uv.x += uRipple * sin(uv.y * 20.0 + uTime * 1.3) * 0.0035;
      uv.y += uRipple * sin(uv.x * 14.0 - uTime * 1.0) * 0.0018;

      /* hero/projects: digital glitch — slow thin slice displacement */
      if (g > 0.003) {
        float row = floor(uv.y * 30.0);
        float r = hash(row * 43.7 + floor(uTime * 9.0) * 7.3);
        if (r > 1.0 - 0.3 * g) {
          uv.x += (hash(row * 91.3 + floor(uTime * 11.0)) - 0.5) * 0.035 * g;
        }
      }

      /* chromatic shift: subtle at rest, a bit more during effects */
      float shift = 0.0008 + g * 0.0042 + uRipple * 0.0012;
      float cr = texture2D(tDiffuse, uv + vec2(shift, 0.0)).r;
      float cg = texture2D(tDiffuse, uv).g;
      float cb = texture2D(tDiffuse, uv - vec2(shift, 0.0)).b;
      vec3 col = vec3(cr, cg, cb);

      /* anamorphic streak flare: bright spots smear horizontally, cool tint */
      vec3 streak = vec3(0.0);
      for (int i = 1; i <= 6; i++) {
        float o = float(i) * 0.008;
        streak += max(texture2D(tDiffuse, uv + vec2(o, 0.0)).rgb - 0.6, 0.0);
        streak += max(texture2D(tDiffuse, uv - vec2(o, 0.0)).rgb - 0.6, 0.0);
      }
      col += streak / 12.0 * vec3(0.55, 0.65, 1.15) * (0.5 + uPixel * 0.5);

      /* fine film grain, slightly stronger on the last page */
      col += (hash2(uv * 700.0 + uTime) - 0.5) * (0.015 + 0.03 * uPixel);

      /* scanlines */
      col *= 0.98 + 0.02 * sin(uv.y * 900.0 + uTime * 8.0);

      /* warm cinematic veil */
      col = col * vec3(1.05, 1.0, 0.92) + vec3(0.018, 0.011, 0.006);

      /* elliptical anamorphic vignette */
      float d = length((uv - vec2(0.5)) * vec2(1.0, 1.3));
      col *= smoothstep(1.05, 0.34, d);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/* ---------- scene manager ---------- */

export default class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.isMobile = window.innerWidth < 768;
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.scroll = { progress: 0, target: 0, velocity: 0 };
    this.glitch = 0;
    this.nextGlitchAt = 2.5;
    this.exploded = false;
    this.explosionT = -1;
    this.nucleusSpread = 2.0;
    this.nucleusScale = 1.0;
    this.disposed = false;

    this._init();
    this._build();
    this._bind();
    this.renderer.setAnimationLoop(() => this._tick());
  }

  _init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    /* light supersampling on desktop for extra crispness */
    this.renderer.setPixelRatio(
      this.isMobile
        ? Math.min(window.devicePixelRatio, 1.75)
        : Math.min(window.devicePixelRatio * 1.25, 2.5)
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.bg);
    this.scene.fog = new THREE.FogExp2(COLORS.bg, 0.014);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
    this.camera.position.set(0, 1.2, 12);

    this.clock = new THREE.Clock();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7, 0.6, 0.2
    );
    this.composer.addPass(this.bloom);
    this.synthPass = new ShaderPass(SynthShader);
    this.composer.addPass(this.synthPass);
    /* FXAA last: smooths wireframes and edges for a cleaner, higher-res look */
    this.fxaa = new ShaderPass(FXAAShader);
    this._setFxaaRes();
    this.composer.addPass(this.fxaa);
  }

  _setFxaaRes() {
    const dpr = this.renderer.getPixelRatio();
    this.fxaa.material.uniforms.resolution.value.set(
      1 / (window.innerWidth * dpr),
      1 / (window.innerHeight * dpr)
    );
  }

  _pointsMaterial(size) {
    return new THREE.ShaderMaterial({
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: size },
        uForm: { value: 1 },
        uGather: { value: 0 },
      },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  _build() {
    const rnd = Math.random;

    /* -- starfield -- */
    {
      const count = this.isMobile ? 1600 : 3200;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const scale = new Float32Array(count);
      const rand = new Float32Array(count);
      const palette = [
        new THREE.Color(COLORS.white),
        new THREE.Color(COLORS.mint),
        new THREE.Color(COLORS.violet),
        new THREE.Color(COLORS.lavender),
      ];
      for (let i = 0; i < count; i++) {
        const r = 60 + rnd() * 90;
        const theta = rnd() * Math.PI * 2;
        const phi = Math.acos(2 * rnd() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        const c = palette[(rnd() * palette.length) | 0];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        scale[i] = 0.5 + rnd();
        rand[i] = rnd();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aScatter', new THREE.BufferAttribute(pos.slice(), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
      geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
      this.stars = new THREE.Points(geo, this._pointsMaterial(1.5));
      this.scene.add(this.stars);
    }

    /* -- the system: galaxy + nucleus + shockwave -- */
    this.system = new THREE.Group();
    this.system.position.copy(SYSTEM_POS);
    this.system.rotation.x = -0.38;
    this.system.rotation.z = 0.1;
    this.scene.add(this.system);

    /* galaxy points — scattered, gathered inward, then blasted into a crisp spiral */
    {
      const count = this.isMobile ? 5000 : 9000;
      const pos = new Float32Array(count * 3);
      const scatter = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const scale = new Float32Array(count);
      const rand = new Float32Array(count);
      const inner = new THREE.Color(COLORS.mint);
      const outer = new THREE.Color(COLORS.purple);
      const spark = new THREE.Color(COLORS.orange);
      for (let i = 0; i < count; i++) {
        const radius = Math.pow(rnd(), 0.65) * 24;
        const branch = ((i % 4) / 4) * Math.PI * 2;
        const spin = radius * 0.32;
        const spread = (rnd() - 0.5) * (rnd() - 0.5) * 5.5;
        pos[i * 3] = Math.cos(branch + spin) * radius + spread;
        pos[i * 3 + 1] = (rnd() - 0.5) * (rnd() - 0.5) * 3.5 * (1 - radius / 28);
        pos[i * 3 + 2] = Math.sin(branch + spin) * radius + spread;

        const sr = 6 + Math.pow(rnd(), 0.5) * 28;
        const st = rnd() * Math.PI * 2;
        const sp = Math.acos(2 * rnd() - 1);
        scatter[i * 3] = sr * Math.sin(sp) * Math.cos(st);
        scatter[i * 3 + 1] = sr * Math.cos(sp) * 0.55;
        scatter[i * 3 + 2] = sr * Math.sin(sp) * Math.sin(st);

        const c = rnd() > 0.965 ? spark : inner.clone().lerp(outer, Math.min(radius / 21, 1));
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        scale[i] = 0.5 + rnd() * 1.3;
        rand[i] = rnd();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
      geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
      this.galaxy = new THREE.Points(geo, this._pointsMaterial(1.5));
      this.system.add(this.galaxy);
    }

    /* randomized materials shared by nucleus + foreshadow seeds */
    const ballPalette = [
      COLORS.mint, COLORS.purple, COLORS.violet, COLORS.orange,
      COLORS.yellow, COLORS.lavender, COLORS.orangeSoft, 0x4ecdc4, 0xe4f5ec,
    ];
    const ballMats = ballPalette.map((c) =>
      new THREE.MeshStandardMaterial({
        color: c, roughness: 0.3 + rnd() * 0.2, metalness: 0.15,
        emissive: c, emissiveIntensity: 0.3 + rnd() * 0.15,
      })
    );
    const matFor = () => ballMats[(rnd() * ballMats.length) | 0];

    /* nucleus: smaller, sharper mix of spheres / cubes / diamonds / hex prisms */
    {
      this.nucleus = new THREE.Group();
      this.nucleusBalls = [];

      const geoms = {
        sphere: new THREE.SphereGeometry(0.46, 32, 32),
        box: new THREE.BoxGeometry(0.68, 0.68, 0.68),
        octa: new THREE.OctahedronGeometry(0.52, 0),
        hex: new THREE.CylinderGeometry(0.42, 0.42, 0.34, 6),
      };
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.3,
      });
      const kinds = ['sphere', 'sphere', 'box', 'sphere', 'octa', 'sphere', 'hex'];

      const positions = [[0, 0, 0]];
      const shells = [
        [12, 0.95],
        [22, 1.75],
      ];
      for (const [n, r] of shells) {
        for (let i = 0; i < n; i++) {
          const t = ((i + 0.5) / n) * Math.PI * 2;
          const y = Math.acos(2 * ((i + 0.5) / n) - 1);
          const jitter = () => (rnd() - 0.5) * 0.2;
          positions.push([
            r * Math.sin(y) * Math.cos(t * 3.883) + jitter(),
            r * Math.sin(y) * Math.sin(t * 3.883) + jitter(),
            r * Math.cos(y) + jitter(),
          ]);
        }
      }
      positions.forEach(([x, y, z], i) => {
        const kind = kinds[i % kinds.length];
        const mesh = new THREE.Mesh(geoms[kind], matFor());
        const s = 0.7 + rnd() * 0.3;
        mesh.scale.setScalar(s);
        if (kind !== 'sphere') {
          mesh.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
          /* crisp edge outline on the faceted shapes */
          mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoms[kind]), edgeMat));
        }
        mesh.userData.base = new THREE.Vector3(x, y, z);
        mesh.userData.s = s;
        this.nucleus.add(mesh);
        this.nucleusBalls.push(mesh);
      });

      /* plasma core: fades in once the blast has fused the pieces */
      this.plasma = new THREE.Mesh(
        new THREE.SphereGeometry(1.7, 48, 48),
        new THREE.ShaderMaterial({
          vertexShader: plasmaVertex,
          fragmentShader: plasmaFragment,
          uniforms: {
            uTime: { value: 0 },
            uDir: { value: new THREE.Vector3(1, 0, 0) },
            uOpacity: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        })
      );
      this.plasma.visible = false;
      this.nucleus.add(this.plasma);
      this.plasmaMix = 0;
      this.plasmaDir = new THREE.Vector3(1, 0, 0);
      this.plasmaTargetDir = new THREE.Vector3(1, 0, 0);
      this.nextDirAt = 0;

      /* electron orbits: mint, violet, orange + new yellow and soft-orange */
      this.electrons = [];
      const orbitSpecs = [
        [3.9, COLORS.mint, 0.55],
        [4.7, COLORS.violet, 0.5],
        [5.5, COLORS.orange, 0.45],
        [6.2, COLORS.yellow, 0.62],
        [6.9, COLORS.orangeSoft, 0.38],
      ];
      for (const [r, color, speed] of orbitSpecs) {
        const orbit = new THREE.Group();
        orbit.rotation.x = (rnd() - 0.5) * 2.4;
        orbit.rotation.y = rnd() * Math.PI;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r, 0.01, 6, 120),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18 })
        );
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 16, 16),
          new THREE.MeshBasicMaterial({ color })
        );
        orbit.add(ring, electron);
        this.nucleus.add(orbit);
        this.electrons.push({ orbit, electron, r, speed, phase: rnd() * Math.PI * 2 });
      }

      this.system.add(this.nucleus);
    }

    /* foreshadow seeds: a few mid-size spheres drifting where the galaxy will form */
    {
      this.seeds = [];
      const seedGeo = new THREE.SphereGeometry(1, 24, 24);
      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(seedGeo, matFor());
        const radius = 9 + rnd() * 11;
        const angle = rnd() * Math.PI * 2;
        const y = (rnd() - 0.5) * 6;
        const baseScale = 0.45 + rnd() * 0.4;
        mesh.userData = { radius, angle, y, baseScale, speed: 0.04 + rnd() * 0.05 };
        this.system.add(mesh);
        this.seeds.push(mesh);
      }
    }

    /* lightning bolts: sparse electric arcs inside the formed galaxy */
    {
      this.bolts = [];
      this.nextBoltAt = 0;
      for (let i = 0; i < 2; i++) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(14 * 3), 3));
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: 0xdfe8ff, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })
        );
        line.visible = false;
        /* child of the galaxy points so arcs rotate with the spiral arms */
        this.galaxy.add(line);
        this.bolts.push({ line, life: 0, branch: 0, r0: 0, r1: 0, chain: 0 });
      }
    }

    /* shockwave: ring in the galaxy plane + expanding wireframe sphere */
    {
      this.shock = new THREE.Mesh(
        new THREE.CircleGeometry(1, 72),
        new THREE.ShaderMaterial({
          vertexShader: shockVertex,
          fragmentShader: shockFragment,
          uniforms: { uAge: { value: 1 } },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        })
      );
      this.shock.rotation.x = -Math.PI / 2;
      this.shock.visible = false;
      this.system.add(this.shock);

      this.shockSphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          color: COLORS.mint, wireframe: true, transparent: true, opacity: 0,
        })
      );
      this.shockSphere.position.copy(SYSTEM_POS);
      this.shockSphere.visible = false;
      this.scene.add(this.shockSphere);
    }

    /* lights for the lit meshes */
    this.scene.add(new THREE.AmbientLight(0x9a8ac2, 0.7));
    const keyLight = new THREE.DirectionalLight(COLORS.mint, 1.8);
    keyLight.position.set(8, 10, 6);
    const rimLight = new THREE.DirectionalLight(COLORS.violet, 1.3);
    rimLight.position.set(-8, -5, 8);
    this.scene.add(keyLight, rimLight);

    /* -- wireframe wave grids -- */
    const makeWave = (y, z, colA, colB, opacity, amp) => {
      const geo = new THREE.PlaneGeometry(320, 320, this.isMobile ? 72 : 110, this.isMobile ? 72 : 110);
      const mat = new THREE.ShaderMaterial({
        vertexShader: waveVertex,
        fragmentShader: waveFragment,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: amp },
          uKick: { value: 0 },
          uColorA: { value: new THREE.Color(colA) },
          uColorB: { value: new THREE.Color(colB) },
          uOpacity: { value: opacity },
        },
        wireframe: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, y, z);
      this.scene.add(mesh);
      return mesh;
    };
    this.waveFloor = makeWave(-24, -28, COLORS.purple, COLORS.mint, 0.16, 0.55);
    this.waveCeil = makeWave(34, -30, COLORS.violet, COLORS.orange, 0.05, 0.35);
    this.waveCeil.rotation.x = Math.PI / 2;
  }

  _bind() {
    this._onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
      this._setFxaaRes();
    };
    this._onPointer = (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onPointer);
  }

  burst(strength = 0.6) {
    this.glitch = Math.max(this.glitch, strength);
  }

  _updateScroll() {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    this.scroll.target = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
    const prev = this.scroll.progress;
    this.scroll.progress += (this.scroll.target - this.scroll.progress) * 0.06;
    this.scroll.velocity = this.scroll.progress - prev;
    this.glitch = Math.max(this.glitch, Math.min(Math.abs(this.scroll.velocity) * 80, 0.35));
  }

  _updateCamera(t, kick) {
    const p = this.scroll.progress * (PATH.length - 1);
    const i = Math.min(Math.floor(p), PATH.length - 2);
    const s = smoothstep(p - i);
    const a = PATH[i], b = PATH[i + 1];
    const lerp = (u, v) => u + (v - u) * s;

    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;

    /* 3D positional glitch: a held random offset re-rolled ~every 90ms while glitching */
    if (!this._jolt) this._jolt = new THREE.Vector3();
    if (t - (this._joltT || 0) > 0.09) {
      this._joltT = t;
      this._jolt.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    }
    const js = this.glitch > 0.12 ? this.glitch * 0.4 : kick * 0.03;

    this.camera.position.set(
      lerp(a.p[0], b.p[0]) + this.mouse.x * 1.3 + this._jolt.x * js,
      lerp(a.p[1], b.p[1]) - this.mouse.y * 0.9 + this._jolt.y * js,
      lerp(a.p[2], b.p[2]) + this._jolt.z * js * 0.6
    );
    this._lookAt = this._lookAt || new THREE.Vector3();
    this._lookAt.set(lerp(a.t[0], b.t[0]), lerp(a.t[1], b.t[1]), lerp(a.t[2], b.t[2]));
    this.camera.lookAt(this._lookAt);
    /* slight roll while shaking */
    this.camera.rotation.z += this._jolt.x * js * 0.05;
  }

  _tick() {
    if (this.disposed) return;
    const t = this.clock.getElapsedTime();

    const beat = t * 0.75;
    const kick = Math.pow(1 - (beat - Math.floor(beat)), 3);
    const vibrato = Math.sin(t * 42) * 0.006 * (0.4 + kick);

    this._updateScroll();
    const progress = this.scroll.progress;
    this._updateCamera(t, kick);

    /* effect zones */
    const glitchZone = 1 - sstep(0.5, 0.64, progress);
    const rippleZone = sstep(0.5, 0.64, progress) * (1 - sstep(0.74, 0.86, progress));
    const pixelZone = sstep(0.74, 0.88, progress);

    if (t > this.nextGlitchAt) {
      this.glitch = Math.max(this.glitch, (0.45 + Math.random() * 0.4) * glitchZone);
      this.nextGlitchAt = t + 4 + Math.random() * 6;
    }
    this.glitch *= 0.945;

    /* ---- assimilate → explode → form ---- */
    if (!this.exploded && progress > 0.33) {
      this.exploded = true;
      this.explosionT = t;
      this.glitch = Math.max(this.glitch, 0.9);
    } else if (this.exploded && progress < 0.3) {
      /* tight hysteresis: nudging back re-arms the blast right away */
      this.exploded = false;
      this.explosionT = -1;
    }

    let expl = 0;
    if (this.explosionT >= 0) {
      const age = (t - this.explosionT) / 1.05;
      if (age < 1) {
        expl = 1 - age;
        this.shock.visible = true;
        this.shock.scale.setScalar(2 + age * 46);
        this.shock.material.uniforms.uAge.value = age;
        this.shockSphere.visible = true;
        this.shockSphere.scale.setScalar(1 + age * 24);
        this.shockSphere.material.opacity = (1 - age) * 0.45;
      } else {
        this.shock.visible = false;
        this.shockSphere.visible = false;
      }
    }

    /* galaxy: gather before the blast, sharply formed after it */
    /* spiral starts assembling right out of the blast, complete by mid-projects */
    const formTarget = this.exploded
      ? Math.max(0.35, sstep(0.34, 0.46, progress))
      : 0.2;
    const gatherTarget = this.exploded ? 0 : sstep(0.16, 0.32, progress) * 0.95;
    const gU = this.galaxy.material.uniforms;
    gU.uForm.value += (formTarget - gU.uForm.value) * 0.09;
    gU.uGather.value += (gatherTarget - gU.uGather.value) * 0.12;
    const formCur = gU.uForm.value;

    /* nucleus: loose pieces drift together, blast, then shrink & align at the core */
    const spreadTarget = this.exploded
      ? 0.85
      : 2.4 - 1.1 * sstep(0.05, 0.28, progress);
    /* the core plunges from the start of About, ending as a near-invisible spark */
    const scaleTarget = this.exploded
      ? 1 - 0.55 * sstep(0.36, 0.55, progress) - 0.42 * sstep(0.55, 0.72, progress)
      : 1.0;
    this.nucleusSpread += (spreadTarget - this.nucleusSpread) * 0.06;
    this.nucleusScale += (scaleTarget - this.nucleusScale) * 0.05;

    /* crossfade: solid pieces dissolve into the plasma core after the blast */
    this.plasmaMix += ((this.exploded ? 1 : 0) - this.plasmaMix) * 0.045;
    for (const ball of this.nucleusBalls) {
      ball.position.copy(ball.userData.base).multiplyScalar(this.nucleusSpread);
      ball.scale.setScalar(Math.max(ball.userData.s * (1 - this.plasmaMix), 0.001));
      ball.visible = this.plasmaMix < 0.97;
    }
    if (t > this.nextDirAt) {
      /* flames pick a new direction every couple of seconds */
      this.nextDirAt = t + 1.4 + Math.random() * 1.4;
      this.plasmaTargetDir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    }
    this.plasmaDir.lerp(this.plasmaTargetDir, 0.04).normalize();
    this.plasma.visible = this.plasmaMix > 0.02;
    const pU = this.plasma.material.uniforms;
    pU.uTime.value = t;
    pU.uOpacity.value = this.plasmaMix;
    pU.uDir.value.copy(this.plasmaDir);

    const align = sstep(0.6, 0.85, progress);
    const pulse = this.nucleusScale * (1 + kick * 0.05 + vibrato + expl * 0.25);
    this.nucleus.scale.setScalar(pulse);
    this.nucleus.rotation.y = t * 0.22 * (1 - align * 0.7);
    this.nucleus.rotation.x = Math.sin(t * 0.13) * 0.2 * (1 - align);
    for (const e of this.electrons) {
      const a = t * e.speed + e.phase;
      e.electron.position.set(Math.cos(a) * e.r, Math.sin(a) * e.r, 0);
    }

    /* foreshadow seeds orbit slowly and get absorbed as the galaxy forms */
    const seedFade = Math.max(0, 1 - formCur * 1.35);
    for (const seed of this.seeds) {
      const d = seed.userData;
      d.angle += d.speed * 0.016;
      seed.position.set(Math.cos(d.angle) * d.radius, d.y, Math.sin(d.angle) * d.radius);
      const s = d.baseScale * seedFade;
      seed.visible = s > 0.03;
      seed.scale.setScalar(Math.max(s, 0.001));
    }

    /* lightning: rare short arcs once the galaxy has taken shape */
    const dt = t - (this._lastT || t);
    this._lastT = t;
    /* bolts run ALONG a spiral arm: center → outward, or rim → mid (never into the core) */
    const spawnBolt = (bolt, branch = (Math.random() * 4) | 0) => {
      if (Math.random() < 0.6) {
        bolt.r0 = 5 + Math.random() * 5;
        bolt.r1 = bolt.r0 + 6 + Math.random() * 8;
      } else {
        bolt.r0 = 18 + Math.random() * 3;
        bolt.r1 = Math.max(7, bolt.r0 - (6 + Math.random() * 6));
      }
      bolt.branch = branch;
      bolt.chain = Math.random() < 0.5 ? 1 : 0;
      bolt.life = 1;
      bolt.line.visible = true;
    };
    if (formCur > 0.75 && progress > 0.55 && t > this.nextBoltAt) {
      const free = this.bolts.filter((b) => b.life <= 0);
      if (free.length) spawnBolt(free[0]);
      if (free.length > 1 && Math.random() < 0.45) spawnBolt(free[1]);
      this.nextBoltAt = t + 3 + Math.random() * 3;
    }
    for (const bolt of this.bolts) {
      if (bolt.life <= 0) continue;
      bolt.life -= dt * 1.8;
      if (bolt.life <= 0) {
        bolt.line.visible = false;
        /* bounce: the discharge re-strikes on the neighbouring arm */
        if (bolt.chain > 0 && formCur > 0.75) {
          spawnBolt(bolt, (bolt.branch + 1) % 4);
          bolt.chain = 0;
        }
        continue;
      }
      /* current flows outward along the arm's curve */
      const head = Math.min((1 - bolt.life) * 2.6, 1);
      bolt.line.geometry.setDrawRange(0, 2 + Math.floor(12 * head));
      const pos = bolt.line.geometry.attributes.position;
      for (let i = 0; i < 14; i++) {
        const f = i / 13;
        const mid = Math.sin(f * Math.PI); // endpoints stay pinned to the arm
        const r = bolt.r0 + (bolt.r1 - bolt.r0) * f;
        const ang = bolt.branch * (Math.PI / 2) + r * 0.32;
        pos.setXYZ(
          i,
          Math.cos(ang) * r + (Math.random() - 0.5) * 1.2 * mid,
          (Math.random() - 0.5) * 0.8 * mid,
          Math.sin(ang) * r + (Math.random() - 0.5) * 1.2 * mid
        );
      }
      pos.needsUpdate = true;
      bolt.line.material.opacity = bolt.life * (0.7 + 0.2 * Math.sin(t * 40));
    }

    /* fields */
    this.stars.rotation.y = t * 0.008;
    this.stars.material.uniforms.uTime.value = t;
    this.galaxy.rotation.y = t * 0.03;
    this.galaxy.material.uniforms.uTime.value = t;
    for (const wave of [this.waveFloor, this.waveCeil]) {
      wave.material.uniforms.uTime.value = t;
      wave.material.uniforms.uKick.value = kick + expl * 1.6;
    }

    /* post */
    this.bloom.strength = 0.7 + kick * 0.25 + expl * 1.2;
    this.synthPass.uniforms.uTime.value = t;
    this.synthPass.uniforms.uGlitch.value = this.glitch * Math.max(glitchZone, 0.25);
    this.synthPass.uniforms.uRipple.value = rippleZone;
    this.synthPass.uniforms.uPixel.value = pixelZone;

    this.composer.render();
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointer);
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
      }
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}
