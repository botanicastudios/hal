import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HAL, HALPreset, HALAnimationParams } from '../src';

const presets: HALPreset[] = ['idle', 'listening', 'thinking', 'speaking', 'asleep'];

const colorOptions = [
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Mono', color: '#6b7280' },
];

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [heroPreset, setHeroPreset] = useState<HALPreset>('listening');
  const [playgroundPreset, setPlaygroundPreset] = useState<HALPreset>('idle');
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [listeningColor, setListeningColor] = useState('#ef4444');
  const [showReflections, setShowReflections] = useState(false);
  const [reflectionIntensity, setReflectionIntensity] = useState(0.6);
  const [orbSize, setOrbSize] = useState(220);
  const [transitionSpeed, setTransitionSpeed] = useState(1.0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [animation, setAnimation] = useState<HALAnimationParams>({
    pulseSpeed: 2.0,
    pulseAmount: 0.05,
    cloudSpeed: 0.3,
    cloudIntensity: 0.45,
    highlightDrift: 1.0,
    highlightSize: 0.5,
    highlightPulse: 0.15,
  });

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const updateAnimation = (key: keyof HALAnimationParams, value: number) => {
    setAnimation(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="logo">HAL</div>
        <div className="theme-toggle">
          <button
            className={theme === 'dark' ? 'active' : ''}
            onClick={() => setTheme('dark')}
            aria-label="Dark mode"
          >
            🌙
          </button>
          <button
            className={theme === 'light' ? 'active' : ''}
            onClick={() => setTheme('light')}
            aria-label="Light mode"
          >
            ☀️
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-orb">
          <HAL preset={heroPreset} size={280} reflections={{ enabled: true, intensity: 0.85 }} />
        </div>
        <h1>AI Persona Orb</h1>
        <p>A beautiful, animated WebGL component for React. Perfect for AI assistants, voice interfaces, and creative applications.</p>
        <div className="hero-controls">
          {presets.map(p => (
            <button
              key={p}
              className={`btn ${heroPreset === p ? 'active' : ''}`}
              onClick={() => setHeroPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Presets */}
      <section className="section">
        <div className="section-header">
          <h2>Presets</h2>
          <p>Five carefully crafted animation states for different contexts</p>
        </div>
        <div className="preset-grid">
          {presets.map(p => (
            <div key={p} className="preset-card">
              <HAL preset={p} size={120} />
              <span className="preset-label">{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section className="section color-section">
        <div className="section-header">
          <h2>Colors</h2>
          <p>Automatic color scheme generation from any base color</p>
        </div>
        <div className="color-grid">
          {colorOptions.map(({ name, color }) => (
            <div key={name} className="color-card">
              <HAL preset="idle" size={100} color={color} />
              <span className="color-label">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reflections */}
      <section className="section">
        <div className="section-header">
          <h2>Glass Reflections</h2>
          <p>Optional HAL 9000-style glass reflections for that classic sci-fi look</p>
        </div>
        <div className="reflections-demo">
          <div className="reflection-card">
            <HAL preset="listening" size={180} />
            <div className="label">Without Reflections</div>
          </div>
          <div className="reflection-card">
            <HAL preset="listening" size={180} reflections />
            <div className="label">With Reflections</div>
          </div>
        </div>
      </section>

      {/* Playground - Full Props Documentation */}
      <section className="section">
        <div className="section-header">
          <h2>Playground</h2>
          <p>Explore all component options and customize every parameter</p>
        </div>
        <div className="playground">
          <HAL
            preset={playgroundPreset}
            size={orbSize}
            color={baseColor}
            presetColors={{ listening: listeningColor }}
            reflections={showReflections ? { enabled: true, intensity: reflectionIntensity } : false}
            transitionSpeed={transitionSpeed}
            animation={showAdvanced ? animation : undefined}
          />

          <div className="playground-controls">
            {/* Preset Selection */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-section-title">preset</span>
                <span className="control-section-type">HALPreset</span>
              </div>
              <div className="control-row">
                {presets.map(p => (
                  <button
                    key={p}
                    className={`btn ${playgroundPreset === p ? 'active' : ''}`}
                    onClick={() => setPlaygroundPreset(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-section-title">size</span>
                <span className="control-section-type">number</span>
                <span className="control-value">{orbSize}px</span>
              </div>
              <input
                type="range"
                className="slider"
                min="100"
                max="400"
                step="10"
                value={orbSize}
                onChange={e => setOrbSize(Number(e.target.value))}
              />
            </div>

            {/* Colors */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-section-title">color / presetColors</span>
                <span className="control-section-type">string / object</span>
              </div>
              <div className="control-row">
                <span className="control-label">Base Color</span>
                <input
                  type="color"
                  className="color-input"
                  value={baseColor}
                  onChange={e => setBaseColor(e.target.value)}
                />
                <span className="control-label">Listening</span>
                <input
                  type="color"
                  className="color-input"
                  value={listeningColor}
                  onChange={e => setListeningColor(e.target.value)}
                />
              </div>
            </div>

            {/* Reflections */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-section-title">reflections</span>
                <span className="control-section-type">boolean | HALReflectionOptions</span>
              </div>
              <div className="control-row">
                <button
                  className={`toggle-btn ${showReflections ? 'active' : ''}`}
                  onClick={() => setShowReflections(!showReflections)}
                >
                  {showReflections ? 'Enabled' : 'Disabled'}
                </button>
                {showReflections && (
                  <>
                    <span className="control-label">Intensity</span>
                    <input
                      type="range"
                      className="slider slider-inline"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={reflectionIntensity}
                      onChange={e => setReflectionIntensity(Number(e.target.value))}
                    />
                    <span className="control-value">{reflectionIntensity.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Transition Speed */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-section-title">transitionSpeed</span>
                <span className="control-section-type">number</span>
                <span className="control-value">{transitionSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                className="slider"
                min="0.1"
                max="3"
                step="0.1"
                value={transitionSpeed}
                onChange={e => setTransitionSpeed(Number(e.target.value))}
              />
            </div>

            {/* Advanced Animation Controls */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-section-title">animation</span>
                <span className="control-section-type">HALAnimationParams</span>
                <button
                  className={`toggle-btn small ${showAdvanced ? 'active' : ''}`}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Custom' : 'Preset Default'}
                </button>
              </div>

              {showAdvanced && (
                <div className="advanced-grid">
                  <div className="slider-group">
                    <div className="slider-header">
                      <span>pulseSpeed</span>
                      <span className="slider-value">{animation.pulseSpeed?.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0.2"
                      max="8"
                      step="0.2"
                      value={animation.pulseSpeed}
                      onChange={e => updateAnimation('pulseSpeed', Number(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span>pulseAmount</span>
                      <span className="slider-value">{animation.pulseAmount?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0.01"
                      max="0.15"
                      step="0.01"
                      value={animation.pulseAmount}
                      onChange={e => updateAnimation('pulseAmount', Number(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span>cloudSpeed</span>
                      <span className="slider-value">{animation.cloudSpeed?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0.04"
                      max="1"
                      step="0.02"
                      value={animation.cloudSpeed}
                      onChange={e => updateAnimation('cloudSpeed', Number(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span>cloudIntensity</span>
                      <span className="slider-value">{animation.cloudIntensity?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={animation.cloudIntensity}
                      onChange={e => updateAnimation('cloudIntensity', Number(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span>highlightDrift</span>
                      <span className="slider-value">{animation.highlightDrift?.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0"
                      max="4"
                      step="0.1"
                      value={animation.highlightDrift}
                      onChange={e => updateAnimation('highlightDrift', Number(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span>highlightSize</span>
                      <span className="slider-value">{animation.highlightSize?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={animation.highlightSize}
                      onChange={e => updateAnimation('highlightSize', Number(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span>highlightPulse</span>
                      <span className="slider-value">{animation.highlightPulse?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0.02"
                      max="0.35"
                      step="0.01"
                      value={animation.highlightPulse}
                      onChange={e => updateAnimation('highlightPulse', Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="section code-section">
        <div className="section-header">
          <h2>API Reference</h2>
          <p>Complete props documentation</p>
        </div>

        <div className="api-table-wrapper">
          <table className="api-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>preset</code></td>
                <td><code>'idle' | 'listening' | 'thinking' | 'speaking' | 'asleep'</code></td>
                <td><code>'idle'</code></td>
                <td>Animation preset state</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>number</code></td>
                <td><code>300</code></td>
                <td>Size in pixels (sets both width and height)</td>
              </tr>
              <tr>
                <td><code>width</code></td>
                <td><code>number</code></td>
                <td>—</td>
                <td>Width in pixels (overrides size)</td>
              </tr>
              <tr>
                <td><code>height</code></td>
                <td><code>number</code></td>
                <td>—</td>
                <td>Height in pixels (overrides size)</td>
              </tr>
              <tr>
                <td><code>color</code></td>
                <td><code>string</code></td>
                <td>—</td>
                <td>Base color as hex (e.g., "#3b82f6")</td>
              </tr>
              <tr>
                <td><code>presetColors</code></td>
                <td><code>{'{ [preset]: string }'}</code></td>
                <td>—</td>
                <td>Override colors for specific presets</td>
              </tr>
              <tr>
                <td><code>colorScheme</code></td>
                <td><code>HALColorScheme</code></td>
                <td>—</td>
                <td>Direct RGB control with base, mid, highlight</td>
              </tr>
              <tr>
                <td><code>reflections</code></td>
                <td><code>boolean | HALReflectionOptions</code></td>
                <td><code>false</code></td>
                <td>Enable HAL 9000-style glass reflections</td>
              </tr>
              <tr>
                <td><code>animation</code></td>
                <td><code>HALAnimationParams</code></td>
                <td>—</td>
                <td>Fine-grained animation control</td>
              </tr>
              <tr>
                <td><code>transitionSpeed</code></td>
                <td><code>number</code></td>
                <td><code>1.0</code></td>
                <td>Transition speed multiplier</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>—</td>
                <td>CSS class name</td>
              </tr>
              <tr>
                <td><code>style</code></td>
                <td><code>CSSProperties</code></td>
                <td>—</td>
                <td>Inline styles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Code Examples */}
      <section className="section">
        <div className="section-header">
          <h2>Usage Examples</h2>
          <p>Common patterns and configurations</p>
        </div>
        <div className="code-grid">
          <div className="code-block">
            <div className="code-header">Basic</div>
            <div className="code-content">
              <span className="comment">// Simple preset</span><br/>
              <span className="tag">&lt;HAL</span> <span className="attr">preset</span>=<span className="string">"listening"</span> <span className="tag">/&gt;</span><br/><br/>
              <span className="comment">// Custom size</span><br/>
              <span className="tag">&lt;HAL</span> <span className="attr">preset</span>=<span className="string">"speaking"</span> <span className="attr">size</span>=<span className="string">{'{200}'}</span> <span className="tag">/&gt;</span>
            </div>
          </div>
          <div className="code-block">
            <div className="code-header">Custom Colors</div>
            <div className="code-content">
              <span className="comment">// Base color</span><br/>
              <span className="tag">&lt;HAL</span> <span className="attr">color</span>=<span className="string">"#8b5cf6"</span> <span className="tag">/&gt;</span><br/><br/>
              <span className="comment">// Per-preset colors</span><br/>
              <span className="tag">&lt;HAL</span><br/>
              &nbsp;&nbsp;<span className="attr">presetColors</span>={'={{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">listening</span>: <span className="string">"#22c55e"</span><br/>
              &nbsp;&nbsp;{'}}'}<br/>
              <span className="tag">/&gt;</span>
            </div>
          </div>
          <div className="code-block">
            <div className="code-header">Reflections</div>
            <div className="code-content">
              <span className="comment">// Enable reflections</span><br/>
              <span className="tag">&lt;HAL</span> <span className="attr">reflections</span> <span className="tag">/&gt;</span><br/><br/>
              <span className="comment">// Custom intensity</span><br/>
              <span className="tag">&lt;HAL</span><br/>
              &nbsp;&nbsp;<span className="attr">reflections</span>={'={{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">enabled</span>: <span className="keyword">true</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">intensity</span>: <span className="string">0.8</span><br/>
              &nbsp;&nbsp;{'}}'}<br/>
              <span className="tag">/&gt;</span>
            </div>
          </div>
          <div className="code-block">
            <div className="code-header">Animation Control</div>
            <div className="code-content">
              <span className="tag">&lt;HAL</span><br/>
              &nbsp;&nbsp;<span className="attr">preset</span>=<span className="string">"idle"</span><br/>
              &nbsp;&nbsp;<span className="attr">animation</span>={'={{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">highlightSize</span>: <span className="string">0.8</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">highlightDrift</span>: <span className="string">0</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">cloudSpeed</span>: <span className="string">0.5</span><br/>
              &nbsp;&nbsp;{'}}'}<br/>
              <span className="tag">/&gt;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        Heavily inspired by <a href="https://elements.ai-sdk.dev/" target="_blank" rel="noopener noreferrer">Vercel's AI Elements</a>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
