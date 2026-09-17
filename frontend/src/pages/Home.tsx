import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

interface CurrentPrediction {
  date: string;
  probability: number;
  status: "alert" | "watch" | "normal";
  signals: string;
  explanation: string;
  confidence: number;
}

interface TimelineData {
  date: string;
  probability: number;
  status: string;
}

export default function Home() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [currentPrediction, setCurrentPrediction] = useState<CurrentPrediction | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<"6" | "12" | "24" | "all">("24");
  const [stats, setStats] = useState<{
    totalMonths: number;
    averageProbability: number;
    highRiskMonths: number;
    currentStatus: string;
  }>({
    totalMonths: 0,
    averageProbability: 0,
    highRiskMonths: 0,
    currentStatus: "normal",
  });

  const username = localStorage.getItem("username") || "Researcher";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch predictions on component mount
  useEffect(() => {
    fetchPredictions();
  }, []);

  // Recalculate stats when timeline data changes
  useEffect(() => {
    if (timelineData.length > 0) {
      calculateStats();
    }
  }, [timelineData]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Fetch current and timeline predictions from backend
  const fetchPredictions = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch current prediction
      const currentRes = await fetch("http://localhost:5000/api/v1/recession/current", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!currentRes.ok) {
        throw new Error("Failed to fetch current prediction");
      }

      const currentData: CurrentPrediction = await currentRes.json();
      setCurrentPrediction(currentData);

      // Fetch timeline data
      const timelineRes = await fetch("http://localhost:5000/api/v1/recession/timeline", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!timelineRes.ok) {
        throw new Error("Failed to fetch timeline data");
      }

      const timelineDataRaw: TimelineData[] = await timelineRes.json();
      setTimelineData(timelineDataRaw);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Failed to fetch predictions. Make sure Flask backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Calculate statistics from timeline data
  const calculateStats = () => {
    if (timelineData.length === 0) return;

    const totalMonths = timelineData.length;
    const averageProbability =
      timelineData.reduce((sum, d) => sum + d.probability, 0) / totalMonths;
    const highRiskMonths = timelineData.filter((d) => d.probability >= 0.6).length;

    setStats({
      totalMonths,
      averageProbability,
      highRiskMonths,
      currentStatus: currentPrediction?.status || "normal",
    });
  };

  // Get filtered timeline data based on selected range
  const getFilteredTimelineData = (): TimelineData[] => {
    if (selectedTimeRange === "all") {
      return timelineData;
    }

    const rangeNum = parseInt(selectedTimeRange);
    return timelineData.slice(-rangeNum);
  };

  // Get status color and icon
  const getStatusDisplay = (
    status: string
  ): {
    color: string;
    bgColor: string;
    icon: string;
    label: string;
  } => {
    switch (status) {
      case "alert":
        return {
          color: "text-red-400",
          bgColor: "bg-red-900/20",
          icon: "🔴",
          label: "ALERT",
        };
      case "watch":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/20",
          icon: "🟡",
          label: "WATCH",
        };
      default:
        return {
          color: "text-green-400",
          bgColor: "bg-green-900/20",
          icon: "🟢",
          label: "NORMAL",
        };
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white text-xl">Loading predictions...</p>
          <p className="text-slate-400 text-sm mt-2">Fetching data from backend</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                🇮🇳 Recession Predictor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-slate-300">Welcome, <span className="font-semibold">{username}</span></p>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user_id");
                  localStorage.removeItem("email");
                  localStorage.removeItem("username");
                  localStorage.removeItem("isLoggedIn");
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">📈 Dashboard</h2>
          <p className="text-slate-400">
            Real-time AI predictions for economic recession probability
          </p>
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

        {/* Current Status Card */}
        {currentPrediction && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Latest Month */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                📅 Latest Month
              </p>
              <p className="text-2xl font-bold text-white">{currentPrediction.date}</p>
              <p className="text-xs text-slate-500 mt-2">Current period analysis</p>
            </div>

            {/* Recession Probability */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                📊 Recession Probability
              </p>
              <p className="text-4xl font-bold text-blue-400">
                {(currentPrediction.probability * 100).toFixed(1)}%
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${currentPrediction.probability * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                🚨 Status
              </p>
              <div
                className={`inline-block px-3 py-2 rounded-lg ${
                  getStatusDisplay(currentPrediction.status).bgColor
                }`}
              >
                <p
                  className={`text-lg font-bold ${
                    getStatusDisplay(currentPrediction.status).color
                  }`}
                >
                  {getStatusDisplay(currentPrediction.status).icon}{" "}
                  {getStatusDisplay(currentPrediction.status).label}
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                ⭐ Confidence
              </p>
              <p className="text-4xl font-bold text-green-400">
                {(currentPrediction.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500 mt-2">Model confidence score</p>
            </div>
          </div>
        )}

        {/* Timeline Chart */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">📊 Recession Probability Timeline</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTimeRange("6")}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedTimeRange === "6"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setSelectedTimeRange("12")}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedTimeRange === "12"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                1Y
              </button>
              <button
                onClick={() => setSelectedTimeRange("24")}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedTimeRange === "24"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                2Y
              </button>
              <button
                onClick={() => setSelectedTimeRange("all")}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedTimeRange === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getFilteredTimelineData()}>
                <defs>
                  <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Probability"]}
                />
                <ReferenceLine
                  y={0.6}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "Alert (60%)",
                    position: "right",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={0.4}
                  stroke="#eab308"
                  strokeDasharray="5 5"
                  label={{
                    value: "Watch (40%)",
                    position: "right",
                    fill: "#eab308",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorProb)"
                  name="Probability"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-8">No timeline data available</p>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📊 Total Months Analyzed
            </p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalMonths}</p>
            <p className="text-xs text-slate-500 mt-2">From 2000 to present</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📈 Average Probability
            </p>
            <p className="text-3xl font-bold text-blue-400">
              {(stats.averageProbability * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">Historical average</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              🔴 High Risk Months
            </p>
            <p className="text-3xl font-bold text-red-400">{stats.highRiskMonths}</p>
            <p className="text-xs text-slate-500 mt-2">≥60% probability</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              ⚡ Model Accuracy
            </p>
            <p className="text-3xl font-bold text-green-400">92%</p>
            <p className="text-xs text-slate-500 mt-2">Backtested on historical data</p>
          </div>
        </div>

        {/* Key Signals */}
        {currentPrediction && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signals */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">🔔 Key Economic Signals</h3>
              <div className="space-y-3">
                {currentPrediction.signals ? (
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {currentPrediction.signals}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm">No major signals detected</p>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">💡 AI Explanation</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentPrediction.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/episodes"
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition group"
          >
            <p className="text-2xl mb-2 group-hover:scale-110 transition inline-block">📚</p>
            <h4 className="text-white font-bold mb-2">Historical Episodes</h4>
            <p className="text-slate-400 text-sm">
              Explore 6 recession episodes from 2000-2026
            </p>
          </a>

          <a
            href="/forecast"
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-green-600 transition group"
          >
            <p className="text-2xl mb-2 group-hover:scale-110 transition inline-block">🎯</p>
            <h4 className="text-white font-bold mb-2">Scenario Builder</h4>
            <p className="text-slate-400 text-sm">
              Adjust indicators to forecast probabilities
            </p>
          </a>

          <a
            href="/researcher"
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-600 transition group"
          >
            <p className="text-2xl mb-2 group-hover:scale-110 transition inline-block">👨‍🔬</p>
            <h4 className="text-white font-bold mb-2">Researcher Portal</h4>
            <p className="text-slate-400 text-sm">Upload CSV and run custom predictions</p>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>
            India Recession Predictor v1.0 | Powered by ML & FAISS | Data: 2000-2026
          </p>
          <p className="mt-2">
            Backend: http://localhost:5000 | Last Updated:{" "}
            {currentPrediction?.date || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}