// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Task types
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: User;
  assignedBy?: User;
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  text: string;
  completed: boolean;
}

// Personal Task types
export interface PersonalTask {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Calendar Event types
export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// Planner types
export interface TimeBlock {
  _id: string;
  startTime: string; // HH:mm format
  endTime: string;
  activity: string;
  completed?: boolean;
}

export interface DayPlan {
  _id: string;
  date: string; // YYYY-MM-DD
  blocks: TimeBlock[];
  notes?: string;
}

// Chat types
export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
    model: 'User' | 'Admin';
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
    model: 'User' | 'Admin';
  };
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    model: 'User' | 'Admin';
  };
  lastMessage: Message;
  unreadCount: number;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}
