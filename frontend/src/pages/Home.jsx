import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import { voiceService } from '../services/voice/voice.service'
import AICore from '../components/AICore'

function Home() {

  // ── Context & Router ──────────────────────────────────────────────────────
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()

  // ── Existing refs (logic unchanged) ──────────────────────────────────────
  const isSpeakingRef    = useRef(false)
  const recognitionRef   = useRef(null)
  const isRecognizingRef = useRef(false)
  const processInputRef  = useRef(null)

  // ── Existing state ────────────────────────────────────────────────────────
  const [listening, setListening] = useState(false)
  const [ham, setHam]             = useState(false)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [status, setStatus]             = useState('ready')
  const statusRef                       = useRef('ready')
  // conversations: [{ id, userText, assistantText, timestamp, status }]
  const [conversations, setConversations] = useState([])
  const [chatInput, setChatInput]       = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const convEndRef                      = useRef(null)

  /** Sync status state + ref so closures always see latest value */
  const updateStatus = (s) => {
    statusRef.current = s
    setStatus(s)
  }

  /** Auto-scroll conversation to newest entry */
  useEffect(() => {
    convEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations])

  // ── handleLogOut ──────────────────────────────────────────────────────────
  const handleLogOut = async () => {
    // Stop any ongoing speech and recognition before logging out
    voiceService.stop()
    isSpeakingRef.current = false
    try { recognitionRef.current?.stop() } catch (_) {}

    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
    } catch (error) {
      console.log("Logout API error:", error)
    }
    // Always clear user data and redirect regardless of API result
    setUserData(null)
    navigate("/signin")
  }

  // ── startRecognition (improved to cancel active speech on click) ──────────
  const startRecognition = () => {
    if (isSpeakingRef.current) {
      voiceService.stop()
      isSpeakingRef.current = false
    }
    if (!isRecognizingRef.current) {
      try {
        recognitionRef.current?.start()
      } catch (error) {
        if (error.name !== "InvalidStateError") console.error("Start error:", error)
      }
    }
  }

  // ── speak — TTS voice orchestrator ───────────────────────────────────
  const speak = (text) => {
    if (!text) return
    voiceService.stop()

    voiceService.speak(text, {
      voiceId: userData?.voiceId,
      onStart: () => {
        isSpeakingRef.current = true
        updateStatus('speaking')
      },
      onEnd: () => {
        isSpeakingRef.current = false
        updateStatus('ready')
        setTimeout(() => startRecognition(), 800)
      },
      onError: (e) => {
        console.warn('TTS error:', e)
        isSpeakingRef.current = false
        updateStatus('ready')
      }
    })
  }



  // ── handleCommand (all URL-opening logic unchanged) ───────────────────────
  const handleCommand = (data) => {
    const { type, userInput, response } = data
    speak(response)
    updateStatus('executing')

    const q = encodeURIComponent(userInput || '')
    if (type === 'google-search')   window.open(`https://www.google.com/search?q=${q}`, '_blank')
    if (type === 'google-open')     window.open('https://www.google.com/', '_blank')
    if (type === 'calculator-open') window.open('https://www.google.com/search?q=calculator', '_blank')
    if (type === 'instagram-open')  window.open('https://www.instagram.com/', '_blank')
    if (type === 'facebook-open')   window.open('https://www.facebook.com/', '_blank')
    if (type === 'whatsapp-open')   window.open('https://web.whatsapp.com/', '_blank')
    if (type === 'weather-show')    window.open('https://www.google.com/search?q=weather', '_blank')
    if (type === 'youtube-open')    window.open('https://www.youtube.com/', '_blank')
    if (type === 'youtube-search' || type === 'youtube-play') {
      window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank')
    }
  }

  // ── processInput — unified entry point for voice AND text ─────────────────
  const processInput = async (text) => {
    if (!text?.trim() || isLoading) return

    const convId = Date.now()
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // Immediately show the user's input with a loading state
    setConversations(prev => [...prev, {
      id: convId,
      userText: text.trim(),
      assistantText: null,
      timestamp,
      status: 'loading'
    }])

    setIsLoading(true)
    updateStatus('thinking')

    try {
      const data = await getGeminiResponse(text.trim())

      // Fill in the assistant's response
      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, assistantText: data.response, status: 'complete' }
          : c
      ))

      handleCommand(data)

    } catch (err) {
      console.error("processInput error:", err)
      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, assistantText: "I encountered an error. Please try again.", status: 'error' }
          : c
      ))
      updateStatus('ready')
    } finally {
      setIsLoading(false)
    }
  }

  // Keep ref fresh so recognition closure never calls a stale processInput
  processInputRef.current = processInput

  // ── Speech Recognition setup (logic unchanged) ────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous     = false
    recognition.lang           = 'en-IN'
    recognition.interimResults = false
    recognitionRef.current     = recognition

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
      updateStatus('listening')
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
      if (statusRef.current === 'listening') updateStatus('ready')
    }

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error)
      isRecognizingRef.current = false
      setListening(false)
      updateStatus('ready')

      let errMsg = "Voice recognition error."
      if (event.error === 'not-allowed') {
        errMsg = "Microphone permission denied. Please allow mic access in your browser."
      } else if (event.error === 'no-speech') {
        errMsg = "No speech detected. Try speaking again."
      } else if (event.error === 'network') {
        errMsg = "Speech recognition error: Try in Google Chrome (Brave/ad-blockers block Google Speech API)."
      }

      const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      setConversations(prev => [...prev, {
        id: Date.now(),
        userText: "Voice Input",
        assistantText: errMsg,
        timestamp,
        status: 'error'
      }])
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      recognition.stop()
      isRecognizingRef.current = false
      setListening(false)
      await processInputRef.current(transcript)
    }

    // Greeting on mount — use speak() so same voice logic applies
    setTimeout(() => speak(`Hello ${userData.name}, what can I help you with?`), 300)


    return () => {
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  // ── Text input handlers ───────────────────────────────────────────────────
  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (chatInput.trim() && !isLoading) {
      processInput(chatInput.trim())
      setChatInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit(e)
    }
  }

  // ── Quick Actions ─────────────────────────────────────────────────────────
  const quickActions = [
    { label: '▶ YouTube',    command: 'open youtube'        },
    { label: '🌦 Weather',   command: 'show me the weather' },
    { label: '🔢 Calculator',command: 'open calculator'     },
    { label: '📷 Instagram', command: 'open instagram'      },
    { label: '💬 WhatsApp',  command: 'open whatsapp'       },
  ]

  // ── Status config ─────────────────────────────────────────────────────────
  const STATUS = {
    ready:     { label: '🟢 Ready to Assist', color: 'text-emerald-400' },
    listening: { label: '🎤 Listening...',     color: 'text-blue-400'   },
    thinking:  { label: '🧠 Thinking...',      color: 'text-violet-400' },
    speaking:  { label: '🔊 Speaking...',       color: 'text-cyan-400'   },
    executing: { label: '⚡ Executing...',      color: 'text-amber-400'  },
  }
  const currentStatus = STATUS[status] || STATUS.ready

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`w-full h-screen bg-[var(--bg-base)] flex flex-col overflow-hidden relative ambient-preset-${userData?.ambientPreset || 'void'}`}>

      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* Top Bar */}
      <div className="w-full h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-12 relative z-20 border-b border-[var(--bg-elevated-3)] bg-[var(--bg-elevated)] backdrop-blur-md shadow-md">
        
        {/* Left: Quick actions or Log Out (Mobile) */}
        <div className="flex items-center gap-4">
           <CgMenuRight
            className="lg:hidden text-[var(--ink-faint)] w-6 h-6 cursor-pointer hover:text-[var(--ink)] transition-colors"
            onClick={() => setHam(true)}
          />
          <span className="hidden lg:block text-[var(--ink-faint)] font-mono text-xs uppercase tracking-widest">
            AI Console
          </span>
        </div>

        {/* Center: AICore & Status */}
        <div 
          className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
          onClick={startRecognition}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && startRecognition()}
          aria-label="Tap to speak"
        >
          <AICore 
            status={status} 
            size={48} 
            accent={userData?.coreTheme || 'signal'} 
            glowIntensity={userData?.glowIntensity}
            motionIntensity={userData?.motionIntensity}
          />
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-[var(--core)] animate-pulse' : status === 'thinking' ? 'bg-[var(--core)]' : 'bg-green-500'}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-dim)]">
              {currentStatus.label.replace(/[^a-zA-Z. ]/g, '')}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => navigate("/customize")}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--ink-dim)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-sm)] bg-[var(--bg-elevated-2)] hover:bg-[var(--bg-elevated-3)] hover:text-[var(--ink)] transition-colors"
          >
            Identity
          </button>
          <button
            onClick={handleLogOut}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--warn)] border border-[var(--warn)]/20 rounded-[var(--radius-sm)] bg-[var(--warn)]/5 hover:bg-[var(--warn)]/10 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`absolute lg:hidden top-0 left-0 w-full h-full z-50 backdrop-blur-xl bg-[var(--bg-base)]/90
        flex flex-col gap-4 p-6 pt-16 transition-transform duration-300 border-r border-[var(--bg-elevated-3)]
        ${ham ? 'translate-x-0' : '-translate-x-full'}`}>
        <RxCross1
          className="text-[var(--ink-faint)] absolute top-5 right-5 w-5 h-5 cursor-pointer hover:text-[var(--ink)] transition-colors"
          onClick={() => setHam(false)}
        />
        <button
          onClick={() => { setHam(false); navigate("/customize") }}
          className="px-6 py-4 border border-[var(--bg-elevated-3)] text-[var(--ink)] rounded-[var(--radius-md)] text-sm font-semibold text-left bg-[var(--bg-elevated)]"
        >
          Identity Studio
        </button>
        <button
          onClick={handleLogOut}
          className="px-6 py-4 border border-[var(--warn)]/30 text-[var(--warn)] rounded-[var(--radius-md)] text-sm font-semibold text-left bg-[var(--warn)]/10"
        >
          Log Out
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col min-h-0 relative z-10 px-4 lg:px-8 py-6 gap-6">

        {/* Conversation Area */}
        <div className="flex-1 min-h-0 overflow-y-auto conv-scroll pr-2">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 select-none">
              <div 
                className="cursor-pointer active:scale-95 transition-transform"
                onClick={startRecognition}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startRecognition()}
              >
                <AICore 
                  status={status} 
                  size={140} 
                  accent={userData?.coreTheme || 'signal'} 
                  glowIntensity={userData?.glowIntensity}
                  motionIntensity={userData?.motionIntensity}
                  label={userData?.assistantName || 'System'}
                />
              </div>
              <div className="text-center space-y-3 max-w-sm mt-4">
                <p className="text-[var(--core)] text-sm font-mono uppercase tracking-[0.2em]">
                  System Ready
                </p>
                <p className="text-[var(--ink-dim)] text-sm font-body">
                  Tap the core or type a command below to initialize sequence.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-2">
              {conversations.map(conv => (
                <div key={conv.id} className="flex flex-col gap-3">
                  {/* User query */}
                  <div className="self-end max-w-[85%] bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-lg)] rounded-tr-[var(--radius-sm)] p-4 shadow-sm">
                    <p className="text-[var(--ink)] text-[15px] font-body leading-relaxed">{conv.userText}</p>
                    <span className="text-[10px] font-mono text-[var(--ink-ghost)] mt-2 block text-right">{conv.timestamp}</span>
                  </div>

                  {/* Assistant response */}
                  <div className="self-start max-w-[90%] bg-transparent p-2">
                    {conv.status === 'loading' ? (
                      <div className="flex items-center gap-1.5 h-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--core)] animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--core)] animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--core)] animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    ) : (
                      <div className={`text-[15.5px] font-body leading-relaxed ${conv.status === 'error' ? 'text-[var(--warn)]' : 'text-[var(--ink)]'}`}>
                        {conv.assistantText}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={convEndRef} />
            </div>
          )}
        </div>

        {/* Command Bar */}
        <div className="flex-shrink-0 flex flex-col gap-3">
          
          {/* Quick Actions (Floating above input) */}
          {conversations.length === 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {quickActions.map(a => (
                <button
                  key={a.label}
                  onClick={() => processInput(a.command)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-mono text-[var(--ink-dim)] bg-[var(--bg-elevated-2)] border border-[var(--bg-elevated-3)] rounded-full hover:bg-[var(--bg-elevated-3)] hover:text-[var(--ink)] transition-colors whitespace-nowrap"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleTextSubmit} className="relative flex items-center bg-[var(--bg-elevated)] border border-[var(--bg-elevated-3)] rounded-[var(--radius-lg)] shadow-lg transition-colors focus-within:border-[var(--core)]">
            
            {/* Mic */}
            <button
              type="button"
              onClick={startRecognition}
              disabled={isLoading || listening}
              className={`absolute left-3 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${listening ? 'text-[var(--bg-base)] bg-[var(--core)]' : 'text-[var(--ink-dim)] hover:bg-[var(--bg-elevated-3)] hover:text-[var(--ink)]'}`}
              aria-label="Start voice recognition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              disabled={isLoading}
              className="w-full h-[56px] bg-transparent outline-none pl-14 pr-14 text-[var(--ink)] placeholder-[var(--ink-ghost)] font-body text-[15px]"
              autoComplete="off"
            />

            {/* Send */}
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="absolute right-3 w-10 h-10 flex items-center justify-center rounded-full text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--bg-elevated-3)] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--ink-dim)] transition-colors"
            >
              {isLoading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Home
