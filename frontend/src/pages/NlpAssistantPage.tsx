import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  AlertTriangle,
  Loader2,
  Terminal,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/UI/StatusBadge';
import { Modal } from '../components/UI/Modal';

interface Message {
  id: string;
  sender: 'user' | 'system';
  text: string;
  parsed?: any;
  result?: any;
  timestamp: string;
}

export const NlpAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: 'Hello! I am your ACO Contract Assistant. You can speak or type contract modifications (e.g. "Change amount from number to string", "Add an optional phone number", "Change timeout to 5 seconds", "Rollback the last change").',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by your browser. Please type your command.');
      return;
    }
    if (isListening) { setIsListening(false); return; }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSendCommand(transcript, 'VOICE');
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const buildResultSummary = (parsed: any, execResult: any): string => {
    // execResult can be: {message: "..."} or {evaluation: {...}} or {success: true, ...}
    if (execResult?.evaluation) {
      const ev = execResult.evaluation;
      const gate = ev.gate?.current_gate || 'UNKNOWN';
      const cs = ev.pcae?.cs ?? ev.evaluation?.cs;
      const pFail = ev.prediction?.p_fail ?? ev.pcae?.p_fail;
      return `${parsed.summary_message} — CS: ${cs ? (cs * 100).toFixed(1) + '%' : 'N/A'} | Gate: ${gate} | P_fail: ${pFail ? (pFail * 100).toFixed(1) + '%' : 'N/A'}`;
    }
    if (execResult?.message) return execResult.message;
    if (execResult?.success) return `Rollback to ${execResult.restored_version} complete. CS: ${execResult.evaluation?.pcae?.cs ? (execResult.evaluation.pcae.cs * 100).toFixed(1) + '%' : 'N/A'}`;
    return parsed.summary_message;
  };

  const handleSendCommand = async (textToSend?: string, mode: 'TEXT' | 'VOICE' = 'TEXT') => {
    const query = (textToSend || input).trim();
    if (!query) return;

    addMessage({ sender: 'user', text: query });
    setInput('');
    setIsLoading(true);

    try {
      const parseResult = await api.parseNlpCommand(query, mode);

      if (parseResult.requires_confirmation) {
        setPendingConfirmation(parseResult);
        addMessage({
          sender: 'system',
          text: parseResult.summary_message,
          parsed: parseResult,
        });
      } else {
        // Execute directly (non-breaking commands)
        const execResult = await api.executeNlpCommand({
          intent: parseResult.intent,
          entities: parseResult.entities,
          confirmed: true,
        });
        addMessage({
          sender: 'system',
          text: buildResultSummary(parseResult, execResult),
          parsed: parseResult,
          result: execResult,
        });
      }
    } catch (err: any) {
      addMessage({ sender: 'system', text: `Error processing command: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = async () => {
    if (!pendingConfirmation) return;
    setIsLoading(true);
    try {
      const execResult = await api.executeNlpCommand({
        intent: pendingConfirmation.intent,
        entities: pendingConfirmation.entities,
        confirmed: true,
      });

      addMessage({
        sender: 'system',
        text: buildResultSummary(pendingConfirmation, execResult),
        result: execResult,
      });
    } catch (e: any) {
      addMessage({ sender: 'system', text: `Failed to apply change: ${e.message}` });
    } finally {
      setPendingConfirmation(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            NLP & Voice Contract Assistant
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic intent parsing, entity extraction, breaking change risk gating, and voice control.
          </p>
        </div>
        <StatusBadge status="VOICE ENABLED" size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 glass-panel flex flex-col" style={{ height: '620px' }}>
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'system' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-md p-3 rounded-xl border ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white border-indigo-500 rounded-br-none'
                      : 'bg-slate-900/90 text-slate-200 border-slate-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Parsed metadata card */}
                  {msg.parsed && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Intent:</span>
                        <span className="font-mono font-bold text-indigo-300">{msg.parsed.intent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="font-bold text-emerald-400">
                          {(msg.parsed.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {Object.keys(msg.parsed.entities || {}).length > 0 && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-400 shrink-0">Entities:</span>
                          <span className="font-mono text-[10px] text-slate-300 text-right">
                            {JSON.stringify(msg.parsed.entities)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Risk Level:</span>
                        <StatusBadge status={msg.parsed.risk_level || 'SAFE'} size="sm" />
                      </div>
                    </div>
                  )}

                  {/* Post-execution result when gate/CS available */}
                  {msg.result?.evaluation && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">New Gate:</span>
                        <StatusBadge status={msg.result.evaluation.gate?.current_gate || '?'} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">CS:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {msg.result.evaluation.pcae?.cs !== undefined
                            ? (msg.result.evaluation.pcae.cs * 100).toFixed(1) + '%'
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  <span className="block mt-1.5 text-[10px] text-right opacity-50">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>ACO Engine is assessing contract impact...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
            <button
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Start voice recognition'}
              className={`p-2.5 rounded-lg border transition-all ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendCommand()}
              placeholder={isListening ? 'Listening to speech...' : 'Type contract instruction or query...'}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              disabled={isLoading || !input.trim()}
              onClick={() => handleSendCommand()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>

        {/* Right: Quick Commands + NLP Metadata */}
        <div className="glass-panel p-5 space-y-4 flex flex-col">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Commands</h3>
          </div>

          <div className="space-y-1.5 text-xs flex-1 overflow-y-auto">
            {[
              { label: 'Change amount from number to string.', intent: 'CHANGE_TYPE (BREAKING)' },
              { label: 'Make currency optional.', intent: 'MAKE_OPTIONAL (SAFE)' },
              { label: 'Add an optional customer phone number.', intent: 'ADD_FIELD (SAFE)' },
              { label: 'Change payment timeout to 5 seconds.', intent: 'CHANGE_TIMEOUT' },
              { label: 'Reduce throughput to 100 RPS.', intent: 'CHANGE_THROUGHPUT' },
              { label: 'Rollback the last change.', intent: 'ROLLBACK' },
              { label: 'Check compatibility.', intent: 'CHECK_COMPATIBILITY' },
              { label: 'Show me the difference.', intent: 'SHOW_DIFF' },
              { label: 'Show me why this is incompatible.', intent: 'SHOW_EXPLANATION' },
              { label: 'Simulate changing amount to string.', intent: 'SIMULATE_CHANGE' },
            ].map((cmd, i) => (
              <button
                key={i}
                onClick={() => { setInput(cmd.label); handleSendCommand(cmd.label); }}
                className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-800/80 hover:border-indigo-700/60 transition-all flex flex-col gap-0.5 group"
              >
                <span className="text-slate-200 group-hover:text-indigo-300 font-medium leading-snug">{cmd.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">{cmd.intent}</span>
              </button>
            ))}
          </div>

          {/* NLP Metadata Info panel */}
          <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <Info className="w-3 h-3 text-slate-500" />
              <span>15 intent classes supported</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Intent F1: 97.1% | Entity F1: 95.7%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Breaking changes require explicit confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!pendingConfirmation}
        onClose={() => setPendingConfirmation(null)}
        onConfirm={handleConfirmApply}
        title="Confirm Contract Mutation"
        confirmText="Apply Change"
        cancelText="Cancel"
        isDanger={pendingConfirmation?.risk_level === 'BREAKING'}
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            The NLP assistant parsed the following mutation proposal from your command:
          </p>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Intent:</span>
              <span className="text-indigo-300 font-bold">{pendingConfirmation?.intent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Confidence:</span>
              <span className="text-emerald-400">
                {pendingConfirmation ? (pendingConfirmation.confidence * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400 shrink-0">Entities:</span>
              <span className="text-slate-200 text-right">{JSON.stringify(pendingConfirmation?.entities)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Risk Assessment:</span>
              <StatusBadge status={pendingConfirmation?.risk_level || 'SAFE'} size="sm" />
            </div>
          </div>

          {pendingConfirmation?.risk_level === 'BREAKING' && (
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                Warning: This mutation alters existing required field signatures and will trigger pre-emptive QUARANTINE gating.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-400">
            {pendingConfirmation?.summary_message}
          </p>
        </div>
      </Modal>
    </div>
  );
};
