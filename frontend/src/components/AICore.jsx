import React, { useEffect, useRef } from 'react';

const AICore = ({
  status = 'idle',
  label = '',
  size = 64,
  accent = 'signal',
  glowIntensity = 0.5,
  motionIntensity = 0.5
}) => {
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  
  // State refs for animation
  const phaseRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Base phase speed scales with motionIntensity
      const speedMap = {
        idle: 0.001,
        listening: 0.003,
        thinking: 0.002,
        speaking: 0.005,
        executing: 0.004
      };
      const baseSpeed = speedMap[status] || 0.001;
      phaseRef.current += dt * baseSpeed * (0.2 + motionIntensity * 1.6);
      
      const phase = phaseRef.current;
      const svg = svgRef.current;
      if (!svg) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // We animate different SVG elements based on status
      // We will select elements by class name inside the SVG
      
      // 1. Idle - Breathing scale
      const coreGroup = svg.querySelector('.core-group');
      if (coreGroup) {
        if (status === 'idle') {
          const scale = 1 + Math.sin(phase) * 0.05;
          coreGroup.setAttribute('transform', `scale(${scale})`);
        } else {
          coreGroup.setAttribute('transform', `scale(1)`);
        }
      }

      // 2. Listening - Concentric rings
      const listeningRings = svg.querySelectorAll('.listening-ring');
      if (status === 'listening' && listeningRings.length > 0) {
        listeningRings.forEach((ring, i) => {
          const ringPhase = (phase + i * 2) % 4; // 0 to 4
          const scale = 1 + ringPhase * 0.3; // Expands
          const opacity = Math.max(0, 1 - ringPhase / 4);
          ring.setAttribute('transform', `scale(${scale})`);
          ring.setAttribute('opacity', opacity.toString());
          ring.setAttribute('display', 'block');
        });
      } else {
        listeningRings.forEach(ring => ring.setAttribute('display', 'none'));
      }

      // 3. Thinking - Orbiting particles
      const particles = svg.querySelectorAll('.thinking-particle');
      if (status === 'thinking' && particles.length > 0) {
        particles.forEach((p, i) => {
          p.setAttribute('display', 'block');
          const radius = 35 + (i * 4);
          const speedMultiplier = (i % 2 === 0 ? 1 : -1) * (1 + i * 0.2);
          const angle = phase * speedMultiplier + (i * Math.PI / 2);
          const cx = Math.cos(angle) * radius;
          const cy = Math.sin(angle) * radius;
          p.setAttribute('cx', cx.toString());
          p.setAttribute('cy', cy.toString());
        });
      } else {
        particles.forEach(p => p.setAttribute('display', 'none'));
      }

      // 4. Speaking - Waveform
      const waveform = svg.querySelector('.speaking-waveform');
      if (status === 'speaking' && waveform) {
        waveform.setAttribute('display', 'block');
        // Generate dynamic polyline points
        const points = [];
        const numPoints = 20;
        const width = 60;
        for (let i = 0; i <= numPoints; i++) {
          const x = -width/2 + (i / numPoints) * width;
          // Taper at ends using a parabola
          const envelope = 1 - Math.pow((i - numPoints/2)/(numPoints/2), 2);
          const freq1 = Math.sin(phase * 10 + i * 0.5);
          const freq2 = Math.cos(phase * 15 + i * 0.8);
          const y = (freq1 + freq2) * 8 * envelope;
          points.push(`${x},${y}`);
        }
        waveform.setAttribute('points', points.join(' '));
      } else if (waveform) {
        waveform.setAttribute('display', 'none');
      }

      // 5. Executing - Rays
      const rays = svg.querySelectorAll('.executing-ray');
      if (status === 'executing' && rays.length > 0) {
        rays.forEach((ray, i) => {
          ray.setAttribute('display', 'block');
          const offsetPhase = (phase * 5 + i * 1.5) % 3;
          // Radiate outward from edge (radius 30)
          const angle = (i / rays.length) * Math.PI * 2 + (phase * 0.5);
          const startR = 32 + offsetPhase * 5;
          const endR = startR + 8;
          
          ray.setAttribute('x1', (Math.cos(angle) * startR).toString());
          ray.setAttribute('y1', (Math.sin(angle) * startR).toString());
          ray.setAttribute('x2', (Math.cos(angle) * endR).toString());
          ray.setAttribute('y2', (Math.sin(angle) * endR).toString());
          
          const opacity = Math.max(0, 1 - offsetPhase / 3);
          ray.setAttribute('opacity', opacity.toString());
        });
      } else {
        rays.forEach(ray => ray.setAttribute('display', 'none'));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, motionIntensity]);

  // CSS mappings based on status and accent
  const baseClass = `core-accent-${accent}`;
  
  // Colors mapped to status for the SVG elements
  const discBorderMap = {
    idle: 'var(--ink-ghost)',
    listening: 'var(--core-soft)',
    thinking: 'var(--think-soft)',
    speaking: 'var(--core-soft)',
    executing: 'var(--warn-soft)'
  };

  const discFill = 'var(--bg-elevated)';

  const ticksColorMap = {
    idle: 'var(--ink-faint)',
    listening: 'var(--core)',
    thinking: 'var(--think-soft)',
    speaking: 'transparent', // replaced by waveform
    executing: 'var(--warn)'
  };

  const glowStyle = status === 'idle'
    ? { filter: `drop-shadow(0 0 ${8 + glowIntensity * 10}px var(--core-soft))` }
    : { filter: `drop-shadow(0 0 ${15 + glowIntensity * 25}px var(--core-soft))` };

  // Tick marks generation (60 ticks)
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i / 60) * Math.PI * 2;
    // Vary the outer radius smoothly to create an organic, non-uniform pattern
    const variation = Math.sin(i * Math.PI / 4) * 1.5 + Math.cos(i * Math.PI / 8) * 0.5;
    const r1 = 25;
    const r2 = 30 + (status === 'idle' ? variation : 0); // smooth out when active
    return (
      <line 
        key={i}
        x1={Math.cos(angle) * r1}
        y1={Math.sin(angle) * r1}
        x2={Math.cos(angle) * r2}
        y2={Math.sin(angle) * r2}
        stroke={ticksColorMap[status]}
        strokeWidth="1.5"
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    );
  });

  return (
    <div 
      className={`${baseClass} relative flex items-center justify-center transition-all duration-500`}
      style={{ width: size, height: size, ...glowStyle }}
    >
      <svg 
        ref={svgRef}
        viewBox="-50 -50 100 100" 
        width="100%" 
        height="100%"
        className="overflow-visible"
      >
        <defs>
          {/* Radial gradient for the core disc to give it depth */}
          <radialGradient id="discGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="var(--bg-elevated-3)" />
            <stop offset="100%" stopColor="var(--bg-base)" />
          </radialGradient>
        </defs>

        <g className="core-group" style={{ transformOrigin: '0 0' }}>
          
          {/* Listening Rings */}
          <circle className="listening-ring" cx="0" cy="0" r="30" fill="none" stroke="var(--core)" strokeWidth="1" display="none" />
          <circle className="listening-ring" cx="0" cy="0" r="30" fill="none" stroke="var(--core)" strokeWidth="1" display="none" />
          <circle className="listening-ring" cx="0" cy="0" r="30" fill="none" stroke="var(--core)" strokeWidth="1" display="none" />

          {/* Central Disc (Gradient Fill) */}
          <circle 
            cx="0" cy="0" r="24" 
            fill="url(#discGrad)"
            stroke={discBorderMap[status]} 
            strokeWidth="1.5"
            className="transition-colors duration-300"
          />

          {/* Inner Highlight / Glass Arc for volume */}
          <path 
            d="M -18,-14 A 22 22 0 0 1 18,-14" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.08)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />

          {/* Label inside disc */}
          {label && status !== 'speaking' && (
            <text 
              x="0" y="4" 
              textAnchor="middle" 
              fill="var(--ink-faint)" 
              fontSize="12" 
              fontFamily="var(--font-mono)"
              fontWeight="500"
            >
              {label.substring(0, 1).toUpperCase()}
            </text>
          )}

          {/* Ticks */}
          <g className={status === 'thinking' ? 'opacity-20' : 'opacity-100'}>
            {ticks}
          </g>

          {/* Thinking Particles */}
          <circle className="thinking-particle" r="2" fill="var(--core)" display="none" />
          <circle className="thinking-particle" r="1.5" fill="var(--core)" display="none" />
          <circle className="thinking-particle" r="2.5" fill="var(--core)" display="none" />
          <circle className="thinking-particle" r="1" fill="var(--core)" display="none" />
          <circle className="thinking-particle" r="2" fill="var(--core)" display="none" />

          {/* Speaking Waveform */}
          <polyline 
            className="speaking-waveform" 
            fill="none" 
            stroke="var(--core)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            display="none" 
          />

          {/* Executing Rays */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line 
              key={i}
              className="executing-ray" 
              stroke="var(--core)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              display="none" 
            />
          ))}

        </g>
      </svg>
    </div>
  );
};

export default AICore;
