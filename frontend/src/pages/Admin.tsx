import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  last_login: string;
  status: "active" | "inactive" | "suspended";
  predictions: number;
}

interface SystemStats {
  total_users: number;
  active_users: number;
  total_predictions: number;
  avg_probability: number;
  system_uptime: number;
  api_calls_today: number;
  model_accuracy: number;
}

interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  timestamp: string;
  details: string;
}

export default function Admin() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "activity" | "settings" | "analytics"
  >("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "suspended">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "created" | "predictions">("created");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (!isAdmin) {
      setError("Access denied. Admin privileges required.");
      return;
    }

    fetchData();
  }, []);

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Fetch all admin data
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch system stats
      const statsRes = await fetch("http://localhost:5000/api/v1/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setSystemStats(statsData);
      }

      // Fetch users
      const usersRes = await fetch("http://localhost:5000/api/v1/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch activity logs
      const activityRes = await fetch("http://localhost:5000/api/v1/admin/activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivityLogs(activityData.logs || []);
      }

      // Generate mock chart data
      generateChartData();
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Failed to fetch admin data. Make sure Flask backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: Math.floor(Math.random() * 50) + 10,
        predictions: Math.floor(Math.random() * 200) + 50,
        apiCalls: Math.floor(Math.random() * 1000) + 200,
      });
    }
    setChartData(data);
  };

  // Update user status
  const updateUserStatus = async (userId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setSuccess(`✅ User status updated to ${newStatus}`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update user status");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update user status");
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSuccess("✅ User deleted successfully");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete user");
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Filter and sort users
  const getFilteredUsers = (): User[] => {
    let filtered = users;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((u) => u.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.username.localeCompare(b.username);
        case "predictions":
          return b.predictions - a.predictions;
        case "created":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  };

  // Get status color
  const getStatusColor = (
    status: string
  ): {
    color: string;
    bgColor: string;
    icon: string;
  } => {
    switch (status) {
      case "active":
        return { color: "text-green-400", bgColor: "bg-green-900/20", icon: "🟢" };
      case "inactive":
        return { color: "text-gray-400", bgColor: "bg-gray-900/20", icon: "⚫" };
      case "suspended":
        return { color: "text-red-400", bgColor: "bg-red-900/20", icon: "🔴" };
      default:
        return { color: "text-slate-400", bgColor: "bg-slate-900/20", icon: "❓" };
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 text-center max-w-md">
          <p className="text-2xl mb-2">🚫</p>
          <p className="text-white font-bold mb-2">Access Denied</p>
          <p className="text-red-300 text-sm mb-4">
            You don't have admin privileges to access this page
          </p>
          
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition inline-block"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⚙️</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">⚙️ System Administration</h2>
          <p className="text-slate-400">Manage users, monitor activity, and track system performance</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-300 text-sm flex items-start">
              <span className="mr-2 mt-0.5 text-lg">❌</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-300 text-sm flex items-start">
              <span className="mr-2 mt-0.5 text-lg">✅</span>
              <span>{success}</span>
            </p>
          </div>
        )}

        {/* System Stats */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">👥 Total Users</p>
              <p className="text-3xl font-bold text-blue-400">{systemStats.total_users}</p>
              <p className="text-xs text-slate-500 mt-2">
                {systemStats.active_users} active
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                📊 Total Predictions
              </p>
              <p className="text-3xl font-bold text-green-400">
                {systemStats.total_predictions}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Avg: {(systemStats.avg_probability * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                🌐 API Calls (Today)
              </p>
              <p className="text-3xl font-bold text-orange-400">
                {systemStats.api_calls_today}
              </p>
              <p className="text-xs text-slate-500 mt-2">Real-time</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                ⭐ Model Accuracy
              </p>
              <p className="text-3xl font-bold text-purple-400">
                {(systemStats.model_accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-2">Backtested</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📈 Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "users"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "activity"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📋 Activity
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "analytics"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "settings"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 mb-8">
            {/* User Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">👥 User Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Active",
                          value: users.filter((u) => u.status === "active").length,
                        },
                        {
                          name: "Inactive",
                          value: users.filter((u) => u.status === "inactive").length,
                        },
                        {
                          name: "Suspended",
                          value: users.filter((u) => u.status === "suspended").length,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#6b7280" />
                      <Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Signups */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">🆕 Recent Signups</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{user.username}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">🏥 System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">API Status</p>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-400 font-semibold">Operational</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Database</p>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-400 font-semibold">Healthy</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Memory Usage</p>
                  <div className="flex items-center space-x-2">
                    <span className="w-full bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: "45%" }}></div>
                    </span>
                    <span className="text-blue-400 font-semibold text-sm">45%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">CPU Usage</p>
                  <div className="flex items-center space-x-2">
                    <span className="w-full bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: "32%" }}></div>
                    </span>
                    <span className="text-green-400 font-semibold text-sm">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6 mb-8">
            {/* User Controls */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="created">Latest</option>
                  <option value="name">Name</option>
                  <option value="predictions">Most Predictions</option>
                </select>

                <button
                  onClick={fetchData}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Username</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">
                        Predictions
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">
                        Joined
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredUsers().map((user) => (
                      <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-3 px-4 text-white font-semibold">{user.username}</td>
                        <td className="py-3 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3 px-4">
                          <div
                            className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                              getStatusColor(user.status).bgColor
                            } ${getStatusColor(user.status).color}`}
                          >
                            {getStatusColor(user.status).icon} {user.status}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{user.predictions}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded transition"
                            >
                              View
                            </button>
                            <select
                              value={user.status}
                              onChange={(e) => updateUserStatus(user.id, e.target.value)}
                              className="bg-slate-700 text-white text-xs py-1 px-2 rounded focus:outline-none"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspend</option>
                            </select>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {getFilteredUsers().length === 0 && (
                <p className="text-center text-slate-400 py-8">No users found</p>
              )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-white">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Username</p>
                    <p className="text-white font-semibold text-lg">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Email</p>
                    <p className="text-white font-semibold text-lg">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Status</p>
                    <p
                      className={`font-semibold text-lg ${
                        getStatusColor(selectedUser.status).color
                      }`}
                    >
                      {getStatusColor(selectedUser.status).icon} {selectedUser.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Predictions</p>
                    <p className="text-white font-semibold text-lg">
                      {selectedUser.predictions}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Joined</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Last Login</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedUser.last_login).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <h3 className="text-lg font-bold text-white mb-6">📋 Activity Log</h3>

            <div className="space-y-3">
              {activityLogs.length > 0 ? (
                activityLogs.slice(0, 20).map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-4 pb-3 border-b border-slate-700">
                    <div className="pt-1">
                      <span className="text-2xl">
                        {log.action.includes("login")
                          ? "📝"
                          : log.action.includes("upload")
                          ? "📤"
                          : log.action.includes("delete")
                          ? "🗑️"
                          : "📌"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold capitalize">{log.action}</p>
                      <p className="text-slate-400 text-sm">{log.details}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        User #{log.user_id} · {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No activity logs</p>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6 mb-8">
            {/* Activity Trend */}
            {chartData.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">📈 7-Day Activity Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name="New Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="predictions"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorPredictions)"
                      name="Predictions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* API Call Statistics */}
            {chartData.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">🌐 API Calls by Day</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                    />
                    <Bar dataKey="apiCalls" fill="#f59e0b" name="API Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Avg. Prediction Probability</p>
                <p className="text-3xl font-bold text-blue-400">
                  {systemStats ? (systemStats.avg_probability * 100).toFixed(1) : "0"}%
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">User Retention Rate</p>
                <p className="text-3xl font-bold text-green-400">87%</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Daily Active Users</p>
                <p className="text-3xl font-bold text-purple-400">
                  {systemStats ? systemStats.active_users : "0"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6 mb-8">
            {/* System Settings */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6">⚙️ System Settings</h3>

              <div className="space-y-6">
                {/* Email Settings */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Admin Email Notifications
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Maintenance Mode */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">Maintenance Mode</p>
                    <p className="text-slate-400 text-sm">
                      Prevent new users from accessing the system
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>

                {/* Rate Limiting */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    API Rate Limit (requests/minute)
                  </label>
                  <input
                    type="number"
                    value="60"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Max Upload Size */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Max Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    value="10"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                  💾 Save Settings
                </button>
              </div>
            </div>

            {/* Backup & Recovery */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6">💾 Backup & Recovery</h3>

              <div className="space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-left flex justify-between items-center">
                  <span>📦 Create Database Backup</span>
                  <span className="text-sm text-blue-200">Last: 2 hours ago</span>
                </button>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-left flex justify-between items-center">
                  <span>📥 Restore from Backup</span>
                  <span className="text-sm text-blue-200">5 backups available</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>Admin Dashboard | System Administration Panel</p>
          <p className="mt-2">Version 1.0.0 | Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}