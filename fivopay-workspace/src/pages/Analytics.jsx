import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceService, analyticsService } from '../services/api';
import {
  LayoutDashboard, CheckCircle2, Clock, AlertCircle, TrendingUp,
  Users, Calendar, Filter, BarChart3, PieChart as PieChartIcon, Award, ArrowUpRight,
  ArrowDownRight, Activity, Target, Zap, Layout, Settings, Rocket, PlusCircle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Cell, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
  primary: '#EF4444',
  secondary: '#22C55E',
  background: '#FFFFFF',
  grid: '#D1FAE5',
  text: '#0F172A',
  light: '#94A3B8'
};

// --- Sidebar Component ---
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
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

const Sidebar = ({ user, onLogout, navigate }) => (
  <aside className="w-80 h-screen flex flex-col shrink-0 z-20" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #D1FAE5' }}>
    <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: '#D1FAE5' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
          <Rocket className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#0F172A' }}>FivoPay</h2>
          <p className="text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Analytics</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto">
      <div className="px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Main Menu</p>
      </div>
      <SidebarItem icon={Layout} label="Dashboard" onClick={() => navigate('/dashboard')} />
      <SidebarItem icon={Calendar} label="Planner" onClick={() => navigate('/planner')} />
      <SidebarItem icon={BarChart3} label="Analytics" active onClick={() => {}} />
      <SidebarItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
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
);

