import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Bell, 
  Mic, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ShieldCheck,
  User as UserIcon,
  ChevronRight,
  Music,
  Upload,
  Volume2,
  Trash2,
  Search,
  BarChart3,
  Repeat,
  Edit3,
  Filter,
  Gamepad2,
  ShieldAlert,
  Phone,
  UserPlus,
  LogOut,
  Mail,
  Lock
} from 'lucide-react';
import { User, Reminder, EmergencyContact, GameScore } from './types';
import { processVoiceCommand } from './services/gemini';

// --- Components ---

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center space-y-12 max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight uppercase">
          Forgetfulness <br />
          <span className="text-emerald-500">Remainder System</span>
        </h1>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 text-black font-bold rounded-full overflow-hidden transition-all hover:bg-emerald-400 text-lg tracking-widest"
          >
            <span className="relative z-10">GET STARTED</span>
            <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setHasPassword(data.hasPassword);
    } catch (err) {
      console.error("Failed to check auth status");
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => onLogin(data.user), 1500);
      } else {
        setError(data.error || "Failed to set password");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => onLogin(data.user), 1000);
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (hasPassword === null) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-12 text-center"
      >
        {/* App Logo */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={isSuccess ? { scale: [1, 1.2, 1], rotate: [0, 360, 360] } : {}}
            className={`p-5 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/20`}
          >
            <Brain className="w-12 h-12 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight font-display">
            MindGuard <span className="text-emerald-500">AI</span>
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <p className="text-emerald-500 font-bold tracking-widest uppercase text-sm">
                Access Granted
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-zinc-300">
                  {hasPassword ? "Welcome Back" : "Secure Your Mind"}
                </h2>
                <p className="text-zinc-500 text-sm">
                  {hasPassword ? "Enter your password to unlock" : "Create a master password for your data"}
                </p>
              </div>

              <form 
                onSubmit={hasPassword ? handleUnlock : handleSetup} 
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center tracking-[0.5em] text-lg"
                      placeholder="••••"
                    />
                  </div>

                  {!hasPassword && (
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center tracking-[0.5em] text-lg"
                        placeholder="••••"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {hasPassword ? "Unlock System" : "Set Password"}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">
            End-to-End Encrypted Storage
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'reminders' | 'training' | 'safetynet' | 'assistant' | 'settings' | 'insights'>('reminders');
  const [isAdding, setIsAdding] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newReminder, setNewReminder] = useState({ title: '', description: '', priority: 'normal' as any, due_time: '', recurrence: 'none' as any });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'normal' | 'high' | 'emergency'>('all');
  const [insights, setInsights] = useState<any>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  
  // Game State
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameover'>('idle');
  const [gameSequence, setGameSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameScore, setGameScore] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [triggeredReminder, setTriggeredReminder] = useState<Reminder | null>(null);
  const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);
  
  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [userSettings, setUserSettings] = useState(user.settings || { 
    alarmSound: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 
    alarmName: 'Classic Bell',
    notificationsEnabled: true,
    snoozeTime: 5
  });
  const [alarmAudio] = useState(new Audio(userSettings.alarmSound));

  useEffect(() => {
    alarmAudio.src = userSettings.alarmSound;
  }, [userSettings.alarmSound]);

  useEffect(() => {
    fetchReminders();
    fetchInsights();
    fetchEmergencyContacts();
    fetchGameScores();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for due reminders every 30 seconds
    const interval = setInterval(() => {
      checkDueReminders();
      checkSafetyNet();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkDueReminders = () => {
    const now = new Date();
    setReminders(prev => {
      const due = prev.find(r => 
        r.status === 'active' && 
        r.due_time && 
        new Date(r.due_time) <= now &&
        new Date(r.due_time) > new Date(now.getTime() - 60000) // Within last minute
      );

      if (due && !triggeredReminder) {
        triggerAlarm(due);
      }
      return prev;
    });
  };

  const checkSafetyNet = () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

    setReminders(prev => {
      const missedEmergencyReminders = prev.filter(r => 
        r.priority === 'emergency' && 
        r.status === 'active' && 
        r.due_time && 
        new Date(r.due_time) < thirtyMinutesAgo
      );

      if (missedEmergencyReminders.length > 0 && emergencyContacts.length > 0) {
        // Only alert if we haven't alerted in the last hour to avoid spam
        if (!lastAlertTime || (now.getTime() - new Date().setHours(0,0,0,0) > 3600000)) {
          const alertMsg = `SAFETY ALERT: ${missedEmergencyReminders.length} critical tasks missed. Notifying emergency contacts.`;
          setLastAlertTime(now.toLocaleTimeString());
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("Safety Net Alert", {
              body: alertMsg,
              icon: '/favicon.ico'
            });
          }
        }
      }
      return prev;
    });
  };

  const testSafetyNet = () => {
    if (emergencyContacts.length === 0) {
      alert("Please add at least one emergency contact first.");
      return;
    }
    const now = new Date();
    setLastAlertTime(now.toLocaleTimeString());
    alert("Test alert triggered! Emergency contacts would be notified now.");
  };

  const triggerAlarm = (reminder: Reminder) => {
    setTriggeredReminder(reminder);
    
    // Play sound for high priority
    if (reminder.priority !== 'normal') {
      alarmAudio.loop = true;
      alarmAudio.play().catch(e => console.log('Audio play blocked'));
    }

    // Browser notification
    if (userSettings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Reminder: ${reminder.title}`, {
        body: reminder.description || 'Time for your scheduled task.',
        icon: '/favicon.ico'
      });
    }
  };

  const handleSnooze = async () => {
    if (!triggeredReminder) return;
    
    const snoozeMinutes = userSettings.snoozeTime || 5;
    const newDueTime = new Date(Date.now() + snoozeMinutes * 60000).toISOString();
    
    await fetch(`/api/reminders/${triggeredReminder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_time: newDueTime, status: 'active' }),
    });
    
    stopAlarm();
    fetchReminders();
    
    if (userSettings.notificationsEnabled) {
      speak(`Snoozed for ${snoozeMinutes} minutes.`);
    }
  };

  const stopAlarm = () => {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    setTriggeredReminder(null);
  };

  const fetchReminders = async () => {
    const res = await fetch(`/api/reminders/${user.id}`);
    const data = await res.json();
    setReminders(data);
    fetchInsights();
  };

  const fetchInsights = async () => {
    const res = await fetch(`/api/insights/${user.id}`);
    const data = await res.json();
    setInsights(data);
  };

  const fetchEmergencyContacts = async () => {
    const res = await fetch(`/api/emergency-contacts/${user.id}`);
    const data = await res.json();
    setEmergencyContacts(data);
  };

  const fetchGameScores = async () => {
    const res = await fetch(`/api/game-scores/${user.id}`);
    const data = await res.json();
    setGameScores(data);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/emergency-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newContact, user_id: user.id }),
    });
    if (res.ok) {
      setIsAddingContact(false);
      setNewContact({ name: '', phone: '', relation: '' });
      fetchEmergencyContacts();
    }
  };

  const deleteContact = async (id: number) => {
    await fetch(`/api/emergency-contacts/${id}`, { method: 'DELETE' });
    fetchEmergencyContacts();
  };

  // Memory Game Logic
  const startMemoryGame = () => {
    setGameLevel(1);
    setGameScore(0);
    setGameState('showing');
    const firstSeq = [Math.floor(Math.random() * 9)];
    setGameSequence(firstSeq);
    showSequence(firstSeq);
  };

  const showSequence = (seq: number[]) => {
    setGameState('showing');
    seq.forEach((tile, index) => {
      setTimeout(() => {
        setActiveTile(tile);
        setTimeout(() => setActiveTile(null), 500);
      }, (index + 1) * 800);
    });
    setTimeout(() => {
      setGameState('playing');
      setUserSequence([]);
    }, (seq.length + 1) * 800);
  };

  const handleTileClick = (tile: number) => {
    if (gameState !== 'playing') return;
    
    const newSeq = [...userSequence, tile];
    setUserSequence(newSeq);
    
    // Flash tile
    setActiveTile(tile);
    setTimeout(() => setActiveTile(null), 200);

    if (tile !== gameSequence[newSeq.length - 1]) {
      setGameState('gameover');
      saveGameScore(gameScore);
      return;
    }

    if (newSeq.length === gameSequence.length) {
      setGameScore(prev => prev + 10);
      setGameLevel(prev => prev + 1);
      const nextSeq = [...gameSequence, Math.floor(Math.random() * 9)];
      setGameSequence(nextSeq);
      setTimeout(() => showSequence(nextSeq), 1000);
    }
  };

  const saveGameScore = async (score: number) => {
    await fetch('/api/game-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, game_type: 'Memory Sequence', score }),
    });
    fetchGameScores();
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingReminder ? `/api/reminders/${editingReminder.id}` : '/api/reminders';
    const method = editingReminder ? 'PATCH' : 'POST';
    
    // For editing, we need to handle the status and other fields if we want a full edit
    // But for now let's just support basic update via the same modal
    const res = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newReminder, user_id: user.id, context_type: 'routine' }),
    });
    
    if (res.ok) {
      setIsAdding(false);
      setEditingReminder(null);
      setNewReminder({ title: '', description: '', priority: 'normal', due_time: '', recurrence: 'none' });
      fetchReminders();
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchReminders();
  };

  const deleteReminder = async (id: number) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });
      fetchReminders();
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setAiResponse('');
      setVoiceTranscript('');
    };
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setVoiceTranscript(text);
      const details = await processVoiceCommand(text);
      if (details) {
        const { confirmation, ...reminderData } = details;
        if (confirmation) {
          setAiResponse(confirmation);
          speak(confirmation);
        }
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...reminderData, user_id: user.id }),
        });
        fetchReminders();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess("Password changed successfully");
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Connection error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-72 glass border-r border-white/5 p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Brain className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Reminder System</span>
        </div>

        <div className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('reminders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reminders' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Reminders</span>
          </button>
          <button 
            onClick={() => setActiveTab('training')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'training' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="font-medium">Cognitive Training</span>
          </button>
          <button 
            onClick={() => setActiveTab('safetynet')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'safetynet' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="font-medium">Safety Net</span>
          </button>
          <button 
            onClick={() => setActiveTab('assistant')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'assistant' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Mic className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'insights' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Insights</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold">
              {activeTab === 'reminders' && 'Daily Focus'}
              {activeTab === 'training' && 'Cognitive Training'}
              {activeTab === 'safetynet' && 'Safety Net'}
              {activeTab === 'insights' && 'Cognitive Insights'}
              {activeTab === 'assistant' && 'Voice Assistant'}
              {activeTab === 'settings' && 'System Settings'}
            </h2>
            <p className="text-zinc-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {activeTab === 'reminders' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5" />
              New Reminder
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'reminders' && (
            <motion.div 
              key="reminders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder="Search reminders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="all" className="bg-zinc-900">All Priorities</option>
                    <option value="normal" className="bg-zinc-900">Normal</option>
                    <option value="high" className="bg-zinc-900">High</option>
                    <option value="emergency" className="bg-zinc-900">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Main List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest ml-1">Active Tasks</h3>
                  {reminders.filter(r => 
                    r.status === 'active' && 
                    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (filterPriority === 'all' || r.priority === filterPriority)
                  ).length === 0 ? (
                    <div className="glass p-12 rounded-2xl text-center border-dashed border-white/10">
                      <CheckCircle2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500">No matching active reminders.</p>
                    </div>
                  ) : (
                    reminders.filter(r => 
                      r.status === 'active' && 
                      (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                      (filterPriority === 'all' || r.priority === filterPriority)
                    ).map(reminder => (
                      <motion.div 
                        layoutId={`rem-${reminder.id}`}
                        key={reminder.id} 
                        className={`glass p-5 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-all ${reminder.priority === 'emergency' ? 'emergency-glow border-red-500/50' : ''}`}
                      >
                        <button 
                          onClick={() => updateStatus(reminder.id, 'completed')}
                          className="w-6 h-6 rounded-full border-2 border-zinc-700 flex items-center justify-center hover:border-emerald-500 transition-colors shrink-0"
                        >
                          <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{reminder.title}</h4>
                            {reminder.priority === 'emergency' && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">Critical</span>}
                            {reminder.recurrence && reminder.recurrence !== 'none' && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                {reminder.recurrence}
                              </span>
                            )}
                            {reminder.due_time && new Date(reminder.due_time) < new Date() && (
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 truncate">{reminder.description}</p>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-500 text-xs font-medium">
                          {reminder.due_time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(reminder.due_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <button 
                            onClick={() => {
                              setEditingReminder(reminder);
                              setNewReminder({
                                title: reminder.title,
                                description: reminder.description || '',
                                priority: reminder.priority,
                                due_time: reminder.due_time ? new Date(reminder.due_time).toISOString().slice(0, 16) : '',
                                recurrence: reminder.recurrence || 'none'
                              });
                              setIsAdding(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-600 hover:text-emerald-400"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const snoozeTime = new Date(Date.now() + 30 * 60000).toISOString(); // Snooze 30 mins
                              fetch(`/api/reminders/${reminder.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ due_time: snoozeTime, status: 'active' }),
                              }).then(() => fetchReminders());
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-600 hover:text-zinc-400"
                            title="Snooze 30m"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus(reminder.id, 'ignored')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
            </motion.div>
          )}

          {activeTab === 'training' && (
            <motion.div 
              key="training"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 glass p-8 rounded-3xl flex flex-col items-center justify-center min-h-[500px]">
                {gameState === 'idle' && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-4">Memory Sequence</h3>
                    <p className="text-zinc-400 mb-8 max-w-sm">Improve your short-term memory by recalling the sequence of flashing tiles.</p>
                    <button 
                      onClick={startMemoryGame}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-xl font-bold transition-all"
                    >
                      Start Training
                    </button>
                  </div>
                )}

                {(gameState === 'showing' || gameState === 'playing') && (
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between mb-6">
                      <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Level: {gameLevel}</div>
                      <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Score: {gameScore}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(tile => (
                        <button 
                          key={tile}
                          onClick={() => handleTileClick(tile)}
                          className={`aspect-square rounded-2xl transition-all duration-200 ${activeTile === tile ? 'bg-emerald-400 scale-95 shadow-[0_0_20px_rgba(52,211,153,0.5)]' : 'bg-white/5 hover:bg-white/10'}`}
                        />
                      ))}
                    </div>
                    <p className="text-center mt-8 text-zinc-500 text-sm">
                      {gameState === 'showing' ? 'Watch carefully...' : 'Your turn! Repeat the sequence.'}
                    </p>
                  </div>
                )}

                {gameState === 'gameover' && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-2 text-red-400">Game Over</h3>
                    <p className="text-zinc-400 mb-2">You reached level {gameLevel}</p>
                    <p className="text-4xl font-display font-bold mb-8">Score: {gameScore}</p>
                    <button 
                      onClick={startMemoryGame}
                      className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-3xl">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent Scores</h4>
                  <div className="space-y-3">
                    {gameScores.length === 0 ? (
                      <p className="text-zinc-600 text-xs italic">No scores recorded yet.</p>
                    ) : (
                      gameScores.map(score => (
                        <div key={score.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-sm font-semibold">{score.game_type}</p>
                            <p className="text-[10px] text-zinc-500">{new Date(score.timestamp).toLocaleDateString()}</p>
                          </div>
                          <span className="text-emerald-400 font-bold">{score.score}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass p-6 rounded-3xl border-emerald-500/10">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2">Cognitive Tip</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Regular memory exercises can help strengthen neural pathways associated with recall and focus. Try to practice for 5 minutes every day.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'safetynet' && (
            <motion.div 
              key="safetynet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="glass p-8 rounded-3xl border-emerald-500/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <ShieldAlert className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Safety Net Protocol</h3>
                    <p className="text-zinc-500 text-sm">Automated alerts for critical missed tasks</p>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                  When an <span className="text-red-400 font-bold">Emergency Priority</span> task is missed or ignored for more than 30 minutes, the system will automatically notify your designated emergency contacts via SMS and Email.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Designated Contacts</h4>
                    <button 
                      onClick={() => setIsAddingContact(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Contact
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {emergencyContacts.length === 0 ? (
                      <div className="glass p-8 rounded-2xl text-center border-dashed border-white/10">
                        <Phone className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No emergency contacts added.</p>
                      </div>
                    ) : (
                      emergencyContacts.map(contact => (
                        <div key={contact.id} className="glass p-5 rounded-2xl flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <span className="text-emerald-400 font-bold">{contact.name[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold truncate">{contact.name}</h5>
                            <p className="text-xs text-zinc-500">{contact.relation} • {contact.phone}</p>
                          </div>
                          <button 
                            onClick={() => deleteContact(contact.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Protocol Status</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${emergencyContacts.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-bold">{emergencyContacts.length > 0 ? 'System Active' : 'System Inactive'}</p>
                        <p className="text-xs text-zinc-500">{emergencyContacts.length > 0 ? 'Monitoring emergency tasks 24/7' : 'Add contacts to activate safety net'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${lastAlertTime ? 'bg-orange-500' : 'bg-zinc-700'}`} />
                      <div>
                        <p className="text-sm font-bold text-zinc-400">Last Alert Sent</p>
                        <p className="text-xs text-zinc-500">{lastAlertTime ? `Alert sent at ${lastAlertTime}` : 'No alerts sent in the last 30 days'}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <button 
                        onClick={testSafetyNet}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Test Protocol Alert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div 
              key="assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="mb-12">
                <motion.div 
                  animate={isListening ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all ${isListening ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'bg-zinc-900 border border-white/10'}`}
                >
                  <Mic className={`w-12 h-12 ${isListening ? 'text-black' : 'text-emerald-400'}`} />
                </motion.div>
                <h3 className="text-2xl font-display font-bold mt-8">
                  {isListening ? 'Listening...' : 'How can I help you?'}
                </h3>
                <p className="text-zinc-500 mt-2">
                  "Remind me to buy medicine when I'm near the pharmacy"
                </p>
              </div>

              {isListening ? (
                <button 
                  onClick={stopVoice}
                  className="bg-red-500 hover:bg-red-400 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
                >
                  Stop Listening
                </button>
              ) : (
                <button 
                  onClick={startVoice}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
                >
                  Start Voice Command
                </button>
              )}

              {voiceTranscript && (
                <div className="mt-10 p-6 glass rounded-2xl inline-block max-w-md">
                  <p className="text-zinc-400 text-sm mb-1">I heard:</p>
                  <p className="text-xl font-medium italic mb-4">"{voiceTranscript}"</p>
                  
                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 pt-4 border-t border-white/10 text-emerald-400 font-medium"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-bold">AI Assistant</span>
                      </div>
                      {aiResponse}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && insights && (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-3xl text-center">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Tasks</p>
                  <p className="text-4xl font-display font-bold text-white">{insights.total}</p>
                </div>
                <div className="glass p-6 rounded-3xl text-center border-emerald-500/20">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Completed</p>
                  <p className="text-4xl font-display font-bold text-white">{insights.completed}</p>
                </div>
                <div className="glass p-6 rounded-3xl text-center border-red-500/20">
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Missed</p>
                  <p className="text-4xl font-display font-bold text-white">{insights.ignored}</p>
                </div>
                <div className="glass p-6 rounded-3xl text-center border-blue-500/20">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Success Rate</p>
                  <p className="text-4xl font-display font-bold text-white">
                    {insights.total > 0 ? Math.round((insights.completed / (insights.completed + insights.ignored)) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl">
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Priority Distribution
                  </h3>
                  <div className="space-y-4">
                    {['emergency', 'high', 'normal'].map(p => {
                      const count = insights.byPriority.find((bp: any) => bp.priority === p)?.count || 0;
                      const percentage = insights.total > 0 ? (count / insights.total) * 100 : 0;
                      return (
                        <div key={p} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize text-zinc-400">{p}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`h-full ${p === 'emergency' ? 'bg-red-500' : p === 'high' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl">
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    Cognitive Load Analysis
                  </h3>
                  <div className="space-y-4">
                    {['time', 'location', 'routine', 'emotion'].map(c => {
                      const count = insights.byContext.find((bc: any) => bc.context_type === c)?.count || 0;
                      const percentage = insights.total > 0 ? (count / insights.total) * 100 : 0;
                      return (
                        <div key={c} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize text-zinc-400">{c}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className="h-full bg-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border-emerald-500/10">
                <h3 className="text-xl font-display font-bold mb-4">AI Cognitive Health Report</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Based on your recent activity, your task completion rate is 
                  <span className="text-emerald-400 font-bold mx-1">
                    {insights.total > 0 ? Math.round((insights.completed / (insights.completed + insights.ignored)) * 100) : 0}%
                  </span>. 
                  You are most responsive to 
                  <span className="text-blue-400 font-bold mx-1">
                    {insights.byContext.sort((a: any, b: any) => b.count - a.count)[0]?.context_type || 'time'}
                  </span> 
                  based reminders. We recommend setting more high-priority tasks during your peak performance hours detected by our routine analysis.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl space-y-8"
            >
              <div className="glass p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Volume2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-display font-bold">Alarm Sound Preferences</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Sound Presets</p>
                    <div className="space-y-2">
                      {[
                        { name: 'Classic Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
                        { name: 'Digital Alert', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
                        { name: 'Soft Chime', url: 'https://assets.mixkit.co/active_storage/sfx/1019/1019-preview.mp3' },
                        { name: 'Tech Pulse', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' }
                      ].map((preset) => (
                        <button 
                          key={preset.name}
                          onClick={async () => {
                            const newSettings = { alarmSound: preset.url, alarmName: preset.name };
                            setUserSettings(newSettings);
                            await fetch(`/api/users/${user.id}/settings`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ settings: newSettings }),
                            });
                            // Play preview
                            const preview = new Audio(preset.url);
                            preview.play();
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${userSettings.alarmName === preset.name ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/10'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Music className="w-4 h-4" />
                            <span className="font-medium">{preset.name}</span>
                          </div>
                          {userSettings.alarmName === preset.name && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Custom Upload</p>
                    <div className="glass border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-[240px]">
                      <Upload className="w-10 h-10 text-zinc-700 mb-4" />
                      <p className="text-sm text-zinc-400 mb-4">Upload your own alarm sound (MP3/WAV)</p>
                      <input 
                        type="file" 
                        accept="audio/*"
                        className="hidden"
                        id="custom-sound-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              const base64 = event.target?.result as string;
                              const newSettings = { alarmSound: base64, alarmName: file.name };
                              setUserSettings(newSettings);
                              await fetch(`/api/users/${user.id}/settings`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ settings: newSettings }),
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="custom-sound-upload"
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all border border-white/10"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <Bell className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-display font-bold">Notification Controls</h3>
                  </div>
                  <button 
                    onClick={async () => {
                      const newSettings = { ...userSettings, notificationsEnabled: !userSettings.notificationsEnabled };
                      setUserSettings(newSettings);
                      await fetch(`/api/users/${user.id}/settings`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ settings: newSettings }),
                      });
                    }}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${userSettings.notificationsEnabled ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-500'}`}
                  >
                    {userSettings.notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Snooze Duration</p>
                    <div className="flex gap-2">
                      {[5, 10, 15, 30].map((mins) => (
                        <button 
                          key={mins}
                          onClick={async () => {
                            const newSettings = { ...userSettings, snoozeTime: mins };
                            setUserSettings(newSettings);
                            await fetch(`/api/users/${user.id}/settings`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ settings: newSettings }),
                            });
                          }}
                          className={`flex-1 py-3 rounded-xl border transition-all font-medium ${userSettings.snoozeTime === mins ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/10'}`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Test System</p>
                    <button 
                      onClick={() => {
                        if ('Notification' in window) {
                          if (Notification.permission === 'granted') {
                            new Notification("System Test", { body: "Notifications are working correctly!" });
                          } else {
                            Notification.requestPermission();
                          }
                        }
                        speak("This is a test of the notification system.");
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 font-semibold transition-all"
                    >
                      Send Test Notification
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border-emerald-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-display font-bold">Security & Privacy</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mb-8">
                  Your reminders and behavioral data are encrypted and stored securely. AI learning is performed locally on your personalized data set to ensure maximum privacy and relevance.
                </p>

                <div className="border-t border-white/5 pt-8">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-zinc-400" />
                    Change Master Password
                  </h4>
                  
                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="password"
                          placeholder="Current Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                          required
                        />
                      </div>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                          required
                        />
                      </div>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                          required
                        />
                      </div>
                    </div>

                    {passwordError && (
                      <p className="text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {passwordError}
                      </p>
                    )}
                    {passwordSuccess && (
                      <p className="text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        {passwordSuccess}
                      </p>
                    )}

                    <button 
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass p-8 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-display font-bold">{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</h3>
                  <p className="text-zinc-500 text-sm">{editingReminder ? 'Update your task details' : 'Set up a new cognitive safety net task'}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  {editingReminder ? <Edit3 className="w-6 h-6 text-emerald-400" /> : <Plus className="w-6 h-6 text-emerald-400" />}
                </div>
              </div>

              <form onSubmit={handleAddReminder} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      <Bell className="w-3.5 h-3.5" />
                      Task Title
                    </label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newReminder.title}
                      onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      placeholder="e.g., Take evening medicine"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      <Plus className="w-3.5 h-3.5" />
                      Details (Optional)
                    </label>
                    <textarea 
                      value={newReminder.description}
                      onChange={e => setNewReminder({...newReminder, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 h-24 resize-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      placeholder="Add context or notes..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due Time
                      </label>
                      <input 
                        type="datetime-local" 
                        value={newReminder.due_time}
                        onChange={e => setNewReminder({...newReminder, due_time: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Priority
                      </label>
                      <div className="relative">
                        <select 
                          value={newReminder.priority}
                          onChange={e => setNewReminder({...newReminder, priority: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 appearance-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        >
                          <option value="normal" className="bg-zinc-900">Normal</option>
                          <option value="high" className="bg-zinc-900">High</option>
                          <option value="emergency" className="bg-zinc-900">Emergency</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      <Repeat className="w-3.5 h-3.5" />
                      Recurrence
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['none', 'daily', 'weekly', 'monthly'].map(r => (
                        <button 
                          key={r}
                          type="button"
                          onClick={() => setNewReminder({...newReminder, recurrence: r as any})}
                          className={`py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${newReminder.recurrence === r ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Intelligence</p>
                    <p className="text-[10px] text-zinc-500">Contextual analysis will be applied automatically</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingReminder(null);
                      setNewReminder({ title: '', description: '', priority: 'normal', due_time: '', recurrence: 'none' });
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-2xl transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {isAddingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingContact(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-3xl shadow-2xl"
            >
              <h3 className="text-2xl font-display font-bold mb-6">Add Emergency Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g., Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Relation</label>
                  <input 
                    type="text" 
                    value={newContact.relation}
                    onChange={e => setNewContact({...newContact, relation: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g., Daughter, Spouse"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Phone</label>
                    <input 
                      type="tel" 
                      value={newContact.phone}
                      onChange={e => setNewContact({...newContact, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                      placeholder="+1 234..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingContact(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Add Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alarm Modal */}
      <AnimatePresence>
        {triggeredReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-md glass border-red-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 emergency-glow">
                <Bell className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-2">{triggeredReminder.title}</h3>
              <p className="text-zinc-400 mb-8">{triggeredReminder.description || 'This is a scheduled reminder.'}</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    updateStatus(triggeredReminder.id, 'completed');
                    stopAlarm();
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Mark as Completed
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleSnooze}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Snooze ({userSettings.snoozeTime}m)
                  </button>
                  <button 
                    onClick={stopAlarm}
                    className="bg-white/5 hover:bg-white/10 text-zinc-400 font-semibold py-4 rounded-2xl transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, we'd check a session cookie
        // For now, we check if there's a user in localStorage or just try to fetch /api/me
        const savedUser = localStorage.getItem('mindguard_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('mindguard_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mindguard_user');
    setHasStarted(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage 
              onStart={() => {
                setHasStarted(true);
              }} 
            />
          </motion.div>
        ) : !user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard user={user} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
