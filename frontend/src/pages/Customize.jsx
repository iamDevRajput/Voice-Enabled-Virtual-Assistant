import React, { useContext, useEffect, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace } from "react-icons/md";
import AICore from '../components/AICore';
import axios from 'axios';

const THEMES = [
  { id: 'signal', name: 'Signal Blue', hex: '#4C6FFF' },
  { id: 'active', name: 'Active Green', hex: '#7BF1A8' },
  { id: 'think', name: 'Think Purple', hex: '#B48CFF' },
  { id: 'warn', name: 'Warn Orange', hex: '#FF6B4A' },
];

const PERSONALITIES = ['Professional', 'Casual', 'Direct', 'Empathetic'];
const AMBIENT_PRESETS = [
  { id: 'aurora', name: 'Aurora' },
  { id: 'dusk', name: 'Dusk' },
  { id: 'void', name: 'Void (Minimal)' }
];

function Customize() {
  const { serverUrl, userData, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  // Local Draft State
  const [draft, setDraft] = useState({
    assistantName: '',
    coreTheme: 'signal',
    personalityMode: 'Professional',
    voiceId: 'female_1',
    glowIntensity: 0.5,
    motionIntensity: 0.5,
    ambientPreset: 'aurora'
  });

  const [availableVoices, setAvailableVoices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize draft from userData
  useEffect(() => {
    if (userData) {
      setDraft({
        assistantName: userData.assistantName || 'Assistant',
        coreTheme: userData.coreTheme || 'signal',
        personalityMode: userData.personalityMode || 'Professional',
        voiceId: userData.voiceId || 'female_1',
        glowIntensity: userData.glowIntensity ?? 0.5,
        motionIntensity: userData.motionIntensity ?? 0.5,
        ambientPreset: userData.ambientPreset || 'aurora'
      });
    }
  }, [userData]);

  // Fetch Voices (with Fallback)
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const omnivoiceUrl = import.meta.env.VITE_OMNIVOICE_URL || 'http://localhost:3900';
        const res = await fetch(`${omnivoiceUrl}/v1/audio/voices`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          // Assuming API returns array of objects with id and name
          if (data && data.length > 0) {
            setAvailableVoices(data.map(v => ({ id: v.id || v.name, name: v.name || v.id })));
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch from OmniVoice API, using fallback voices.", err);
      }
      
      // Fallback
      setAvailableVoices([
        { id: 'female_1', name: 'Default Female' },
        { id: 'male_1', name: 'Default Male' },
        { id: 'female_uk', name: 'UK Female' },
        { id: 'male_uk', name: 'UK Male' }
      ]);
    };
    fetchVoices();
  }, []);

  const handleChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await axios.post(`${serverUrl}/api/user/update`, draft, { withCredentials: true });
      if (res.status === 200) {
        setUserData(res.data);
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to save identity", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-[var(--bg-base)] text-[var(--ink)] flex flex-col lg:flex-row relative overflow-hidden ambient-preset-${draft.ambientPreset}`}>
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* Top Nav (Mobile mostly) */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] hover:bg-[var(--bg-elevated-2)] transition-colors"
        >
          <MdKeyboardBackspace className="w-5 h-5" />
        </button>
      </div>

      {/* Left: Preview Panel */}
      <div className="w-full lg:w-1/2 min-h-[40vh] lg:h-screen flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[var(--bg-elevated-3)] relative z-10 pt-20 lg:pt-0">
        <div className="flex flex-col items-center gap-8">
          <AICore 
            status="idle" 
            size={180} 
            accent={draft.coreTheme} 
            label={draft.assistantName}
            glowIntensity={parseFloat(draft.glowIntensity)}
            motionIntensity={parseFloat(draft.motionIntensity)}
          />
          <div className="text-center">
            <h2 className="text-3xl font-display font-semibold tracking-tight">{draft.assistantName || 'Assistant'}</h2>
            <p className="text-[var(--ink-dim)] font-mono text-sm mt-2 uppercase tracking-widest">
              {draft.personalityMode} Identity
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls Panel */}
      <div className="w-full lg:w-1/2 h-screen overflow-y-auto conv-scroll relative z-10">
        <div className="max-w-md mx-auto py-12 px-6 lg:px-12 flex flex-col gap-10 pb-32">
          
          <div>
            <h1 className="text-2xl font-display font-semibold mb-2">Identity Studio</h1>
            <p className="text-[var(--ink-faint)] text-sm">Configure the core parameters of your assistant.</p>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Designation</label>
            <input 
              type="text" 
              value={draft.assistantName}
              onChange={(e) => handleChange('assistantName', e.target.value)}
              className="w-full h-12 bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-md)] px-4 outline-none focus:border-[var(--core)] transition-colors"
              placeholder="e.g. JARVIS"
            />
          </div>

          {/* Core Theme */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Core Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleChange('coreTheme', theme.id)}
                  className={`h-16 rounded-[var(--radius-md)] border flex flex-col items-center justify-center gap-2 transition-all ${draft.coreTheme === theme.id ? 'border-[var(--core)] bg-[var(--core-soft)]' : 'border-[var(--bg-elevated-3)] bg-[var(--bg-elevated)] hover:border-[var(--ink-ghost)]'}`}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }} />
                  <span className="text-[10px] font-mono uppercase text-[var(--ink-dim)]">{theme.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personality & Voice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Personality</label>
              <select 
                value={draft.personalityMode}
                onChange={(e) => handleChange('personalityMode', e.target.value)}
                className="w-full h-12 bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-md)] px-4 outline-none focus:border-[var(--core)] appearance-none"
              >
                {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Vocal Matrix</label>
              <select 
                value={draft.voiceId}
                onChange={(e) => handleChange('voiceId', e.target.value)}
                className="w-full h-12 bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-md)] px-4 outline-none focus:border-[var(--core)] appearance-none"
              >
                {availableVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tuning Sliders */}
          <div className="flex flex-col gap-6 p-6 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)]">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Glow Intensity</label>
                <span className="text-xs font-mono text-[var(--ink-faint)]">{Math.round(draft.glowIntensity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={draft.glowIntensity}
                onChange={(e) => handleChange('glowIntensity', e.target.value)}
                className="w-full accent-[var(--core)]"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Motion Dynamics</label>
                <span className="text-xs font-mono text-[var(--ink-faint)]">{Math.round(draft.motionIntensity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={draft.motionIntensity}
                onChange={(e) => handleChange('motionIntensity', e.target.value)}
                className="w-full accent-[var(--core)]"
              />
            </div>
          </div>

          {/* Ambient Preset */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Environment</label>
            <div className="flex flex-wrap gap-2">
              {AMBIENT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleChange('ambientPreset', preset.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${draft.ambientPreset === preset.id ? 'bg-[var(--ink)] text-[var(--bg-base)]' : 'bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] text-[var(--ink-dim)] hover:text-[var(--ink)]'}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 mt-4 bg-gradient-to-r from-[var(--core)] to-[#00d4ff] text-[#020b18] font-semibold rounded-[var(--radius-md)] transition-all hover:opacity-90 active:scale-95 flex items-center justify-center shadow-[0_0_20px_var(--core-soft)]"
          >
            {isSaving ? 'Synchronizing...' : 'Initialize Identity'}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Customize;