const Analytics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('weekly');
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetchAnalyticsData(selectedBoard, dateFilter);
    }
  }, [selectedBoard, dateFilter]);

  const fetchInitialData = async () => {
    try {
      const boardsRes = await workspaceService.getBoards();
      setBoards(boardsRes.data);
      if (boardsRes.data.length > 0) {
        setSelectedBoard(boardsRes.data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async (boardId, filter) => {
    try {
      const response = await analyticsService.getDashboardAnalytics(boardId, filter);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const handleBoardChange = (boardId) => {
    setSelectedBoard(boardId);
  };

  const stats = analyticsData?.stats || { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 };
  const employeePerformance = analyticsData?.employeePerformance || [];
  const weeklyData = analyticsData?.weeklyProductivity || [];
  const pieData = analyticsData?.taskStatusDistribution || [];
  const boardMembers = analyticsData?.boardMembers || [];
  const avgTasksPerEmployee = analyticsData?.avgTasksPerEmployee || 0;

  const topPerformer = useMemo(() => {
    if (employeePerformance.length === 0) return null;
    return employeePerformance[0];
  }, [employeePerformance]);

  const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }) => (
    <div
      className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-200"
      style={{ borderColor: '#D1FAE5', animationDelay: `${delay}ms` }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#06B6D4'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1FAE5'}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
          <Icon className="w-6 h-6" style={{ color: '#06B6D4' }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? '' : ''}`}
            style={trend > 0 ? { color: '#22C55E' } : { color: '#EF4444' }}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#94A3B8' }}>{title}</h3>
      <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-white font-sans overflow-hidden">
        <Sidebar user={user} onLogout={() => { logout(); navigate('/login'); }} navigate={navigate} />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-semibold">Loading Analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 font-sans" style={{ backgroundColor: '#ECFEFF' }}>
      <Sidebar user={user} onLogout={() => { logout(); navigate('/login'); }} navigate={navigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0 z-10" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #D1FAE5' }}>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: '#0F172A' }}>Analytics Dashboard</h1>
            <p className="text-sm font-bold mt-1" style={{ color: '#94A3B8' }}>Employee Task Management Insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedBoard}
              onChange={(e) => handleBoardChange(e.target.value)}
              className="bg-white border border-indigo-100 text-slate-900 px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-bold shadow-sm"
            >
              {boards.map(board => (
                <option key={board.id} value={board.id}>{board.title}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 rounded-xl p-1 border shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
              {['today', 'weekly', 'monthly'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${
                    dateFilter === filter
                      ? 'shadow-md'
                      : ''
                  }`}
                  style={dateFilter === filter ? { backgroundColor: '#06B6D4', color: '#FFFFFF' } : { color: '#475569' }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={LayoutDashboard}
            color="from-blue-500 to-cyan-500"
            trend={12}
            delay={0}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="red-600"
            trend={8}
            delay={100}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="from-amber-500 to-orange-500"
            trend={-5}
            delay={200}
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertCircle}
            color="from-rose-500 to-pink-500"
            trend={-15}
            delay={300}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Productivity Chart */}
          <div className="lg:col-span-2 rounded-2xl p-6 border transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>Weekly Productivity</h2>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Task completion over the last 7 days</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <BarChart3 className="w-5 h-5" style={{ color: '#06B6D4' }} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="day" stroke={COLORS.light} />
                <YAxis stroke={COLORS.light} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${COLORS.grid}`,
                    borderRadius: '8px',
                    color: COLORS.text
                  }}
                  itemStyle={{ color: COLORS.text }}
                />
                <Legend />
                <Bar dataKey="completed" fill={COLORS.secondary} radius={[8, 8, 0, 0]} name="Completed" />
                <Bar dataKey="pending" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Pending" />
                <Bar dataKey="overdue" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="rounded-2xl p-6 border transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>Task Status</h2>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Distribution by status</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <PieChartIcon className="w-5 h-5" style={{ color: '#06B6D4' }} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${COLORS.grid}`,
                    borderRadius: '8px',
                    color: COLORS.text
                  }}
                  itemStyle={{ color: COLORS.text }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Performance & Top Performer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Employee Performance */}
          <div className="lg:col-span-2 rounded-2xl p-6 border transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>Employee Performance</h2>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Task completion rates by employee</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <Users className="w-5 h-5" style={{ color: '#06B6D4' }} />
              </div>
            </div>
            
            {/* Employee Performance Bar Chart */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="name" stroke={COLORS.light} />
                  <YAxis stroke={COLORS.light} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${COLORS.grid}`,
                      borderRadius: '8px',
                      color: COLORS.text
                    }}
                    itemStyle={{ color: COLORS.text }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill={COLORS.secondary} radius={[8, 8, 0, 0]} name="Completed" />
                  <Bar dataKey="pending" fill={COLORS.amber} radius={[8, 8, 0, 0]} name="Pending" />
                  <Bar dataKey="overdue" fill={COLORS.rose} radius={[8, 8, 0, 0]} name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Employee Performance Cards */}
            <div className="space-y-4">
              {employeePerformance.slice(0, 5).map((employee, index) => (
                <div key={index} className="rounded-xl p-4 transition-colors" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{
                        backgroundColor: index === 0 ? '#EF4444' :
                                      index === 1 ? '#22C55E' :
                                      index === 2 ? '#EF4444' :
                                      '#22C55E'
                      }}>
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: '#0F172A' }}>{employee.name}</h3>
                        <p className="text-sm" style={{ color: '#94A3B8' }}>{employee.total} tasks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{employee.completionRate}%</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>completion rate</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#94A3B8' }}>Completed</span>
                      <span className="font-semibold" style={{ color: '#22C55E' }}>{employee.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#94A3B8' }}>Pending</span>
                      <span className="font-semibold" style={{ color: '#F59E0B' }}>{employee.pending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#94A3B8' }}>Overdue</span>
                      <span className="font-semibold" style={{ color: '#EF4444' }}>{employee.overdue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performer */}
          <div className="lg:col-span-2 rounded-xl p-6 border shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>Top Performer</h2>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Employee of the period</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <Award className="w-5 h-5" style={{ color: '#06B6D4' }} />
              </div>
            </div>

            {topPerformer ? (
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md" style={{ backgroundColor: '#22C55E' }}>
                    {topPerformer.name.charAt(0)}
                  </div>
                  <div className="absolute -top-2 -right-2 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md" style={{ backgroundColor: '#22C55E' }}>
                    #1
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: '#0F172A' }}>{topPerformer.name}</h3>
                <p className="mb-6" style={{ color: '#94A3B8' }}>{topPerformer.completed} of {topPerformer.total} tasks completed</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="text-sm mb-1" style={{ color: '#94A3B8' }}>Completion Rate</p>
                    <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>{topPerformer.completionRate}%</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="text-sm mb-1" style={{ color: '#94A3B8' }}>Overdue</p>
                    <p className="text-2xl font-bold" style={{ color: topPerformer.overdue > 0 ? '#EF4444' : '#22C55E' }}>
                      {topPerformer.overdue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} />
                  <span>Leading performer this {dateFilter}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: '#94A3B8' }}>
                <Users className="w-12 h-12 mx-auto mb-4" style={{ opacity: 0.5, color: '#94A3B8' }} />
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: '#D1FAE5' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <Target className="w-6 h-6" style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Overall Completion</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{stats.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: '#D1FAE5' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <Zap className="w-6 h-6" style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Active Employees</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{boardMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: '#D1FAE5' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                <Activity className="w-6 h-6" style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Avg. Tasks/Employee</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{avgTasksPerEmployee}</p>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
