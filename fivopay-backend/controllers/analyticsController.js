import { getBoardData, getBoardMembers, getBoards } from './workspaceController.js';

// Get overall statistics for a board
export const getBoardStats = async (req, res) => {
  try {
    console.log('Board stats request - boardId:', req.params.boardId);
    console.log('Board stats request - dateFilter:', req.query.dateFilter);
    
    const { boardId } = req.params;
    const { dateFilter = 'all' } = req.query;

    const boardData = await getBoardData({ params: { boardId } });
    console.log('Board data received:', boardData);
    
    const lists = Array.isArray(boardData) ? boardData : (boardData?.data?.lists || boardData || []);
    console.log('Lists:', lists);
    
    const allTasks = lists.flatMap(list => 
      (list.cards || []).map(card => ({
        ...card,
        listTitle: list.title,
        listId: list.id
      }))
    );

    console.log('All tasks:', allTasks);

    // Filter tasks based on date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredTasks = allTasks.filter(task => {
      if (!task.due_date) return true;
      const taskDate = new Date(task.due_date);
      
      switch (dateFilter) {
        case 'today':
          return taskDate >= today;
        case 'weekly':
          return taskDate >= weekAgo;
        case 'monthly':
          return taskDate >= monthAgo;
        default:
          return true;
      }
    });

    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.is_done).length;
    const pending = total - completed;
    const overdue = filteredTasks.filter(t => !t.is_done && new Date(t.due_date) < new Date()).length;

    const result = {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
    
    console.log('Board stats result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error getting board stats:', error);
    res.status(500).json({ message: 'Error fetching board statistics', error: error.message });
  }
};

// Get employee performance data
export const getEmployeePerformance = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { dateFilter = 'all' } = req.query;

    const boardData = await getBoardData({ params: { boardId } });
    const lists = Array.isArray(boardData) ? boardData : (boardData?.data?.lists || boardData || []);
    
    const allTasks = lists.flatMap(list => 
      (list.cards || []).map(card => ({
        ...card,
        listTitle: list.title,
        listId: list.id
      }))
    );

    // Filter tasks based on date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredTasks = allTasks.filter(task => {
      if (!task.due_date) return true;
      const taskDate = new Date(task.due_date);
      
      switch (dateFilter) {
        case 'today':
          return taskDate >= today;
        case 'weekly':
          return taskDate >= weekAgo;
        case 'monthly':
          return taskDate >= monthAgo;
        default:
          return true;
      }
    });

    // Calculate performance per employee
    const performance = {};
    
    filteredTasks.forEach(task => {
      const assignee = task.assignee_name || 'Unassigned';
      if (!performance[assignee]) {
        performance[assignee] = {
          name: assignee,
          total: 0,
          completed: 0,
          overdue: 0
        };
      }
      performance[assignee].total++;
      if (task.is_done) {
        performance[assignee].completed++;
      }
      if (!task.is_done && new Date(task.due_date) < new Date()) {
        performance[assignee].overdue++;
      }
    });

    const performanceData = Object.values(performance)
      .map(emp => ({
        ...emp,
        pending: emp.total - emp.completed,
        completionRate: emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0
      }))
      .sort((a, b) => b.completionRate - a.completionRate);

    res.json(performanceData);
  } catch (error) {
    console.error('Error getting employee performance:', error);
    res.status(500).json({ message: 'Error fetching employee performance', error: error.message });
  }
};

