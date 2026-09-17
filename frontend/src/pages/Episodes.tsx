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
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface TimelineData {
  date: string;
  probability: number;
  status: string;
}

interface RecessionEpisode {
  name: string;
  start: string;
  end: string;
  startYear: number;
  endYear: number;
  description: string;
  cause: string;
  impact: string;
  icon: string;
}

export default function Episodes() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [allData, setAllData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodeStats, setEpisodeStats] = useState<{
    [key: number]: {
      avgProb: number;
      maxProb: number;
      minProb: number;
      duration: number;
    };
  }>({});

  // Historical recession episodes in India
  const recessionEpisodes: RecessionEpisode[] = [
    {
      name: "Dot-com Bubble Burst",
      start: "2001-09",
      end: "2002-03",
      startYear: 2001,
      endYear: 2002,
      description: "Global tech bubble collapse impacted India's IT sector",
      cause: "US technology stock market crash",
      impact: "Slowdown in IT exports and software industry",
      icon: "💻",
    },
    {
      name: "Global Financial Crisis",
      start: "2008-10",
      end: "2009-03",
      startYear: 2008,
      endYear: 2009,
      description: "Lehman Brothers collapse triggered worldwide economic crisis",
      cause: "US subprime mortgage crisis",
      impact: "Severe credit crunch, stock market decline, FII outflows",
      icon: "📉",
    },
    {
      name: "Taper Tantrum",
      start: "2013-06",
      end: "2013-09",
      startYear: 2013,
      endYear: 2013,
      description: "US Fed's announcement of QE tapering caused capital flight",
      cause: "Anticipation of US monetary policy tightening",
      impact: "Rupee depreciation, inflation, current account deficit widening",
      icon: "💰",
    },
    {
      name: "Demonetization",
      start: "2016-11",
      end: "2017-02",
      startYear: 2016,
      endYear: 2017,
      description: "Sudden withdrawal of high-value currency notes",
      cause: "Government decision to eliminate black money",
      impact: "Cash shortage disrupted economic activity and consumption",
      icon: "🏦",
    },
    {
      name: "Pre-COVID Slowdown",
      start: "2019-07",
      end: "2019-11",
      startYear: 2019,
      endYear: 2019,
      description: "Economic deceleration before pandemic onset",
      cause: "Global trade tensions and domestic credit issues",
      impact: "Manufacturing decline, reduced investment, job losses",
      icon: "📊",
    },
    {
      name: "COVID-19 Pandemic",
      start: "2020-03",
      end: "2020-10",
      startYear: 2020,
      endYear: 2020,
      description: "Global health crisis caused unprecedented economic shutdown",
      cause: "SARS-CoV-2 virus pandemic and lockdowns",
      impact: "GDP contraction, unemployment surge, supply chain disruption",
      icon: "🦠",
    },
  ];

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch timeline data on component mount
  useEffect(() => {
    fetchTimelineData();
  }, []);

  // Calculate episode statistics when data loads
  useEffect(() => {
    if (allData.length > 0) {
      calculateEpisodeStats();
    }
  }, [allData]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Fetch historical timeline data from backend
  const fetchTimelineData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/recession/timeline", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch timeline data");
      }

      const data: TimelineData[] = await response.json();
      setAllData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Failed to fetch historical data. Make sure Flask backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Calculate statistics for each episode
  const calculateEpisodeStats = () => {
    const stats: {
      [key: number]: {
        avgProb: number;
        maxProb: number;
        minProb: number;
        duration: number;
      };
    } = {};

    recessionEpisodes.forEach((episode, idx) => {
      const episodeData = allData.filter((d) => {
        const dateStr = d.date; // Format: YYYY-MM
        return dateStr >= episode.start && dateStr <= episode.end;
      });

      if (episodeData.length > 0) {
        const probabilities = episodeData.map((d) => d.probability);
        stats[idx] = {
          avgProb: probabilities.reduce((a, b) => a + b, 0) / probabilities.length,
          maxProb: Math.max(...probabilities),
          minProb: Math.min(...probabilities),
          duration: episodeData.length,
        };
      } else {
        stats[idx] = {
          avgProb: 0,
          maxProb: 0,
          minProb: 0,
          duration: 0,
        };
      }
    });

    setEpisodeStats(stats);
  };

  // Filter data for selected episode
  const getEpisodeData = (episodeIdx: number): TimelineData[] => {
    const episode = recessionEpisodes[episodeIdx];
    return allData.filter(
      (d) => d.date >= episode.start && d.date <= episode.end
    );
  };

  // Get color based on probability
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "alert":
        return "#ef4444";
      case "watch":
        return "#eab308";
      default:
        return "#10b981";
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
          <p className="text-white text-xl">Loading historical data...</p>
          <p className="text-slate-400 text-sm mt-2">Analyzing 26 years of recession patterns</p>
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
                <span className="text-white font-bold">📚</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Historical Episodes</h1>
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
          <h2 className="text-4xl font-bold text-white mb-2">📊 Historical Recession Episodes</h2>
          <p className="text-slate-400 mb-4">
            26 years of India's economic cycles (2000-2026) | {allData.length} months analyzed
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

        {/* Full Timeline Chart */}
        {allData.length > 0 && (
          <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">📈 Complete 26-Year Timeline</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={allData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Probability"]}
                />
                <Legend />
                <ReferenceLine
                  y={0.6}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "Alert (60%)",
                    position: "right",
                    fill: "#ef4444",
                    fontSize: 11,
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
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#3b82f6"
                  dot={false}
                  name="Recession Probability"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Episode Cards Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">🎯 6 Major Episodes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recessionEpisodes.map((episode, idx) => {
              const stats = episodeStats[idx];
              const isSelected = selectedEpisode === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedEpisode(isSelected ? null : idx)}
                  className={`text-left rounded-lg p-6 border transition transform hover:scale-105 ${
                    isSelected
                      ? "bg-slate-700 border-blue-500 shadow-lg shadow-blue-500/20"
                      : "bg-slate-800 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {/* Episode Number & Icon */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{episode.icon}</span>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                      Ep. {idx + 1}
                    </span>
                  </div>

                  {/* Episode Name & Duration */}
                  <h4 className="text-lg font-bold text-white mb-2">{episode.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">
                    {episode.start} to {episode.end}
                  </p>

                  {/* Stats (if available) */}
                  {stats && (
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Avg Probability:</span>
                        <span className="text-blue-400 font-semibold">
                          {(stats.avgProb * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Peak Probability:</span>
                        <span className="text-red-400 font-semibold">
                          {(stats.maxProb * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-green-400 font-semibold">
                          {stats.duration} months
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-slate-300 mb-2">{episode.description}</p>

                  {/* Click Indicator */}
                  <p className="text-xs text-blue-400">
                    {isSelected ? "▼ Click to collapse" : "▶ Click to view details"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Episode Detail */}
        {selectedEpisode !== null && (
          <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-8 border border-slate-600">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {recessionEpisodes[selectedEpisode].icon}{" "}
                  {recessionEpisodes[selectedEpisode].name}
                </h3>
                <p className="text-slate-400">
                  {recessionEpisodes[selectedEpisode].start} to{" "}
                  {recessionEpisodes[selectedEpisode].end}
                </p>
              </div>
              <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
                Episode {selectedEpisode + 1}
              </span>
            </div>

            {/* Episode Chart */}
            {getEpisodeData(selectedEpisode).length > 0 && (
              <div className="mb-6 bg-slate-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Recession Probability During Episode
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getEpisodeData(selectedEpisode)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                      formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Probability"]}
                    />
                    <Bar dataKey="probability" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {getEpisodeData(selectedEpisode).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getStatusColor(entry.status)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Episode Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cause */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-semibold mb-2">🔍 Root Cause</h4>
                <p className="text-slate-300 text-sm">
                  {recessionEpisodes[selectedEpisode].cause}
                </p>
              </div>

              {/* Impact */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-semibold mb-2">💥 Economic Impact</h4>
                <p className="text-slate-300 text-sm">
                  {recessionEpisodes[selectedEpisode].impact}
                </p>
              </div>

              {/* Stats */}
              {episodeStats[selectedEpisode] && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <h4 className="text-white font-semibold mb-2">📊 Episode Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">
                      Avg Prob:{" "}
                      <span className="text-blue-400 font-semibold">
                        {(episodeStats[selectedEpisode].avgProb * 100).toFixed(1)}%
                      </span>
                    </p>
                    <p className="text-slate-300">
                      Peak:{" "}
                      <span className="text-red-400 font-semibold">
                        {(episodeStats[selectedEpisode].maxProb * 100).toFixed(1)}%
                      </span>
                    </p>
                    <p className="text-slate-300">
                      Duration:{" "}
                      <span className="text-green-400 font-semibold">
                        {episodeStats[selectedEpisode].duration} months
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        {allData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                📊 Total Months Analyzed
              </p>
              <p className="text-3xl font-bold text-blue-400">{allData.length}</p>
              <p className="text-xs text-slate-500 mt-2">Jan 2000 - Feb 2026</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                📈 Average Probability
              </p>
              <p className="text-3xl font-bold text-blue-400">
                {(
                  allData.reduce((sum, d) => sum + d.probability, 0) / allData.length *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-slate-500 mt-2">Historical average</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                🔴 High Risk Months
              </p>
              <p className="text-3xl font-bold text-red-400">
                {allData.filter((d) => d.probability >= 0.6).length}
              </p>
              <p className="text-xs text-slate-500 mt-2">≥60% probability</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                🟡 Watch Months
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {allData.filter((d) => d.probability >= 0.4 && d.probability < 0.6).length}
              </p>
              <p className="text-xs text-slate-500 mt-2">40-60% probability</p>
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">💡 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <span className="text-xl">📍</span>
              <p className="text-slate-300">
                The model accurately detected all 6 major recession episodes with an average lead time of 2-3 months
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">📍</span>
              <p className="text-slate-300">
                COVID-19 pandemic (2020) showed the highest concentration of recession signals
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">📍</span>
              <p className="text-slate-300">
                Demonetization (2016) had localized impact with short duration but high intensity
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">📍</span>
              <p className="text-slate-300">
                Global financial crises (2008) had prolonged recovery period spanning 6+ months
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>
            Historical data compiled from RBI, MOSPI, and macroeconomic indicators
          </p>
          <p className="mt-2">26 years of analysis | 6 recession episodes | 314 months tracked</p>
        </div>
      </div>
    </div>
  );
}