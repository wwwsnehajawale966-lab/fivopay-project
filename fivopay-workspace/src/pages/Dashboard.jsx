import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { workspaceService } from '../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { LayoutDashboard, PlusCircle, Trash2, X, Target, ChevronRight, Calendar, User, Clock, MoreVertical, Check, Plus, Rocket, Calendar as CalendarIcon, Activity, Loader2, Search, UserPlus, Settings, Layout, Bell, MoreHorizontal, CheckCircle2, Star, AlertCircle, Menu } from 'lucide-react';

// --- Label Config (Clean Enterprise Colors) ---
const LABEL_COLORS = {
  'Marketing': 'bg-purple-50 text-purple-700 border-purple-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
  'Development': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Design': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Meeting': 'bg-amber-50 text-amber-700 border-amber-200',
};

// --- Sidebar Component (Pastel / Apple Style) ---
const SidebarItem = ({ icon: Icon, label, active, onClick, t }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 mx-2 transition-all duration-200 rounded-lg font-medium text-sm ${
      active
        ? 'shadow-lg'
        : ''
    }`}
    style={active ? { backgroundColor: '#06B6D4', color: '#FFFFFF' } : { color: '#475569' }}
  >
    <Icon className={`w-5 h-5`} />
    <span>{label}</span>
  </button>
);

// --- Calendar Dropdown Component ---
const CalendarDropdown = ({ selectedDate, onDateSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };
  
  const formatDate = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const handleDateSelect = (dateStr) => {
    onDateSelect(dateStr);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Calendar Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
          selectedDate
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-300/50'
            : 'bg-gradient-to-r from-white to-indigo-50 text-indigo-500 border border-indigo-100 hover:border-indigo-300'
        }`}
        title={selectedDate ? `Filtered: ${selectedDate}` : 'Filter by date'}
      >
        <CalendarIcon className="w-5 h-5" />
      </button>
      
      {/* Red Dot Indicator */}
      {selectedDate && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
      )}
      
      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[28px] p-5 shadow-2xl border border-indigo-100 z-50 animate-in zoom-in-95 duration-200">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <span className="text-sm font-black text-slate-800">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-300 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="h-8" />;
              const dateStr = formatDate(day);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <button
                  key={`day-${dateStr}`}
                  onClick={() => handleDateSelect(isSelected ? '' : dateStr)}
                  className={`h-8 w-8 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-300/50'
                      : isToday
                      ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-300'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          {/* Clear Selection */}
          {selectedDate && (
            <button
              onClick={() => handleDateSelect('')}
              className="w-full mt-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
            >
              Show All Dates
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ boards, activeBoardId, onBoardSelect, onCreateBoard, onDeleteBoard, onLogout, user, navigate, sidebarOpen, onClose }) => (
  <>
    {/* Sidebar */}
    <aside
      className={`h-full w-80 flex flex-col shrink-0 transition-transform duration-300 ease-in-out fixed lg:relative z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #D1FAE5' }}
    >
      <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: '#D1FAE5' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: '#0F172A' }}>FivoPay</h2>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Workspace</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors lg:hidden"
          style={{ color: '#94A3B8' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#475569' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
          title="Close Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Main Menu</p>
        </div>
        <SidebarItem icon={Layout} label="Dashboard" active onClick={() => navigate('/dashboard')} />
        <SidebarItem icon={CalendarIcon} label="Planner" onClick={() => navigate('/planner')} />
        <SidebarItem icon={Activity} label="Analytics" onClick={() => navigate('/analytics')} />
        <SidebarItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />

        <div className="px-4 py-4 mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Projects</p>
          <button onClick={onCreateBoard} className="p-1.5 rounded-lg transition-all" style={{ backgroundColor: '#F8FAFC', color: '#06B6D4' }}>
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1 px-2">
          {boards.map(board => (
            <div key={board.id} className="relative group flex items-center">
              <button
                onClick={() => onBoardSelect(board.id)}
                className={`flex-1 flex items-center gap-3 px-4 py-2.5 transition-all duration-200 rounded-lg font-medium text-sm ${
                  activeBoardId === board.id
                    ? 'shadow-lg'
                    : ''
                }`}
                style={activeBoardId === board.id ? { backgroundColor: '#06B6D4', color: '#FFFFFF' } : { color: '#475569' }}
              >
                <div className={`w-2 h-2 rounded-full ${activeBoardId === board.id ? 'bg-white' : 'bg-gray-600'}`} />
                <span className="truncate">{board.title}</span>
              </button>
              {onDeleteBoard && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }}
                  className="absolute right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50 text-red-500"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 mt-auto border-t" style={{ borderColor: '#D1FAE5' }}>
        <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#0F172A' }}>{user?.name}</p>
            <button onClick={onLogout} className="text-xs transition-colors" style={{ color: '#94A3B8' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </aside>
  </>
);

// --- Dashboard Main ---
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [lists, setLists] = useState([]);
  const [users, setUsers] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddingList, setIsAddingList] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [editingCard, setEditingCard] = useState(null);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationDropdownRef = useRef(null);


  // Helper functions for notifications
  const formatNotificationTime = (time) => {
    const now = new Date();
    const diff = (now - new Date(time)) / 1000;
    
    if (diff < 60) return t('justNow');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assigned': return { icon: User, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'dueToday': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' };
      case 'dueTomorrow': return { icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-100' };
      case 'overdue': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-100' };
      case 'completed': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' };
      default: return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    // Find the card and open it
    const list = lists.find(l => l.id === notification.listId);
    if (list) {
      const card = list.cards.find(c => c.id === notification.cardId);
      if (card) {
        setEditingCard({ ...card, listId: notification.listId });
      }
    }
    setShowNotificationDropdown(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchBoards = useCallback(async () => {
    try {
      const res = await workspaceService.getBoards();
      setBoards(res.data);
      if (res.data.length > 0 && !activeBoardId) {
        setActiveBoardId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch boards', err);
    } finally {
      setLoading(false);
    }
  }, [activeBoardId]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await workspaceService.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, []);

  const fetchBoardMembers = useCallback(async (boardId) => {
    if (!boardId) return;
    try {
      const res = await workspaceService.getBoardMembers(boardId);
      setBoardMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch board members', err);
    }
  }, []);

  const fetchBoardData = useCallback(async (boardId, date) => {
    if (!boardId) return;
    try {
      const res = await workspaceService.getBoardData(boardId, date);
      setLists(res.data);
    } catch (err) {
      console.error('Failed to fetch lists', err);
    }
  }, []);

  useEffect(() => { fetchBoards(); fetchUsers(); }, [fetchBoards, fetchUsers]);
  useEffect(() => {
    if (activeBoardId) {
      fetchBoardData(activeBoardId, selectedDate);
      fetchBoardMembers(activeBoardId);
    }
  }, [activeBoardId, selectedDate, fetchBoardData, fetchBoardMembers]);

  // Generate notifications based on tasks
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      lists.forEach(list => {
        list.cards.forEach(card => {
          // Task assigned to current user
          if (card.assigned_to === user?.id && !card.is_done) {
            newNotifications.push({
              id: `assigned-${card.id}`,
              type: 'assigned',
              title: t('newTaskAssigned'),
              message: `"${card.title}" has been assigned to you`,
              time: new Date(card.created_at || Date.now()),
              cardId: card.id,
              listId: list.id,
              priority: 'high',
              read: false
            });
          }
          
          // Due date alerts
          if (card.due_date && !card.is_done) {
            const dueDate = new Date(card.due_date);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
              // Due today
              newNotifications.push({
                id: `due-today-${card.id}`,
                type: 'dueToday',
                title: t('dueToday'),
                message: `"${card.title}" is due today`,
                time: now,
                cardId: card.id,
                listId: list.id,
                priority: 'urgent',
                read: false
              });
            } else if (diffDays === 1) {
              // Due tomorrow
              newNotifications.push({
                id: `due-tomorrow-${card.id}`,
                type: 'dueTomorrow',
                title: t('dueTomorrow'),
                message: `"${card.title}" is due tomorrow`,
                time: now,
                cardId: card.id,
                listId: list.id,
                priority: 'high',
                read: false
              });
            } else if (diffDays < 0) {
              // Overdue
              newNotifications.push({
                id: `overdue-${card.id}`,
                type: 'overdue',
                title: t('taskOverdue'),
                message: `"${card.title}" is ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`,
                time: now,
                cardId: card.id,
                listId: list.id,
                priority: 'urgent',
                read: false
              });
            }
          }
          
          // Recently completed tasks (within last 24 hours)
          if (card.is_done && card.updated_at) {
            const updatedAt = new Date(card.updated_at);
            const hoursSinceCompletion = (now - updatedAt) / (1000 * 60 * 60);
            
            if (hoursSinceCompletion <= 24) {
              newNotifications.push({
                id: `completed-${card.id}`,
                type: 'completed',
                title: t('taskCompleted'),
                message: `"${card.title}" has been completed`,
                time: updatedAt,
                cardId: card.id,
                listId: list.id,
                priority: 'normal',
                read: false
              });
            }
          }
        });
      });
      
      // Sort by priority and time
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      newNotifications.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.time - a.time;
      });
      
      setNotifications(newNotifications);
    };
    
    if (lists.length > 0) {
      generateNotifications();
    }
  }, [lists, user]);

  const handleUpdateBoardTitle = async () => {
    if (!editBoardTitle.trim() || !activeBoardId) {
      setIsEditingBoard(false);
      return;
    }
    try {
      await workspaceService.updateBoard(activeBoardId, editBoardTitle);
      setBoards(boards.map(b => b.id === activeBoardId ? { ...b, title: editBoardTitle } : b));
      setIsEditingBoard(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update board title');
    }
  };

  const handleCreateBoard = async () => {
    const title = prompt('Enter board title:');
    if (!title) return;
    try {
      const res = await workspaceService.createBoard(title);
      setBoards([res.data, ...boards]);
      setActiveBoardId(res.data.id);
      setIsInviting(false);
    } catch (err) {
      alert('Failed to invite user');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will delete all its lists and cards.')) return;
    try {
      await workspaceService.deleteBoard(boardId);
      const newBoards = boards.filter(b => b.id !== boardId);
      setBoards(newBoards);
      if (activeBoardId === boardId) {
        setActiveBoardId(newBoards.length > 0 ? newBoards[0].id : null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete board');
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    // Close modal immediately for better UX
    setIsAddingList(false);
    
    try {
      const res = await workspaceService.createList({
        boardId: activeBoardId,
        title: newListTitle,
        position: lists.length
      });
      setLists([...lists, { ...res.data, cards: [] }]);
      setNewListTitle('');
      console.log('List created successfully');
    } catch (err) {
      console.error('Failed to add list:', err);
      alert('Failed to add list');
      // Reopen modal if creation failed
      setIsAddingList(true);
    }
  };

  const handleUpdateListTitle = async (listId) => {
    if (!editTitleValue.trim()) return setEditingListId(null);
    try {
      await workspaceService.updateList({ listId, title: editTitleValue });
      setLists(lists.map(l => l.id === listId ? { ...l, title: editTitleValue } : l));
      setEditingListId(null);
    } catch (err) {
      alert('Failed to update title');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Delete this list?')) return;
    try {
      await workspaceService.deleteList(listId);
      setLists(lists.filter(l => l.id !== listId));
    } catch (err) {
      alert('Failed to delete list');
    }
  };

  const handleAddCard = async (listId, title, label = '') => {
    try {
      const list = lists.find(l => l.id === listId);
      const res = await workspaceService.createCard({
        listId,
        title,
        position: list.cards.length,
        due_date: selectedDate,
        labels: label ? [label] : []
      });
      setLists(lists.map(l => l.id === listId ? { ...l, cards: [...l.cards, res.data] } : l));
      setEditingCard({ ...res.data, listId, labels: label ? [label] : [] });
    } catch (err) {
      alert('Failed to add card');
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard.title.trim()) return;
    try {
      // Ensure checklist is an array before sending to backend
      let checklistArray = [];
      if (editingCard.checklist) {
        console.log('Original checklist type:', typeof editingCard.checklist);
        console.log('Original checklist value:', editingCard.checklist);
        
        if (Array.isArray(editingCard.checklist)) {
          checklistArray = editingCard.checklist;
        } else if (typeof editingCard.checklist === 'string') {
          try {
            checklistArray = JSON.parse(editingCard.checklist);
          } catch (e) {
            console.error('Failed to parse checklist string:', e);
            checklistArray = [];
          }
        } else if (typeof editingCard.checklist === 'object' && editingCard.checklist !== null) {
          // Convert object to array - check if it's array-like with numeric keys
          const values = Object.values(editingCard.checklist);
          checklistArray = values.filter(item => item && typeof item === 'object' && 'id' in item && 'text' in item);
        } else {
          console.warn('Unexpected checklist type, converting to empty array');
          checklistArray = [];
        }
      }
      
      // Double-check it's an array
      if (!Array.isArray(checklistArray)) {
        console.error('checklistArray is not an array:', checklistArray);
        checklistArray = [];
      }
      
      // Final safety check - ensure we always send a clean array
      const finalChecklist = Array.isArray(checklistArray) ? checklistArray.filter(item => 
        item && typeof item === 'object' && 'id' in item && 'text' in item
      ) : [];
      
      const updateData = {
        cardId: editingCard.id,
        title: editingCard.title,
        description: editingCard.description,
        due_date: editingCard.due_date,
        assigned_to: editingCard.assigned_to,
        is_done: editingCard.is_done,
        labels: editingCard.labels || [],
        name: editingCard.name || '',
        checklist: finalChecklist
      };
      
      console.log('Final checklist being sent:', finalChecklist);
      console.log('Final checklist type:', typeof finalChecklist);
      
      console.log('Sending update data:', updateData);
      console.log('checklistArray type:', typeof checklistArray);
      console.log('checklistArray value:', checklistArray);
      
      await workspaceService.updateCard(updateData);
      fetchBoardData(activeBoardId, selectedDate);
      setEditingCard(null);
    } catch (err) {
      console.error('Update card error:', err);
      alert('Failed to update card');
    }
  };

  const handleDeleteCard = async (listId, cardId) => {
    if (!window.confirm('Delete this card?')) return;
    console.log('Deleting card with ID:', cardId, 'from list:', listId);
    try {
      await workspaceService.deleteCard(cardId);
      console.log('Card deleted successfully');
      setLists(lists.map(l => l.id === listId ? { ...l, cards: l.cards.filter(c => c.id !== cardId) } : l));
    } catch (err) {
      console.error('Delete card error:', err);
      alert('Failed to delete card');
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim() || !editingCard) return;
    const newItem = {
      id: Date.now(),
      text: newChecklistItem,
      completed: false
    };
    
    // Debug: log the type and value of checklist
    console.log('editingCard.checklist type:', typeof editingCard.checklist);
    console.log('editingCard.checklist value:', editingCard.checklist);
    
    let currentChecklist = [];
    try {
      if (editingCard.checklist === null || editingCard.checklist === undefined) {
        currentChecklist = [];
      } else if (Array.isArray(editingCard.checklist)) {
        currentChecklist = editingCard.checklist;
      } else if (typeof editingCard.checklist === 'string') {
        currentChecklist = JSON.parse(editingCard.checklist || '[]');
      } else if (typeof editingCard.checklist === 'object') {
        // Convert object to array if it has numeric keys
        const objKeys = Object.keys(editingCard.checklist);
        if (objKeys.some(key => !isNaN(key))) {
          currentChecklist = Object.values(editingCard.checklist);
        } else {
          // If it's not array-like, convert to empty array
          currentChecklist = [];
        }
      } else {
        console.warn('Unexpected checklist type:', typeof editingCard.checklist);
        currentChecklist = [];
      }
    } catch (error) {
      console.error('Error parsing checklist:', error);
      currentChecklist = [];
    }
    
    setEditingCard({
      ...editingCard,
      checklist: [...currentChecklist, newItem]
    });
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (itemId) => {
    if (!editingCard) return;
    
    let currentChecklist = [];
    try {
      if (editingCard.checklist === null || editingCard.checklist === undefined) {
        currentChecklist = [];
      } else if (Array.isArray(editingCard.checklist)) {
        currentChecklist = editingCard.checklist;
      } else if (typeof editingCard.checklist === 'string') {
        currentChecklist = JSON.parse(editingCard.checklist || '[]');
      } else if (typeof editingCard.checklist === 'object') {
        const objKeys = Object.keys(editingCard.checklist);
        if (objKeys.some(key => !isNaN(key))) {
          currentChecklist = Object.values(editingCard.checklist);
        } else {
          currentChecklist = [];
        }
      } else {
        currentChecklist = [];
      }
    } catch (error) {
      currentChecklist = [];
    }
    
    const updatedChecklist = currentChecklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setEditingCard({
      ...editingCard,
      checklist: updatedChecklist
    });
  };

  const handleDeleteChecklistItem = (itemId) => {
    if (!editingCard) return;
    
    let currentChecklist = [];
    try {
      if (editingCard.checklist === null || editingCard.checklist === undefined) {
        currentChecklist = [];
      } else if (Array.isArray(editingCard.checklist)) {
        currentChecklist = editingCard.checklist;
      } else if (typeof editingCard.checklist === 'string') {
        currentChecklist = JSON.parse(editingCard.checklist || '[]');
      } else if (typeof editingCard.checklist === 'object') {
        const objKeys = Object.keys(editingCard.checklist);
        if (objKeys.some(key => !isNaN(key))) {
          currentChecklist = Object.values(editingCard.checklist);
        } else {
          currentChecklist = [];
        }
      } else {
        currentChecklist = [];
      }
    } catch (error) {
      currentChecklist = [];
    }
    
    const updatedChecklist = currentChecklist.filter(item => item.id !== itemId);
    setEditingCard({
      ...editingCard,
      checklist: updatedChecklist
    });
  };

  const calculateChecklistProgress = () => {
    if (!editingCard || !editingCard.checklist) return 0;
    
    let currentChecklist = [];
    try {
      if (editingCard.checklist === null || editingCard.checklist === undefined) {
        currentChecklist = [];
      } else if (Array.isArray(editingCard.checklist)) {
        currentChecklist = editingCard.checklist;
      } else if (typeof editingCard.checklist === 'string') {
        currentChecklist = JSON.parse(editingCard.checklist || '[]');
      } else if (typeof editingCard.checklist === 'object') {
        const objKeys = Object.keys(editingCard.checklist);
        if (objKeys.some(key => !isNaN(key))) {
          currentChecklist = Object.values(editingCard.checklist);
        } else {
          currentChecklist = [];
        }
      } else {
        currentChecklist = [];
      }
    } catch (error) {
      currentChecklist = [];
    }
    
    if (currentChecklist.length === 0) return 0;
    const completed = currentChecklist.filter(item => item.completed).length;
    return Math.round((completed / currentChecklist.length) * 100);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newLists = [...lists];
    const sourceList = newLists.find(l => String(l.id) === String(source.droppableId));
    const destList = newLists.find(l => String(l.id) === String(destination.droppableId));
    if (!sourceList || !destList) return;

    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);
    setLists(newLists);

    try {
      await workspaceService.moveCard({
        cardId: draggableId,
        newListId: destination.droppableId,
        newPosition: destination.index
      });
    } catch (err) {
      fetchBoardData(activeBoardId, selectedDate);
    }
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <Loader2 className="w-14 h-14 text-accent-indigo animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-accent-indigo rounded-full animate-pulse" />
        </div>
      </div>
      <p className="mt-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Launching Experience...</p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: '#ECFEFF', color: '#0F172A' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        boards={boards}
        activeBoardId={activeBoardId}
        onBoardSelect={setActiveBoardId}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
        onLogout={() => { logout(); navigate('/login'); }}
        user={user}
        navigate={navigate}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative" style={{ backgroundColor: '#ECFEFF' }}>
        <header className="h-16 flex items-center justify-between px-8 shrink-0 z-10" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #D1FAE5' }}>
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#06B6D4' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569' }}
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-3 min-w-0" style={{ color: '#0F172A' }}>
              {isEditingBoard ? (
                <input
                  autoFocus
                  value={editBoardTitle}
                  onChange={(e) => setEditBoardTitle(e.target.value)}
                  onBlur={handleUpdateBoardTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateBoardTitle()}
                  className="bg-slate-50 px-6 py-2 rounded-2xl border-2 border-accent-indigo outline-none text-2xl font-black"
                />
              ) : (
                <span
                  onClick={() => {
                    const currentBoard = boards.find(b => b.id === activeBoardId);
                    if (currentBoard) {
                      setEditBoardTitle(currentBoard.title);
                      setIsEditingBoard(true);
                    }
                  }}
                  className="truncate cursor-pointer hover:text-accent-indigo transition-all duration-300"
                >
                  {boards.find(b => b.id === activeBoardId)?.title || 'Board'}
                </span>
              )}
              <ChevronRight className="w-6 h-6 text-slate-200 shrink-0" />
            </h1>

            <div className="flex items-center gap-6">
               <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all group`} style={{ backgroundColor: selectedDate ? '#F0F9FF' : '#F8FAFC', borderColor: selectedDate ? '#06B6D4' : '#D1FAE5' }}>
                <CalendarIcon className={`w-4 h-4`} style={{ color: selectedDate ? '#06B6D4' : '#94A3B8' }} />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-black focus:ring-0 outline-none cursor-pointer"
                  style={{ color: '#475569' }}
                >
                  <option value="">All Dates</option>
                  <option value={new Date().toISOString().split('T')[0]}>Today</option>
                  <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Yesterday</option>
                  <option value={new Date(Date.now() + 86400000).toISOString().split('T')[0]}>Tomorrow</option>
                </select>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="p-1 rounded-lg transition-all"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#06B6D4' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
                    title="Clear date filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="relative hidden xl:block group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: '#94A3B8' }} />
                <input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none transition-all w-64"
                  style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(6, 182, 212, 0.2)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-5">
              <div className="flex -space-x-3.5">
                {boardMembers.slice(0, 5).map((u) => (
                  <div key={u.id} title={u.name} className="w-11 h-11 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm transition-transform hover:-translate-y-1 hover:z-10 uppercase cursor-pointer ring-1 ring-slate-100">
                    {u.name[0]}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setIsInviting(!isInviting)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/50 hover:scale-105 transition-all"
              >
                <UserPlus className="w-5 h-5" />
              </button>

              {/* Calendar Dropdown */}
              <CalendarDropdown selectedDate={selectedDate} onDateSelect={setSelectedDate} />

            </div>

            <div className="w-px h-8 bg-slate-100 mx-2" />

            <div className="relative" ref={notificationDropdownRef}>
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-4 bg-gradient-to-r from-white to-indigo-50 border border-indigo-100 rounded-[20px] text-indigo-400 hover:text-indigo-600 hover:shadow-xl hover:-translate-y-0.5 hover:border-indigo-200 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center px-1">
                    <span className="text-[10px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute top-full right-0 mt-3 w-96 bg-white rounded-[28px] shadow-2xl border border-indigo-100 z-50 animate-in zoom-in-95 duration-200 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Bell className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900">{t('notifications')}</h3>
                        <p className="text-[10px] text-slate-500">{unreadCount} {t('unread')}</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        {t('markAllRead')}
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">{t('noNotifications')}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{t('allCaughtUp')}</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const { icon: IconComponent, color, bg } = getNotificationIcon(notification.type);
                        return (
                          <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 ${bg} rounded-xl shrink-0`}>
                                <IconComponent className={`w-4 h-4 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className={`text-sm font-bold ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {formatNotificationTime(notification.time)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    notification.priority === 'urgent' ? 'bg-rose-100 text-rose-600' :
                                    notification.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {t(notification.priority)}
                                  </span>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400">Showing {notifications.length} notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-row gap-6 items-start min-w-max pb-12">
              {lists.map((list) => (
                <div key={list.id} className="w-72 shrink-0 flex flex-col bg-white rounded-lg p-3 shadow-sm" style={{ border: '1px solid #D1FAE5' }}>
                  <div className="px-3 py-2 flex items-center justify-between shrink-0 group">
                    <h3 className="font-semibold px-2 truncate text-sm" style={{ color: '#0F172A' }}>{list.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#F8FAFC', color: '#475569' }}>{list.cards.length}</div>
                      <div className="relative">
                        <button
                          onClick={() => setActiveListMenu(activeListMenu === list.id ? null : list.id)}
                          className="p-2.5 hover:bg-indigo-50 rounded-2xl text-slate-300 hover:text-indigo-500 transition-all shadow-sm"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {activeListMenu === list.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-[20px] shadow-premium border border-indigo-50 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                            <button
                              onClick={() => {
                                setActiveListMenu(null);
                                handleDeleteList(list.id);
                              }}
                              className="w-full px-5 py-3 text-left text-sm font-black text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors uppercase tracking-widest"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete List
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Droppable droppableId={String(list.id)} type="card">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 px-2 pb-2 space-y-3 transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-slate-200/20' : ''}`}
                      >
                        {list.cards
                          .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((card, index) => {
                            const overdue = isOverdue(card.due_date) && !card.is_done;
                            return (
                              <Draggable key={String(card.id)} draggableId={String(card.id)} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setEditingCard({ ...card, listId: list.id, labels: card.labels || [], checklist: card.checklist || [] })}
                                    className={`bg-white p-4 rounded-lg border transition-all duration-200 ease-out ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : 'hover:scale-[1.02] hover:shadow-md shadow-sm cursor-pointer'} ${overdue ? 'ring-2' : ''} group/card`}
                style={snapshot.isDragging ? { borderColor: '#06B6D4' } : { borderColor: '#D1FAE5' }}
                {...(overdue && { style: { ...{ borderColor: '#D1FAE5' }, ringColor: '#EF4444' } })}
                                  >
                                    {overdue && (
                                      <div className="flex items-center gap-1 text-xs font-semibold mb-2" style={{ color: '#EF4444' }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                                        <span>Overdue</span>
                                      </div>
                                    )}
                                    {card.labels?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {card.labels.map(l => (
                                          <span key={l} className={`px-2 py-0.5 rounded text-xs font-medium border ${LABEL_COLORS[l] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {l}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <h4 className={`font-medium text-sm mb-2 leading-snug ${card.is_done ? 'line-through' : ''}`} style={card.is_done ? { color: '#94A3B8' } : { color: '#0F172A' }}>{card.title}</h4>

                                    {card.description && <p className="text-xs mb-2 line-clamp-2" style={{ color: '#475569' }}>{card.description}</p>}

                                    {card.checklist?.length > 0 && (
                                      <div className="mb-2 p-2 rounded-lg border" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }}>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#94A3B8' }}>Progress</span>
                                          <span className="text-[10px] font-medium" style={{ color: '#475569' }}>{Math.round((card.checklist.filter(i => i.completed).length / card.checklist.length) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#D1FAE5' }}>
                                          <div
                                            className="h-full transition-all duration-300 ease-out"
                                            style={{ backgroundColor: '#06B6D4', width: `${(card.checklist.filter(i => i.completed).length / card.checklist.length) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #D1FAE5' }}>
                                      <div className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border"
                                        style={card.is_done
                                          ? { backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#22C55E' }
                                          : overdue
                                          ? { backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#EF4444' }
                                          : { backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#475569' }
                                        }>
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                      
                                      {card.assignee_name && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
                                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">
                                            {card.assignee_name[0]}
                                          </div>
                                          <span className="text-[10px] font-bold text-indigo-700 truncate max-w-[60px]">
                                            {card.assignee_name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                        <AddCardButton onAdd={(title, label) => handleAddCard(list.id, title, label)} />
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}

              {activeBoardId && (
                <div className="w-72 shrink-0">
                  {!isAddingList ? (
                    <button onClick={() => setIsAddingList(true)} className="w-full flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg text-sm transition-all duration-200 group"
                      style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#475569' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#06B6D4'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1FAE5'}>
                      <div className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ backgroundColor: '#D1FAE5' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#06B6D4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1FAE5'}>
                        <Plus className="w-3 h-3" style={{ color: '#475569' }} />
                      </div>
                      <span className="text-xs font-medium">Add another list</span>
                    </button>
                  ) : (
                    <div className="bg-white p-3 rounded-lg shadow-sm border animate-in zoom-in-95 duration-200" style={{ borderColor: '#D1FAE5' }}>
                      <input autoFocus value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddList(e)} placeholder="Enter list title..." className="w-full px-3 py-2 rounded text-sm mb-2 border focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(6, 182, 212, 0.2)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }} />
                      <div className="flex gap-2">
                        <button onClick={handleAddList} className="px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200" style={{ backgroundColor: '#06B6D4', color: '#FFFFFF' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0891B2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#06B6D4'}>Add list</button>
                        <button onClick={() => setIsAddingList(false)} className="p-1.5 rounded transition-colors duration-200" style={{ color: '#94A3B8' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#475569' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DragDropContext>
        </main>

        {/* 📝 Task Detail Modal (Apple / Pastel Style) */}
        {editingCard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="p-12 pb-8 flex items-center justify-between">
                <div className="flex items-center gap-7">
                  <div className={`p-6 rounded-[32px] bg-gradient-to-br from-slate-50 to-indigo-50 shadow-sm ${editingCard.is_done ? 'text-emerald-500' : 'text-indigo-600'}`}>
                    <Target className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-black text-4xl text-slate-900 tracking-tight mb-2">{editingCard.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Location</span>
                      <span className="text-[11px] text-indigo-600 font-black uppercase tracking-widest bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-lg">{lists.find(l => l.id === (editingCard.listId || editingCard.list_id))?.title}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setEditingCard(null)} className="p-6 hover:bg-slate-50 bg-white rounded-[32px] shadow-premium-sm transition-all border border-indigo-50 hover:border-indigo-100"><X className="w-8 h-8 text-slate-300 hover:text-slate-500" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 pt-0 space-y-10 custom-scrollbar">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-6">Overview</label>
                  <textarea
                    rows={4}
                    value={editingCard.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    placeholder="Add more details about this task..."
                    className="w-full px-10 py-8 bg-gradient-to-r from-slate-50 to-indigo-50 border-none rounded-[48px] text-base text-slate-600 shadow-inner focus:ring-12 focus:ring-indigo-500/10 resize-none font-medium transition-all placeholder-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-10 py-10 border-y border-indigo-50">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-5">Deadline</label>
                    <input
                      type="date"
                      value={editingCard.due_date ? new Date(editingCard.due_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingCard({ ...editingCard, due_date: e.target.value })}
                      className="w-full px-8 py-5 bg-white border border-indigo-100 rounded-[28px] font-black text-sm text-slate-900 shadow-sm outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-5">Label</label>
                    <div className="relative group">
                      <select
                        value={editingCard.labels?.[0] || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, labels: e.target.value ? [e.target.value] : [] })}
                        className="w-full px-8 py-5 bg-white border border-indigo-100 rounded-[28px] font-black text-sm text-slate-900 shadow-sm outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Label</option>
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Meeting">Sales</option>
                        <option value="vedio Editing">vedio Editing</option>
                        <option value="Accounting">Accounting</option>
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Selected Label Display */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-4">Task Label</label>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {['Development', 'Design', 'Marketing', 'sales', 'Accounting',].map((labelOption) => (
                      <button
                        key={labelOption}
                        onClick={() => setEditingCard({ ...editingCard, labels: editingCard.labels?.[0] === labelOption ? [] : [labelOption] })}
                        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all duration-300 ${
                          editingCard.labels?.[0] === labelOption
                            ? LABEL_COLORS[labelOption]
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {labelOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checklist Section */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-6">Task Checklist</label>
                  
                  {/* Progress Bar */}
                  {(editingCard.checklist && editingCard.checklist.length > 0) && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Progress</span>
                        <span className="text-sm font-black text-indigo-600">{calculateChecklistProgress()}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                          style={{ width: `${calculateChecklistProgress()}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Checklist Items */}
                  <div className="space-y-3 mb-4">
                    {editingCard.checklist && Array.isArray(editingCard.checklist) && editingCard.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all">
                        <button
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            item.completed 
                              ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white' 
                              : 'bg-white border-2 border-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {item.completed && <Check className="w-4 h-4" />}
                        </button>
                        <span className={`flex-1 text-sm font-semibold ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="p-2 hover:bg-rose-100 rounded-lg transition-colors text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Checklist Item */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                      placeholder="Add a checklist item..."
                      className="flex-1 px-6 py-4 bg-white border border-indigo-100 rounded-xl font-medium text-sm text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/50 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-6 pt-10">
                  {/* Separate Complete and Pending Buttons */}
                  <button
                    onClick={() => setEditingCard({ ...editingCard, is_done: true })}
                    className={`px-8 py-7 font-black text-sm uppercase tracking-[0.3em] rounded-[32px] shadow-lg transition-all duration-500 transform hover:-translate-y-1 flex items-center gap-3 border ${
                      editingCard.is_done
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-500 shadow-emerald-300/50'
                        : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 border-emerald-200 hover:from-emerald-200 hover:to-green-200'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Complete
                  </button>

                  <button
                    onClick={() => setEditingCard({ ...editingCard, is_done: false })}
                    className={`px-8 py-7 font-black text-sm uppercase tracking-[0.3em] rounded-[32px] shadow-lg transition-all duration-500 transform hover:-translate-y-1 flex items-center gap-3 border ${
                      !editingCard.is_done
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-amber-300/50'
                        : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600 border-amber-200 hover:from-amber-200 hover:to-orange-200'
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                    Pending
                  </button>

                  <button onClick={() => { console.log('Confirm Changes clicked'); handleUpdateCard(); }} className="flex-1 py-7 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm uppercase tracking-[0.3em] rounded-[32px] shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/50 hover:scale-105 transition-all duration-500 transform hover:-translate-y-1">Confirm Changes</button>

                  <button onClick={() => handleDeleteCard(editingCard.listId, editingCard.id)} className="px-10 py-7 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 font-black text-sm uppercase tracking-[0.3em] rounded-[32px] hover:from-rose-200 hover:to-pink-200 transition-all flex items-center gap-4 border border-rose-200">
                    <Trash2 className="w-6 h-6" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AddCardButton = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [label, setLabel] = useState('');

  if (!isAdding) return (
    <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-4 p-7 text-slate-300 hover:bg-white hover:text-accent-indigo rounded-[40px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group border border-dashed border-transparent hover:border-slate-100">
      <PlusCircle className="w-6 h-6 group-hover:rotate-90 duration-500" />
      Create Card
    </button>
  );

  return (
    <div className="bg-white p-8 rounded-[48px] shadow-premium border border-slate-50 animate-in zoom-in-95 duration-500">
      <textarea autoFocus placeholder="What task is next?" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-6 text-base bg-slate-50 rounded-[32px] border-none focus:ring-8 focus:ring-accent-indigo/5 resize-none min-h-[100px] font-bold text-slate-800 mb-4 transition-all placeholder-slate-300 shadow-inner" />
      
      {/* Label Selection */}
      <div className="mb-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Label</label>
        <div className="relative">
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-[24px] font-bold text-sm text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select Label (Optional)</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Meeting">Meeting</option>
            <option value="Critical">Critical</option>
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => { if (title.trim()) { onAdd(title, label); setTitle(''); setLabel(''); setIsAdding(false); } }} className="flex-1 bg-accent-indigo text-white py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all">Add Task</button>
        <button onClick={() => setIsAdding(false)} className="p-5 text-slate-400 hover:bg-slate-50 rounded-[24px] transition-all"><X className="w-6 h-6" /></button>
      </div>
    </div>
  );
};

export default Dashboard;
