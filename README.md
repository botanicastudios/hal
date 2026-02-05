# HAL Orb

A beautiful, animated WebGL orb component for React. Perfect for AI assistants, voice interfaces, and creative applications.

Heavily inspired by [Vercel's AI Elements](https://elements.ai-sdk.dev/).

![HAL Orb](https://img.shields.io/npm/v/hal-orb)

## Installation

```bash
npm install hal-orb
```

## Quick Start

```tsx
import { HAL } from 'hal-orb';

function App() {
  return <HAL preset="thinking" />;
}
```

## Presets

| Preset | Description |
|--------|-------------|
| `idle` | Calm, subtle animation with small highlight |
| `listening` | Red/magenta color, centered pulsing highlight |
| `thinking` | Active clouds, medium drifting highlight |
| `speaking` | Very active, large fast-moving highlight |
| `asleep` | Dimmed, minimal animation |

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `'idle' \| 'listening' \| 'thinking' \| 'speaking' \| 'asleep'` | `'idle'` | Animation preset |
| `width` | `number` | `300` | Width in pixels |
| `height` | `number` | `300` | Height in pixels |
| `reflections` | `boolean` | `false` | Show HAL 9000-style glass reflections |

### Color Props

| Prop | Type | Description |
|------|------|-------------|
| `baseColor` | `string` | Base color as hex (e.g., `"#2563eb"`). Generates full color scheme. |
| `presetColors` | `object` | Override colors for specific presets |
| `colorScheme` | `object` | Direct RGB control |

### Animation Props

| Prop | Type | Description |
|------|------|-------------|
| `animation` | `HALAnimationParams` | Fine-grained animation control (merged with preset) |
| `transitionSpeed` | `number` | Transition speed multiplier (default: 1.0) |

## Examples

### With HAL 9000 Reflections

```tsx
<HAL preset="listening" reflections />
```

### Custom Colors

```tsx
// Purple theme
<HAL preset="idle" baseColor="#8B5CF6" />

// Custom listening color
<HAL
  preset="listening"
  presetColors={{ listening: { core: '#22c55e', glow: '#4ade80' } }}
/>
```

### Custom Animation

```tsx
<HAL
  preset="idle"
  animation={{
    highlightSize: 0.8,
    highlightDrift: 1.0,
    cloudSpeed: 0.3
  }}
/>
```

### Direct Color Control

```tsx
<HAL
  preset="idle"
  colorScheme={{
    base: [0.1, 0.1, 0.3],
    mid: [0.2, 0.3, 0.6],
    highlight: [0.5, 0.7, 1.0]
  }}
/>
```

## Animation Parameters

```tsx
interface HALAnimationParams {
  pulseSpeed?: number;      // 0.2 - 6.0
  pulseAmount?: number;     // 0.01 - 0.1
  cloudSpeed?: number;      // 0.04 - 0.85
  cloudIntensity?: number;  // 0.15 - 0.7
  highlightDrift?: number;  // 0 (centered) - 3.2 (very active)
  highlightSize?: number;   // 0.25 - 1.2
  highlightPulse?: number;  // 0.05 - 0.25
}
```

## Development

```bash
# Install dependencies
npm install

# Run demo
npm run dev

# Build library
npm run build
```

## License

MIT

## Credits

Heavily inspired by [Vercel's AI Elements](https://elements.ai-sdk.dev/).
