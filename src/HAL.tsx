import React, { useRef, useEffect, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export type HALPreset = 'idle' | 'listening' | 'thinking' | 'speaking' | 'asleep';

export interface HALAnimationParams {
  /** Speed of the overall pulse animation (0.2 - 6.0) */
  pulseSpeed?: number;
  /** Amount of size pulsing (0.01 - 0.1) */
  pulseAmount?: number;
  /** Speed of cloud texture animation (0.04 - 0.85) */
  cloudSpeed?: number;
  /** Intensity of cloud textures (0.15 - 0.7) */
  cloudIntensity?: number;
  /** Amount of highlight drift/movement (0 = centered, 3.2 = very active) */
  highlightDrift?: number;
  /** Size of the white highlight (0.25 - 1.2) */
  highlightSize?: number;
  /** Amount the highlight pulses in size (0.05 - 0.25) */
  highlightPulse?: number;
}

export interface HALReflectionOptions {
  /** Enable glass reflections (default: false) */
  enabled?: boolean;
  /** Intensity of reflections (0 - 1, default: 0.6) */
  intensity?: number;
}

export interface HALColorScheme {
  /** Base/dark color [r, g, b] values 0-1 */
  base?: [number, number, number];
  /** Mid-tone color [r, g, b] values 0-1 */
  mid?: [number, number, number];
  /** Highlight color [r, g, b] values 0-1 */
  highlight?: [number, number, number];
}

export interface HALProps {
  /** Preset animation state */
  preset?: HALPreset;
  /** Size in pixels (default: 300) - sets both width and height */
  size?: number;
  /** Width in pixels (overrides size) */
  width?: number;
  /** Height in pixels (overrides size) */
  height?: number;
  /** Base color as hex string (e.g., "#2563eb") - generates full color scheme */
  color?: string;
  /** Override colors for specific presets */
  presetColors?: Partial<Record<HALPreset, string>>;
  /** Fine-grained color control (overrides color prop) */
  colorScheme?: HALColorScheme;
  /** Fine-grained animation control (merged with preset defaults) */
  animation?: HALAnimationParams;
  /** Transition speed multiplier (default: 1.0, higher = faster) */
  transitionSpeed?: number;
  /** Glass reflections like HAL 9000 */
  reflections?: boolean | HALReflectionOptions;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Preset Configurations
// ============================================================================

const PRESET_ANIMATIONS: Record<HALPreset, Required<HALAnimationParams>> = {
  idle: {
    pulseSpeed: 0.8,
    pulseAmount: 0.02,
    cloudSpeed: 0.12,
    cloudIntensity: 0.35,
    highlightDrift: 0.25,
    highlightSize: 0.35,
    highlightPulse: 0.1,
  },
  listening: {
    pulseSpeed: 2.5,
    pulseAmount: 0.05,
    cloudSpeed: 0.35,
    cloudIntensity: 0.5,
    highlightDrift: 0.0, // Centered
    highlightSize: 0.5,
    highlightPulse: 0.25,
  },
  thinking: {
    pulseSpeed: 2.5,
    pulseAmount: 0.05,
    cloudSpeed: 0.4,
    cloudIntensity: 0.55,
    highlightDrift: 1.2,
    highlightSize: 0.65,
    highlightPulse: 0.12,
  },
  speaking: {
    pulseSpeed: 6.0,
    pulseAmount: 0.08,
    cloudSpeed: 0.85,
    cloudIntensity: 0.7,
    highlightDrift: 3.2,
    highlightSize: 1.2,
    highlightPulse: 0.2,
  },
  asleep: {
    pulseSpeed: 0.2,
    pulseAmount: 0.01,
    cloudSpeed: 0.04,
    cloudIntensity: 0.15,
    highlightDrift: 0.08,
    highlightSize: 0.12,  // Much smaller highlight
    highlightPulse: 0.02, // Minimal pulsing
  },
};

const PRESET_COLORS: Record<string, HALColorScheme> = {
  blue: {
    base: [0.08, 0.18, 0.55],
    mid: [0.15, 0.35, 0.75],
    highlight: [0.5, 0.75, 1.0],
  },
  red: {
    base: [0.6, 0.08, 0.15],
    mid: [0.85, 0.15, 0.25],
    highlight: [1.0, 0.5, 0.6],
  },
};

// Default color for listening state
const LISTENING_COLOR: HALColorScheme = PRESET_COLORS.red;

// ============================================================================
// Utility Functions
// ============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0.15, 0.35, 0.75]; // Default blue
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

function generateColorScheme(baseRgb: [number, number, number]): HALColorScheme {
  const [r, g, b] = baseRgb;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // Monochrome mode for low saturation
  if (saturation < 0.1) {
    return {
      base: [luminance * 0.4, luminance * 0.4, luminance * 0.4],
      mid: [luminance * 0.8, luminance * 0.8, luminance * 0.8],
      highlight: [0.95, 0.95, 0.95],
    };
  }

  return {
    base: [r * 0.5, g * 0.5, b * 0.5],
    mid: [Math.min(1, r * 1.2), Math.min(1, g * 1.2), Math.min(1, b * 1.2)],
    highlight: [
      Math.min(1, r * 0.5 + 0.5),
      Math.min(1, g * 0.5 + 0.5),
      Math.min(1, b * 0.5 + 0.5),
    ],
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_baseColor;
  uniform vec3 u_midColor;
  uniform vec3 u_highlight;
  uniform float u_pulseSpeed;
  uniform float u_pulseAmount;
  uniform float u_cloudSpeed;
  uniform float u_cloudIntensity;
  uniform float u_highlightDrift;
  uniform float u_highlightSize;
  uniform float u_highlightPulse;
  uniform float u_reflections;

  varying vec2 v_uv;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  float roundRectMask(vec2 p, vec2 halfSize, float radius, float softness) {
    float d = sdRoundRect(p, halfSize, radius);
    float aa = 2.0 / min(u_resolution.x, u_resolution.y);
    float m = 1.0 - smoothstep(0.0, aa + softness, d);
    float depth = min(halfSize.x, halfSize.y) * 0.85;
    float taper = 1.0 - smoothstep(-depth, 0.0, d);
    return m * taper;
  }

  float ringMask(vec2 p, vec2 center, float radius, float halfWidth, float softness) {
    float d = abs(length(p - center) - radius);
    float aa = 2.0 / min(u_resolution.x, u_resolution.y);
    float m = 1.0 - smoothstep(halfWidth, halfWidth + aa + softness, d);
    float taper = 1.0 - smoothstep(0.0, halfWidth, d);
    return m * taper;
  }

  void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    float dist = length(uv);

    // Sphere parameters - crisp edges
    float sphereRadius = 0.72;
    float edgeSoftness = 0.008;
    float sphere = 1.0 - smoothstep(sphereRadius - edgeSoftness, sphereRadius, dist);

    if (sphere < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    // 3D sphere normal
    float z = sqrt(max(0.0, 1.0 - (uv.x * uv.x + uv.y * uv.y) / (sphereRadius * sphereRadius)));
    vec3 normal = normalize(vec3(uv.x / sphereRadius, uv.y / sphereRadius, z));

    // Spherical coordinates for cloud mapping
    float theta = atan(normal.x, normal.z);
    float phi = acos(clamp(normal.y, -1.0, 1.0));

    // Animated clouds
    float cloudTime = u_time * u_cloudSpeed;
    vec3 cloudPos1 = vec3(theta * 1.8 + cloudTime, phi * 1.8, cloudTime * 0.4);
    vec3 cloudPos2 = vec3(theta * 1.2 - cloudTime * 0.6, phi * 1.2 + cloudTime * 0.25, cloudTime * 0.25);
    vec3 cloudPos3 = vec3(theta * 2.5 + cloudTime * 0.35, phi * 2.5 - cloudTime * 0.15, cloudTime * 0.6);

    float clouds1 = fbm(cloudPos1) * 0.5 + 0.5;
    float clouds2 = fbm(cloudPos2) * 0.5 + 0.5;
    float clouds3 = fbm(cloudPos3 * 0.6) * 0.5 + 0.5;

    float cloudPattern = clouds1 * 0.5 + clouds2 * 0.35 + clouds3 * 0.15;
    cloudPattern = smoothstep(0.25, 0.75, cloudPattern);

    // Highlight position - centered when drift is 0
    float driftTime = u_time * u_highlightDrift;
    float driftAmount = min(u_highlightDrift, 1.0);
    vec2 driftOffset = vec2(
      sin(driftTime * 0.8) * 0.3 + sin(driftTime * 1.4) * 0.15 + sin(driftTime * 2.1) * 0.08,
      cos(driftTime * 0.6) * 0.25 + cos(driftTime * 1.2) * 0.1 + cos(driftTime * 1.9) * 0.06
    );
    vec2 basePosition = vec2(0.0, 0.15);
    vec2 driftPosition = vec2(-0.2, 0.25) + driftOffset;
    vec2 highlightCenter = mix(basePosition, driftPosition, driftAmount);

    // Pulsing highlight size
    float highlightPulseAmount = 1.0 + sin(u_time * u_pulseSpeed * 1.8) * u_highlightPulse
                                    + sin(u_time * u_pulseSpeed * 0.7) * u_highlightPulse * 0.5;
    float currentHighlightSize = u_highlightSize * highlightPulseAmount;

    // Lighting
    vec3 lightDir = normalize(vec3(highlightCenter.x, highlightCenter.y, 0.85));
    float diffuse = max(0.0, dot(normal, lightDir));
    diffuse = pow(diffuse, 0.85);

    // Multi-layer specular
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specVSoft = pow(max(0.0, dot(normal, halfDir)), 4.0);
    float specSoft = pow(max(0.0, dot(normal, halfDir)), 12.0);
    float specMed = pow(max(0.0, dot(normal, halfDir)), 40.0);
    float specSharp = pow(max(0.0, dot(normal, halfDir)), 150.0);

    float specular = specVSoft * currentHighlightSize * 0.4 +
                     specSoft * currentHighlightSize * 0.5 +
                     specMed * currentHighlightSize * 0.35 +
                     specSharp * 0.6;

    // Fresnel rim
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.0);

    // Global pulse
    float pulse = 1.0 + sin(u_time * u_pulseSpeed) * u_pulseAmount;

    // Color composition
    float depthGradient = pow(z, 0.6);
    vec3 baseGradient = mix(u_baseColor, u_midColor, depthGradient);

    vec3 cloudedColor = mix(u_baseColor * 0.5, u_midColor * 1.3,
                            cloudPattern * u_cloudIntensity + (1.0 - u_cloudIntensity) * 0.5);
    cloudedColor = mix(baseGradient, cloudedColor, u_cloudIntensity);

    vec3 color = cloudedColor * (0.35 + diffuse * 0.65);

    // Subsurface scattering
    float sss = pow(max(0.0, 1.0 - dist / sphereRadius), 2.0) * 0.3;
    color += u_midColor * sss * (0.6 + cloudPattern * 0.4);

    // Specular highlights
    vec3 highlightColor = mix(u_highlight, vec3(1.0), 0.4);
    color += highlightColor * specular * 1.5;

    // Bloom
    float bloom = specVSoft * currentHighlightSize;
    color += u_highlight * bloom * 0.7;
    color += vec3(1.0) * specSoft * currentHighlightSize * 0.3;

    // Rim lighting
    color += u_highlight * fresnel * 0.2;

    // Inner glow
    float innerGlow = pow(max(0.0, 1.0 - dist / sphereRadius), 2.5);
    color += u_midColor * innerGlow * 0.12;

    color *= pulse;

    // Ambient occlusion
    float ao = smoothstep(sphereRadius, sphereRadius * 0.4, dist);
    color *= ao * 0.4 + 0.6;

    // Bottom shadow
    float bottomShadow = smoothstep(-0.7, 0.4, uv.y);
    color *= bottomShadow * 0.3 + 0.7;

    // Glass reflections (HAL 9000 lens) - soft, curved, layered highlights
    if (u_reflections > 0.0) {
      // Slight warp to make reflections feel like they live on glass, not a flat overlay
      vec2 rp = uv;
      rp += normal.xy * (0.065 * (1.0 - z));
      rp.y *= 1.03;

      float soft = 0.014;
      float refCore = 0.0;
      float refGlow = 0.0;

      // Main top fluorescent tube arc (thick + inner band)
      float top = ringMask(rp, vec2(0.0, 0.06), 0.66, 0.020, soft * 0.55);
      float topY = smoothstep(0.30, 0.48, rp.y);
      top *= topY;
      top *= (1.0 - smoothstep(0.52, 0.76, abs(rp.x)));
      float topInner = ringMask(rp, vec2(0.0, 0.08), 0.62, 0.012, soft * 0.45);
      topInner *= topY;
      topInner *= (1.0 - smoothstep(0.48, 0.72, abs(rp.x)));
      float topHalo = ringMask(rp, vec2(0.0, 0.06), 0.66, 0.054, soft * 2.0) * topY;
      topHalo *= (1.0 - smoothstep(0.40, 0.78, abs(rp.x)));

      refCore += top * 1.10 + topInner * 0.85;
      refGlow += topHalo * 0.55;

      // Side arcs (subtle, like lens curvature catching strip lights)
      float sideL = ringMask(rp, vec2(0.20, 0.02), 0.48, 0.010, soft * 0.55);
      sideL *= smoothstep(-0.02, 0.16, rp.y) * (1.0 - smoothstep(0.24, 0.40, rp.y));
      sideL *= smoothstep(-0.56, -0.38, rp.x) * (1.0 - smoothstep(-0.18, -0.04, rp.x));
      refCore += sideL * 0.55;
      refGlow += ringMask(rp, vec2(0.20, 0.02), 0.48, 0.030, soft * 1.6) * sideL * 0.30;

      float sideR = ringMask(rp, vec2(-0.20, 0.02), 0.48, 0.010, soft * 0.55);
      sideR *= smoothstep(-0.02, 0.16, rp.y) * (1.0 - smoothstep(0.24, 0.40, rp.y));
      sideR *= smoothstep(0.04, 0.18, rp.x) * (1.0 - smoothstep(0.38, 0.56, rp.x));
      refCore += sideR * 0.55;
      refGlow += ringMask(rp, vec2(-0.20, 0.02), 0.48, 0.030, soft * 1.6) * sideR * 0.30;

      // Small dash reflections (softened + slightly rounded)
      float dTopL = roundRectMask(rp - vec2(-0.25, 0.62), vec2(0.115, 0.018), 0.012, soft * 0.75);
      float dTopR = roundRectMask(rp - vec2(0.25, 0.62), vec2(0.115, 0.018), 0.012, soft * 0.75);
      float dTopC = roundRectMask(rp - vec2(0.0, 0.53), vec2(0.080, 0.015), 0.011, soft * 0.75);
      float dMidL = roundRectMask(rp - vec2(-0.40, 0.22), vec2(0.040, 0.014), 0.010, soft * 0.8);
      float dMidR = roundRectMask(rp - vec2(0.40, 0.22), vec2(0.040, 0.014), 0.010, soft * 0.8);
      float dLowL = roundRectMask(rp - vec2(-0.30, -0.06), vec2(0.030, 0.012), 0.010, soft * 0.75);
      float dLowR = roundRectMask(rp - vec2(0.30, -0.06), vec2(0.030, 0.012), 0.010, soft * 0.75);
      float dBot = roundRectMask(rp - vec2(0.0, -0.36), vec2(0.050, 0.016), 0.012, soft * 0.75);

      refCore += dTopL * 0.88 + dTopR * 0.88 + dTopC * 0.55;
      refCore += dMidL * 0.62 + dMidR * 0.62;
      refCore += dLowL * 0.48 + dLowR * 0.48;
      refCore += dBot * 0.34;

      refGlow += roundRectMask(rp - vec2(-0.25, 0.62), vec2(0.140, 0.030), 0.016, soft * 2.0) * 0.20;
      refGlow += roundRectMask(rp - vec2(0.25, 0.62), vec2(0.140, 0.030), 0.016, soft * 2.0) * 0.20;
      refGlow += roundRectMask(rp - vec2(0.0, 0.53), vec2(0.110, 0.028), 0.016, soft * 2.0) * 0.12;

      // Fresnel-boosted strength (stronger near the edges, like real glass)
      float edgeBoost = mix(0.35, 1.0, clamp(fresnel * 2.4, 0.0, 1.0));
      float refMask = clamp(refCore, 0.0, 1.0);
      float glowMask = clamp(refGlow, 0.0, 1.0);
      float strength = u_reflections * edgeBoost;

      // Additive highlight + gentle lift (avoids the "flat white sticker" look)
      vec3 refColor = vec3(1.0);
      color += refColor * (refMask * 0.70 + glowMask * 0.26) * strength;
      color = mix(color, vec3(1.0), (refMask * 0.12 + glowMask * 0.07) * strength);
    }

    // Tone mapping
    vec3 finalColor = color / (color + vec3(0.45)) * 1.35;

    gl_FragColor = vec4(finalColor, sphere);
  }
`;

// ============================================================================
// Component
// ============================================================================

export const HAL: React.FC<HALProps> = ({
  preset = 'idle',
  size = 300,
  width,
  height,
  color,
  presetColors,
  colorScheme,
  animation,
  transitionSpeed = 1.0,
  reflections = false,
  className,
  style,
}) => {
  // Calculate actual dimensions
  const actualWidth = width ?? size;
  const actualHeight = height ?? size;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const animationFrameRef = useRef<number>(0);
  const currentParamsRef = useRef<{
    baseColor: [number, number, number];
    midColor: [number, number, number];
    highlight: [number, number, number];
    pulseSpeed: number;
    pulseAmount: number;
    cloudSpeed: number;
    cloudIntensity: number;
    highlightDrift: number;
    highlightSize: number;
    highlightPulse: number;
  } | null>(null);

  // Compute target state from props
  const targetState = useMemo(() => {
    // Get animation params (preset + overrides)
    const presetAnim = PRESET_ANIMATIONS[preset];
    const anim = { ...presetAnim, ...animation };

    // Get colors
    let colors: HALColorScheme;

    if (colorScheme) {
      // Direct color scheme override
      colors = {
        base: colorScheme.base || PRESET_COLORS.blue.base,
        mid: colorScheme.mid || PRESET_COLORS.blue.mid,
        highlight: colorScheme.highlight || PRESET_COLORS.blue.highlight,
      };
    } else if (preset === 'listening') {
      // Listening uses special color (red by default, or presetColors override)
      const listeningHex = presetColors?.listening;
      colors = listeningHex ? generateColorScheme(hexToRgb(listeningHex)) : LISTENING_COLOR;
    } else if (presetColors?.[preset]) {
      // Preset-specific color override
      colors = generateColorScheme(hexToRgb(presetColors[preset]!));
    } else if (color) {
      // Base color prop
      colors = generateColorScheme(hexToRgb(color));
    } else {
      // Default blue
      colors = PRESET_COLORS.blue;
    }

    // Dim colors for asleep state
    if (preset === 'asleep' && !colorScheme) {
      colors = {
        base: colors.base!.map(c => c * 0.5) as [number, number, number],
        mid: colors.mid!.map(c => c * 0.5) as [number, number, number],
        highlight: colors.highlight!.map(c => c * 0.5) as [number, number, number],
      };
    }

    return {
      baseColor: colors.base!,
      midColor: colors.mid!,
      highlight: colors.highlight!,
      ...anim,
    };
  }, [preset, color, presetColors, colorScheme, animation]);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    // Compile shaders
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    programRef.current = program;

    // Set up geometry
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    uniformsRef.current = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      baseColor: gl.getUniformLocation(program, 'u_baseColor'),
      midColor: gl.getUniformLocation(program, 'u_midColor'),
      highlight: gl.getUniformLocation(program, 'u_highlight'),
      pulseSpeed: gl.getUniformLocation(program, 'u_pulseSpeed'),
      pulseAmount: gl.getUniformLocation(program, 'u_pulseAmount'),
      cloudSpeed: gl.getUniformLocation(program, 'u_cloudSpeed'),
      cloudIntensity: gl.getUniformLocation(program, 'u_cloudIntensity'),
      highlightDrift: gl.getUniformLocation(program, 'u_highlightDrift'),
      highlightSize: gl.getUniformLocation(program, 'u_highlightSize'),
      highlightPulse: gl.getUniformLocation(program, 'u_highlightPulse'),
      reflections: gl.getUniformLocation(program, 'u_reflections'),
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Initialize current params
    currentParamsRef.current = { ...targetState };

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const uniforms = uniformsRef.current;

    if (!gl || !canvas || !currentParamsRef.current) return;

    const render = (time: number) => {
      time *= 0.001;
      const current = currentParamsRef.current!;
      const t = 0.015 * transitionSpeed;

      // Smooth transitions for visual params
      current.baseColor = lerpColor(current.baseColor, targetState.baseColor, t);
      current.midColor = lerpColor(current.midColor, targetState.midColor, t);
      current.highlight = lerpColor(current.highlight, targetState.highlight, t);
      current.highlightSize = lerp(current.highlightSize, targetState.highlightSize, t);
      current.highlightPulse = lerp(current.highlightPulse, targetState.highlightPulse, t);
      current.cloudIntensity = lerp(current.cloudIntensity, targetState.cloudIntensity, t);
      current.pulseAmount = lerp(current.pulseAmount, targetState.pulseAmount, t);

      // Speed params snap instantly
      current.pulseSpeed = targetState.pulseSpeed;
      current.cloudSpeed = targetState.cloudSpeed;
      current.highlightDrift = targetState.highlightDrift;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uniforms.time, time);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform3fv(uniforms.baseColor, current.baseColor);
      gl.uniform3fv(uniforms.midColor, current.midColor);
      gl.uniform3fv(uniforms.highlight, current.highlight);
      gl.uniform1f(uniforms.pulseSpeed, current.pulseSpeed);
      gl.uniform1f(uniforms.pulseAmount, current.pulseAmount);
      gl.uniform1f(uniforms.cloudSpeed, current.cloudSpeed);
      gl.uniform1f(uniforms.cloudIntensity, current.cloudIntensity);
      gl.uniform1f(uniforms.highlightDrift, current.highlightDrift);
      gl.uniform1f(uniforms.highlightSize, current.highlightSize);
      gl.uniform1f(uniforms.highlightPulse, current.highlightPulse);

      // Handle reflections prop
      const reflectionValue = reflections === true ? 0.6 :
        (typeof reflections === 'object' && reflections.enabled) ?
          (reflections.intensity ?? 0.6) : 0;
      gl.uniform1f(uniforms.reflections, reflectionValue);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [targetState, transitionSpeed, reflections]);

  // 2x for retina displays
  const canvasWidth = actualWidth * 2;
  const canvasHeight = actualHeight * 2;

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={className}
      style={{
        width: actualWidth,
        height: actualHeight,
        ...style,
      }}
    />
  );
};

export default HAL;
