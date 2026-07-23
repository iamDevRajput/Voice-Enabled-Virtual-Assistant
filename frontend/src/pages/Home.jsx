import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import { voiceService } from '../services/voice/voice.service'

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
      avatarImage: userData?.assistantImage,
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
        errMsg = "Network error. Check connection."
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
    <div className="w-full h-screen bg-[#030011] flex flex-col overflow-hidden relative">

      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* Mobile hamburger */}
      <CgMenuRight
        className="lg:hidden text-white/40 absolute top-5 right-5 w-6 h-6 z-50 cursor-pointer hover:text-white/70 transition-colors"
        onClick={() => setHam(true)}
        aria-label="Open menu"
      />

      {/* Mobile sidebar */}
      <div className={`absolute lg:hidden top-0 left-0 w-full h-full z-40 backdrop-blur-xl bg-black/70
        flex flex-col gap-4 p-6 pt-16 transition-transform duration-300
        ${ham ? 'translate-x-0' : 'translate-x-full'}`}>
        <RxCross1
          className="text-white/60 absolute top-5 right-5 w-5 h-5 cursor-pointer hover:text-white transition-colors"
          onClick={() => setHam(false)} aria-label="Close menu"
        />
        <button
          onClick={handleLogOut}
          className="px-6 py-3 border border-white/20 text-white/80 rounded-2xl text-sm text-left"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          Log Out
        </button>
        <button
          onClick={() => { setHam(false); navigate("/customize") }}
          className="px-6 py-3 border border-white/20 text-white/80 rounded-2xl text-sm text-left"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          Customize Assistant
        </button>
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex absolute top-5 right-6 gap-2 z-20">
        <button
          onClick={() => navigate("/customize")}
          className="px-4 py-2 text-xs text-white/60 border border-white/15 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          Customize
        </button>
        <button
          onClick={handleLogOut}
          className="px-4 py-2 text-xs text-white/60 border border-white/15 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          Log Out
        </button>
      </div>

      {/* ── Main two-column layout ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full pt-14 lg:pt-6 overflow-hidden">

        {/* ════════════════
            LEFT — Hero
            ════════════════ */}
        <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col items-center
          justify-start lg:justify-center px-8 pb-6 pt-4 lg:pt-0 gap-6
          lg:border-r lg:border-white/[0.03]">

          {/* Avatar — primary interactive element */}
          <div
            className={`avatar-wrapper state-${status}`}
            onClick={startRecognition}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && startRecognition()}
            aria-label="Tap to speak"
          >
            <div className="avatar-ring-base" />
            <img
              src={userData?.assistantImage}
              alt={userData?.assistantName || 'Assistant'}
              className="avatar-img w-[160px] h-[160px] lg:w-[210px] lg:h-[210px]"
            />
            {status === 'listening' && (
              <div className="waveform" aria-hidden="true">
                {[0,1,2,3,4].map(i => <div key={i} className="wave-bar" />)}
              </div>
            )}
          </div>

          {/* Name + label */}
          <div
            className="text-center"
            style={{ marginTop: status === 'listening' ? '1.75rem' : 0 }}
          >
            <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight leading-none">
              {userData?.assistantName}
            </h1>
            <p className="text-white/22 text-xs mt-2 uppercase tracking-[0.18em]">
              Personal AI Assistant
            </p>
          </div>

          {/* Status badge */}
          <div className={`status-badge ${currentStatus.color}`} role="status" aria-live="polite">
            {currentStatus.label}
          </div>

          <p className="text-white/18 text-xs tracking-wide">
            Tap the assistant to speak
          </p>

          {/* Quick Actions */}
          <div className="w-full">
            <p className="text-white/14 text-[0.6rem] uppercase tracking-[0.14em] mb-3 text-center">
              Quick Actions
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickActions.map(a => (
                <button
                  key={a.label}
                  onClick={() => processInput(a.command)}
                  disabled={isLoading}
                  className="quick-chip"
                  aria-label={a.label}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════
            RIGHT — Conversation
            ════════════════ */}
        <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-8 pb-5 pt-5 gap-5 overflow-hidden">

          {/* Conversation area */}
          <div className="flex-1 min-h-0 overflow-y-auto conv-scroll pr-1">
            {conversations.length === 0 ? (
              /* Empty state — elegant, minimal */
              <div className="h-full flex flex-col items-center justify-center gap-5 select-none">
                <div className="empty-orb" aria-hidden="true" />
                <div className="text-center space-y-2">
                  <p className="text-white/30 text-lg font-light">
                    Hello, I'm {userData?.assistantName}.
                  </p>
                  <p className="text-white/18 text-sm">
                    Tap the avatar or type below to begin.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-1">
                {conversations.map(conv => (
                  <div key={conv.id} className="conv-card">

                    {/* User query row */}
                    <div className="conv-user-row">
                      <p className="conv-user-text">"{conv.userText}"</p>
                      <span className="conv-timestamp">{conv.timestamp}</span>
                    </div>

                    {/* Subtle separator */}
                    <div className="conv-divider" />

                    {/* Assistant response */}
                    {conv.status === 'loading' ? (
                      <div className="loading-dots" aria-label="Thinking...">
                        <div className="loading-dot" style={{ animationDelay: '0s' }} />
                        <div className="loading-dot" style={{ animationDelay: '0.18s' }} />
                        <div className="loading-dot" style={{ animationDelay: '0.36s' }} />
                      </div>
                    ) : (
                      <p className={`conv-response${conv.status === 'error' ? ' conv-response-error' : ''}`}>
                        {conv.assistantText}
                      </p>
                    )}
                  </div>
                ))}
                <div ref={convEndRef} />
              </div>
            )}
          </div>

          {/* ── Command Bar ── */}
          <form onSubmit={handleTextSubmit} className="command-bar flex-shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="command-input"
              autoComplete="off"
              aria-label="Type a command"
            />

            {/* Mic */}
            <button
              type="button"
              onClick={startRecognition}
              disabled={isLoading || listening}
              className={`cmd-btn mic-btn ${listening ? 'mic-active' : ''}`}
              aria-label="Start voice recognition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            {/* Send */}
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="cmd-btn send-btn"
              aria-label="Send"
            >
              {isLoading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
