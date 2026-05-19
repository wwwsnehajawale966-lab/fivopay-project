import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Calendar, 
  CheckCircle2, 
  Settings, 
  Activity, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  Plus,
  PlusCircle,
  MoreHorizontal,
  ChevronRight,
  Circle,
  CheckCircle,
  Zap,
  Target,
  Trophy,
  Coffee,
  Loader2,
  X,
  Target as TargetIcon,
  Zap as ZapIcon,
  Smile,
  Brain,
  Sun,
  Moon,
  Cloud,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { plannerService } from '../services/api';

// --- Reusable Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-500 group relative ${
      active 
        ? '' 
        : ''
    }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" style={{ backgroundColor: '#06B6D4' }} />
    )}
    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} style={active ? { color: '#06B6D4' } : { color: '#475569' }} />
    <span className={`text-sm tracking-tight transition-all ${active ? 'font-black' : 'font-bold'}`} style={active ? { color: '#06B6D4' } : { color: '#475569' }}>{label}</span>
  </button>
);

const PlannerTaskCard = ({ task, onToggle, onDelete }) => {
  const priorityColors = {
    High: { bg: '#F8FAFC', color: '#EF4444', border: '#D1FAE5' },
    Medium: { bg: '#F8FAFC', color: '#F59E0B', border: '#D1FAE5' },
    Low: { bg: '#F8FAFC', color: '#06B6D4', border: '#D1FAE5' }
  };

  return (
    <div className={`group p-5 rounded-[24px] border-2 transition-all duration-500 hover:shadow-premium h-full flex flex-col ${
      task.completed ? 'opacity-60' : 'shadow-premium-sm hover:shadow-xl'
    }`} style={{
      backgroundColor: '#FFFFFF',
      borderColor: task.completed ? '#D1FAE5' : 'transparent'
    }}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task)}
          className="transition-all duration-500 shrink-0"
          style={task.completed ? { color: '#22C55E' } : { color: '#94A3B8' }}
        >
          {task.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-black transition-all duration-500 truncate leading-tight ${
            task.completed ? 'line-through' : ''
          }`} style={task.completed ? { color: '#22C55E' } : { color: '#0F172A' }}>{task.title}</h4>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-black px-2 py-1 rounded border" style={{
              backgroundColor: priorityColors[task.priority].bg,
              color: priorityColors[task.priority].color,
              borderColor: priorityColors[task.priority].border
            }}>{task.estimated_time || '1h'}</span>
            <div className="flex items-center gap-1" style={{ color: '#475569' }}>
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-black">{task.estimated_time || '1h'}</span>
            </div>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#D1FAE5' }} />
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>{task.status}</span>
          </div>
        </div>
        
        <button 
          onClick={() => onDelete(task.id)}
          className={`p-2 rounded-xl transition-all shadow-sm shrink-0 ${
            task.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ color: task.completed ? '#EF4444' : '#94A3B8' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = task.completed ? '#EF4444' : '#EF4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = task.completed ? '#EF4444' : '#94A3B8' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FocusTimerCard = ({ activeTask, onSessionComplete }) => {
  const TOTAL = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const startTimeRef = React.useRef(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      saveSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const saveSession = async () => {
    setIsActive(false);
    const endTime = new Date();
    const elapsedSeconds = TOTAL - timeLeft;
    const duration = Math.max(1, Math.round(elapsedSeconds / 60));
    try {
      await onSessionComplete({
        start_time: startTimeRef.current || new Date(Date.now() - elapsedSeconds * 1000),
        end_time: endTime,
        duration_minutes: duration
      });
      setSessionSaved(true);
      setTimeout(() => setSessionSaved(false), 4000);
    } catch (err) {
      console.error('Failed to save session:', err);
    }
    setTimeLeft(TOTAL);
    setHasStarted(false);
    startTimeRef.current = null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isActive && !hasStarted) {
      startTimeRef.current = new Date();
      setHasStarted(true);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setHasStarted(false);
    setTimeLeft(TOTAL);
    startTimeRef.current = null;
  };

  const progress = ((TOTAL - timeLeft) / TOTAL); // 0 to 1
  const circumference = 2 * Math.PI * 88; // ~553

  return (
    <div className="p-6 rounded-[24px] border text-center relative overflow-hidden shrink-0" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5', boxShadow: '0 2px 16px rgba(6,182,212,0.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: '#06B6D4' }}>Deep Work</h4>
        <div className={`p-2 rounded-full transition-all ${isActive ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: isActive ? '#06B6D4' : '#F8FAFC', color: isActive ? '#FFFFFF' : '#94A3B8' }}>
          <Brain className="w-4 h-4" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-5">
        {/* Play / Pause */}
        <button
          onClick={toggleTimer}
          className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(6,182,212,0.35)' }}
        >
          {isActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          {isActive ? 'Pause' : hasStarted ? 'Resume' : 'Start'}
        </button>
        {/* Reset */}
        <button
          onClick={resetTimer}
          title="Reset Timer"
          className="p-3 rounded-2xl border transition-all hover:bg-gray-100"
          style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#94A3B8' }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Stop & Save — shown only after timer started */}
      {hasStarted && (
        <button
          onClick={saveSession}
          className="w-full mb-5 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border flex items-center justify-center gap-2 transition-all hover:shadow-md"
          style={{ backgroundColor: '#F0FDF4', borderColor: '#86EFAC', color: '#16A34A' }}
        >
          <CheckCircle className="w-4 h-4" />
          Stop &amp; Save Session
        </button>
      )}

      {/* Circular Timer */}
      <div className="relative inline-block mb-5">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 192 192">
          {/* Background track */}
          <circle cx="96" cy="96" r="88" fill="none" strokeWidth="8" stroke="#F1F5F9" />
          {/* Progress arc */}
          <circle
            cx="96" cy="96" r="88" fill="none" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ stroke: isActive ? '#06B6D4' : (hasStarted ? '#0891B2' : '#CBD5E1'), transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tighter" style={{ color: '#0F172A' }}>{formatTime(timeLeft)}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] mt-1" style={{ color: '#94A3B8' }}>
            {isActive ? 'FOCUSING...' : hasStarted ? 'PAUSED' : 'READY'}
          </span>
        </div>
      </div>

      {/* Focus Target */}
      <div className="mb-4 px-4 py-3 rounded-2xl border" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#06B6D4' }}>Focus Target</p>
        <h5 className="text-sm font-black truncate" style={{ color: '#0F172A' }}>
          {activeTask?.title || '🧘 Relax and breathe'}
        </h5>
      </div>

      {/* Success Banner */}
      {sessionSaved && (
        <div className="mb-3 py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2"
          style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
          <CheckCircle className="w-4 h-4" />
          Session saved! Great work 🎉
        </div>
      )}

    </div>
  );
};


const ProductivitySummaryCard = ({ stats }) => (
  <div className="rounded-[32px] p-6 text-white shadow-premium relative overflow-hidden group shrink-0" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
    
    <div className="flex items-center gap-2 mb-6 relative z-10">
      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-lg">
        <ZapIcon className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/90">Performance</h4>
    </div>
    
    <div className="grid grid-cols-2 gap-4 relative z-10">
      <div>
        <p className="text-2xl font-black">{stats.totalCompletedTasks || 0}</p>
        <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mt-1">Done</p>
      </div>
      <div>
        <p className="text-2xl font-black">{stats.pendingTasks || 0}</p>
        <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mt-1">To Do</p>
      </div>
      <div>
        <p className="text-2xl font-black">{stats.totalFocusMinutes || 0}m</p>
        <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mt-1">Deep Time</p>
      </div>
      <div>
        <p className="text-2xl font-black text-white/90">{stats.productivityScore || 0}%</p>
        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">Score</p>
      </div>
    </div>
    
    <div className="mt-6 pt-6 border-t border-white/20 relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Daily Target</span>
        <span className="text-[11px] font-black">{stats.percentage || 0}%</span>
      </div>
      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
          style={{ 
            width: `${stats.percentage || 0}%`,
            background: 'linear-gradient(90deg, #22C55E 0%, #22C55E var(--progress-width, 0%), #EF4444 var(--progress-width, 0%), #EF4444 100%)'
          }}
        />
      </div>
    </div>
    
    {/* Additional Performance Metrics */}
    <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 mb-1">Avg Task Time</p>
          <p className="text-lg font-black">{stats.averageTaskTime || '0m'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 mb-1">Focus Efficiency</p>
          <p className="text-lg font-black">{stats.focusEfficiency || 0}%</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

const Planner = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completedTasks: 0, totalFocusMinutes: 0 });
  const [isAddingTask, setIsAddingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await plannerService.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await plannerService.getDailyStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const handleAddTask = async (block) => {
    if (!newTaskTitle.trim()) return setIsAddingTask(null);
    try {
      const res = await plannerService.createTask({
        title: newTaskTitle,
        block,
        priority: 'Medium',
        estimated_time: '1h',
        status: 'Pending'
      });
      setTasks([res.data, ...tasks]);
      setNewTaskTitle('');
      setIsAddingTask(null);
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const toggleTask = async (task) => {
    try {
      const res = await plannerService.updateTask(task.id, {
        ...task,
        completed: !task.completed,
        status: !task.completed ? 'Completed' : 'Pending'
      });
      setTasks(tasks.map(t => t.id === task.id ? res.data : t));
      fetchStats();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await plannerService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
      fetchStats();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleSaveFocus = async (sessionData) => {
    try {
      const activeTask = tasks.find(t => !t.completed && t.status === 'In Progress');
      await plannerService.saveFocusSession({
        ...sessionData,
        task_id: activeTask?.id || null,
        productivity_score: 85
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to save focus session', err);
    }
  };

  // Calculate average time spent on tasks
  const calculateAverageTaskTime = (taskList) => {
    const completedTasks = taskList.filter(t => t.completed);
    if (completedTasks.length === 0) return '0m';
    
    // Parse estimated times and calculate average
    const times = completedTasks.map(task => {
      const timeStr = task.estimated_time || '1h';
      const hours = parseFloat(timeStr.match(/(\d+)h/)?.[1] || 0);
      const minutes = parseFloat(timeStr.match(/(\d+)m/)?.[1] || 0);
      return hours * 60 + minutes; // Convert to minutes
    }).filter(time => time > 0);
    
    const totalMinutes = times.reduce((sum, time) => sum + time, 0);
    const avgMinutes = Math.round(totalMinutes / times.length);
    
    if (avgMinutes >= 60) {
      const hours = Math.floor(avgMinutes / 60);
      const mins = avgMinutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${avgMinutes}m`;
  };

  // Calculate productivity score based on completion rate and time
  const calculateProductivityScore = (taskList) => {
    const completedTasks = taskList.filter(t => t.completed);
    const totalTasks = taskList.length;
    
    if (totalTasks === 0) return 0;
    
    const completionRate = (completedTasks.length / totalTasks) * 100;
    const onTimeCompletion = completedTasks.filter(t => {
      // Check if task was completed on time (simplified logic)
      return t.status === 'Completed';
    }).length;
    
    const timeEfficiency = completedTasks.length > 0 ? (onTimeCompletion / completedTasks.length) * 100 : 0;
    
    return Math.round((completionRate * 0.6) + (timeEfficiency * 0.4));
  };

  // Calculate focus efficiency based on completed tasks vs focus time
  const calculateFocusEfficiency = (taskList) => {
    const completedTasks = taskList.filter(t => t.completed);
    const totalFocusMinutes = stats.totalFocusMinutes || 0;
    
    if (totalFocusMinutes === 0 || completedTasks.length === 0) return 0;
    
    // Assume each task takes average of 30 minutes of focused work
    const estimatedTaskMinutes = completedTasks.length * 30;
    const efficiency = (estimatedTaskMinutes / totalFocusMinutes) * 100;
    
    return Math.min(Math.round(efficiency), 100);
  };

  const activeTask = tasks.find(t => !t.completed && t.status === 'In Progress');
  
  const displayStats = {
    ...stats,
    pendingTasks: tasks.filter(t => !t.completed).length,
    percentage: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
    // Performance calculations
    totalCompletedTasks: tasks.filter(t => t.completed).length,
    averageTaskTime: calculateAverageTaskTime(tasks),
    productivityScore: calculateProductivityScore(tasks),
    focusEfficiency: calculateFocusEfficiency(tasks)
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-accent-indigo animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Smile className="w-6 h-6 text-accent-indigo animate-bounce" />
        </div>
      </div>
      <p className="mt-8 text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Optimizing Your Planner...</p>
    </div>
  );

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ backgroundColor: '#ECFEFF' }}>
      {/* Sidebar */}
      <aside className="w-64 h-full flex flex-col shrink-0 z-20 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #D1FAE5' }}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shadow-lg shadow-indigo-300/50 text-white" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg leading-tight tracking-tighter" style={{ color: '#0F172A' }}>FivoPay</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#94A3B8' }}>Personal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-6 mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#94A3B8' }}>Workspace</p>
          </div>
          <SidebarItem icon={Layout} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <SidebarItem icon={Calendar} label="Planner" active onClick={() => {}} />
          <SidebarItem icon={Activity} label="Analytics" onClick={() => navigate('/analytics')} />
          <SidebarItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
        </nav>

        <div className="p-6 mt-auto">
          <div className="rounded-[24px] p-4 flex items-center gap-4 border shadow-sm backdrop-blur-sm transition-all duration-500" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }}>
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-black shadow-lg text-md" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: '#94A3B8' }}>Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tighter" style={{ color: '#0F172A' }}>Planner</h1>
              <div className="px-3 py-1 text-white rounded-xl text-xs font-black shadow-md" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                Today
              </div>
            </div>
            <p className="font-bold text-xs" style={{ color: '#94A3B8' }}>Plan your day, achieve your goals</p>
          </div>
          <button 
            onClick={() => setIsAddingTask('Morning')} 
            className="text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all transform hover:-translate-y-1 flex items-center gap-2" 
            style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </header>

        <div className="space-y-8">
          {/* Time Block Planning */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { id: 'Morning', icon: Sun, color: '#F59E0B', bg: '#F8FAFC' },
              { id: 'Afternoon', icon: Cloud, color: '#06B6D4', bg: '#F8FAFC' },
              { id: 'Evening', icon: Moon, color: '#0891B2', bg: '#F8FAFC' }
            ].map((block) => (
              <div key={block.id} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl shadow-sm transition-transform hover:scale-110 duration-500" style={{ backgroundColor: block.bg, color: block.color }}>
                      <block.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: '#0F172A' }}>{block.id}</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full text-[9px] font-black text-white shadow-md" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                    {tasks.filter(t => t.block === block.id && !t.completed).length}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {tasks.filter(t => t.block === block.id && !t.completed).map(task => (
                    <PlannerTaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={handleDeleteTask} />
                  ))}
                  
                  {isAddingTask === block.id ? (
                    <div className="p-4 rounded-[20px] border-2 shadow-premium animate-in zoom-in-95 duration-500 w-full" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
                      <input 
                        autoFocus 
                        type="text"
                        placeholder="What needs to be done?"
                        value={newTaskTitle} 
                        onChange={(e) => setNewTaskTitle(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-base font-black"
                        style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(6, 182, 212, 0.2)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleAddTask(block.id)}
                          className="flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                          style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}
                        >
                          Add Task
                        </button>
                        <button
                          onClick={() => setIsAddingTask(null)}
                          className="px-4 py-3 transition-colors rounded-xl"
                          style={{ color: '#94A3B8' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setIsAddingTask(block.id)} className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-[20px] font-black text-[9px] uppercase tracking-wider transition-all duration-500 group" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#06B6D4' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.color = '#0891B2' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.color = '#06B6D4' }}>
                      <PlusCircle className="w-5 h-5 group-hover:rotate-90 duration-500" />
                      Add Mission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Completed Section */}
          <section className="pt-8 border-t" style={{ borderTop: '1px solid #D1FAE5' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl shadow-premium-sm" style={{ backgroundColor: '#F8FAFC', color: '#22C55E' }}>
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: '#0F172A' }}>Success Journey</h2>
                  <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: '#94A3B8' }}>Recently Accomplished</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tasks.filter(t => t.completed).map(task => (
                <PlannerTaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={handleDeleteTask} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Right Focus Panel */}
      <aside className="w-[340px] h-full flex flex-col shrink-0 z-10" style={{ backgroundColor: '#F8FAFC', borderLeft: '1px solid #D1FAE5' }}>
        <div className="flex-1 min-h-0 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <ProductivitySummaryCard stats={displayStats} />

          {/* Focus Timer */}
          <FocusTimerCard activeTask={activeTask} onSessionComplete={handleSaveFocus} />

          {/* Daily Wisdom Card */}
          <div className="p-6 rounded-[24px] border relative overflow-hidden group shadow-sm transition-all hover:shadow-premium duration-500 shrink-0" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }}>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
              <div className="w-24 h-24 rounded-full blur-2xl" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }} />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
               <div className="p-2 rounded-lg shadow-md text-white" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                  <Star className="w-3.5 h-3.5 fill-white" />
               </div>
               <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#06B6D4' }}>Daily Wisdom</span>
            </div>
            <p className="font-bold text-sm relative z-10 leading-relaxed tracking-tight italic" style={{ color: '#0F172A' }}>
              "Your attention is your greatest asset. Invest it wisely in things that grow you."
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Planner;