// Get weekly productivity data
export const getWeeklyProductivity = async (req, res) => {
  try {
    const { boardId } = req.params;

    const boardData = await getBoardData({ params: { boardId } });
    const lists = Array.isArray(boardData) ? boardData : (boardData?.data?.lists || boardData || []);
    
    const allTasks = lists.flatMap(list => 
      (list.cards || []).map(card => ({
        ...card,
        listTitle: list.title,
        listId: list.id
      }))
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayTasks = allTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === date.toDateString();
      });

      data.push({
        day: dayName,
        date: date.toISOString().split('T')[0],
        completed: dayTasks.filter(t => t.is_done).length,
        pending: dayTasks.filter(t => !t.is_done).length,
        overdue: dayTasks.filter(t => !t.is_done && new Date(t.due_date) < new Date()).length
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error getting weekly productivity:', error);
    res.status(500).json({ message: 'Error fetching weekly productivity', error: error.message });
  }
};

// Get task status distribution
export const getTaskStatusDistribution = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { dateFilter = 'all' } = req.query;

    const boardData = await getBoardData({ params: { boardId } });
    const lists = Array.isArray(boardData) ? boardData : (boardData?.data?.lists || boardData || []);
    
    const allTasks = lists.flatMap(list => 
      (list.cards || []).map(card => ({
        ...card,
        listTitle: list.title,
        listId: list.id
      }))
    );

    // Filter tasks based on date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredTasks = allTasks.filter(task => {
      if (!task.due_date) return true;
      const taskDate = new Date(task.due_date);
      
      switch (dateFilter) {
        case 'today':
          return taskDate >= today;
        case 'weekly':
          return taskDate >= weekAgo;
        case 'monthly':
          return taskDate >= monthAgo;
        default:
          return true;
      }
    });

    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.is_done).length;
    const pending = total - completed;
    const overdue = filteredTasks.filter(t => !t.is_done && new Date(t.due_date) < new Date()).length;

    const distribution = [
      { name: 'Completed', value: completed, color: '#10B981' },
      { name: 'Pending', value: pending - overdue, color: '#3B82F6' },
      { name: 'Overdue', value: overdue, color: '#F43F5E' }
    ].filter(d => d.value > 0);

    res.json(distribution);
  } catch (error) {
    console.error('Error getting task status distribution:', error);
    res.status(500).json({ message: 'Error fetching task status distribution', error: error.message });
  }
};

// Get complete analytics dashboard data
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { dateFilter = 'all' } = req.query;

    const boardData = await getBoardData({ params: { boardId } });
    const lists = Array.isArray(boardData) ? boardData : (boardData?.data?.lists || boardData || []);
    const membersData = await getBoardMembers({ params: { boardId } });
    const members = Array.isArray(membersData) ? membersData : (membersData?.data || membersData || []);
    
    const allTasks = lists.flatMap(list => 
      (list.cards || []).map(card => ({
        ...card,
        listTitle: list.title,
        listId: list.id
      }))
    );

    // Filter tasks based on date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredTasks = allTasks.filter(task => {
      if (!task.due_date) return true;
      const taskDate = new Date(task.due_date);
      
      switch (dateFilter) {
        case 'today':
          return taskDate >= today;
        case 'weekly':
          return taskDate >= monthAgo;
        case 'monthly':
          return taskDate >= monthAgo;
        default:
          return true;
      }
    });

    // Statistics
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.is_done).length;
    const pending = total - completed;
    const overdue = filteredTasks.filter(t => !t.is_done && new Date(t.due_date) < new Date()).length;

    // Employee performance
    const performance = {};
    
    filteredTasks.forEach(task => {
      const assignee = task.assignee_name || 'Unassigned';
      if (!performance[assignee]) {
        performance[assignee] = {
          name: assignee,
          total: 0,
          completed: 0,
          overdue: 0
        };
      }
      performance[assignee].total++;
      if (task.is_done) {
        performance[assignee].completed++;
      }
      if (!task.is_done && new Date(task.due_date) < new Date()) {
        performance[assignee].overdue++;
      }
    });

    const employeePerformance = Object.values(performance)
      .map(emp => ({
        ...emp,
        pending: emp.total - emp.completed,
        completionRate: emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0
      }))
      .sort((a, b) => b.completionRate - a.completionRate);

    // Weekly productivity
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayTasks = allTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === date.toDateString();
      });

      weeklyData.push({
        day: dayName,
        completed: dayTasks.filter(t => t.is_done).length,
        pending: dayTasks.filter(t => !t.is_done).length,
        overdue: dayTasks.filter(t => !t.is_done && new Date(t.due_date) < new Date()).length
      });
    }

    // Task status distribution
    const distribution = [
      { name: 'Completed', value: completed, color: '#10B981' },
      { name: 'Pending', value: pending - overdue, color: '#3B82F6' },
      { name: 'Overdue', value: overdue, color: '#F43F5E' }
    ].filter(d => d.value > 0);

    res.json({
      stats: {
        total,
        completed,
        pending,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      },
      employeePerformance,
      weeklyProductivity: weeklyData,
      taskStatusDistribution: distribution,
      boardMembers: members,
      avgTasksPerEmployee: members.length > 0 ? Math.round(total / members.length) : 0
    });
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching dashboard analytics', error: error.message });
  }
};
