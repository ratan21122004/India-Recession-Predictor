import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface ScenarioResult {
  base_probability: number;
  modified_probability: number;
  probability_change: number;
  status: "alert" | "watch" | "normal";
  explanation: string;
  indicators_used: string[];
  confidence: number;
  signal_strength: string;
}

interface IndicatorValue {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

interface Scenario {
  name: string;
  description: string;
  adjustments: {
    credit_growth: number;
    iip_manufacturing: number;
    pmi_composite: number;
    usdinr: number;
    rupee_depreciation: number;
  };
  icon: string;
  color: string;
}

export default function Forecast() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [indicators, setIndicators] = useState<{
    credit_growth: number;
    iip_manufacturing: number;
    pmi_composite: number;
    usdinr: number;
    rupee_depreciation: number;
  }>({
    credit_growth: 4.2,
    iip_manufacturing: -1.8,
    pmi_composite: 48.3,
    usdinr: 83.5,
    rupee_depreciation: 2.5,
  });

  const [baseMonth, setBaseMonth] = useState<string>("2026-02");
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"sliders" | "scenarios" | "results">("sliders");
  const [isCustom, setIsCustom] = useState<boolean>(true);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [previousResults, setPreviousResults] = useState<ScenarioResult[]>([]);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Researcher";

  // Define indicator configurations
  const indicatorConfigs: {
    [key: string]: IndicatorValue;
  } = {
    credit_growth: {
      name: "Credit Growth",
      value: indicators.credit_growth,
      min: -10,
      max: 15,
      step: 0.1,
      unit: "%",
      description: "Bank credit expansion rate",
    },
    iip_manufacturing: {
      name: "IIP Manufacturing",
      value: indicators.iip_manufacturing,
      min: -30,
      max: 30,
      step: 0.1,
      unit: "%",
      description: "Industrial production growth",
    },
    pmi_composite: {
      name: "PMI Composite",
      value: indicators.pmi_composite,
      min: 20,
      max: 70,
      step: 0.1,
      unit: "pts",
      description: "Purchasing Managers Index (50 = neutral)",
    },
    usdinr: {
      name: "USD-INR Rate",
      value: indicators.usdinr,
      min: 75,
      max: 90,
      step: 0.1,
      unit: "INR",
      description: "US Dollar exchange rate",
    },
    rupee_depreciation: {
      name: "Rupee Depreciation",
      value: indicators.rupee_depreciation,
      min: -5,
      max: 10,
      step: 0.1,
      unit: "%",
      description: "Rate of rupee value decline",
    },
  };

  // Predefined scenarios
  const scenarios: Scenario[] = [
    {
      name: "Baseline",
      description: "Current economic conditions continue",
      adjustments: {
        credit_growth: 4.2,
        iip_manufacturing: -1.8,
        pmi_composite: 48.3,
        usdinr: 83.5,
        rupee_depreciation: 2.5,
      },
      icon: "📊",
      color: "from-blue-600 to-blue-700",
    },
    {
      name: "Stress Scenario",
      description: "Severe economic deterioration",
      adjustments: {
        credit_growth: -5,
        iip_manufacturing: -15,
        pmi_composite: 38,
        usdinr: 88,
        rupee_depreciation: 8,
      },
      icon: "📉",
      color: "from-red-600 to-red-700",
    },
    {
      name: "Recovery Scenario",
      description: "Strong economic rebound",
      adjustments: {
        credit_growth: 12,
        iip_manufacturing: 15,
        pmi_composite: 58,
        usdinr: 80,
        rupee_depreciation: -1,
      },
      icon: "📈",
      color: "from-green-600 to-green-700",
    },
    {
      name: "Geopolitical Shock",
      description: "External crisis impact",
      adjustments: {
        credit_growth: 0,
        iip_manufacturing: -10,
        pmi_composite: 40,
        usdinr: 87,
        rupee_depreciation: 6,
      },
      icon: "⚡",
      color: "from-yellow-600 to-yellow-700",
    },
  ];

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-run scenario when indicators change (if in real-time mode)
  useEffect(() => {
    if (comparisonMode && !isCustom) {
      runScenario();
    }
  }, [comparisonMode]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Run scenario analysis with current indicators
  const runScenario = async () => {
    if (!token) {
      setError("Please login first to run scenarios");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/recession/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          base_month: baseMonth,
          indicators: indicators,
        }),
      });

      const data: ScenarioResult = await response.json();

      if (response.ok) {
        setResult(data);
        setPreviousResults([data, ...previousResults.slice(0, 4)]);
        setSuccess("✅ Scenario analysis complete!");
        setActiveTab("results");
      } else {
        setError(data.explanation || "Scenario calculation failed");
      }
    } catch (err) {
      console.error("Scenario error:", err);
      setError(
        "Failed to run scenario. Make sure Flask backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Handle slider change
  const handleSliderChange = (key: string, value: number) => {
    setIndicators({
      ...indicators,
      [key]: value,
    });
  };

  // Apply predefined scenario
  const applyScenario = (scenario: Scenario) => {
    setIndicators(scenario.adjustments);
    setIsCustom(false);
    setSuccess(`📊 ${scenario.name} applied! Click "Run Scenario" to analyze.`);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Reset to baseline
  const resetIndicators = () => {
    setIndicators({
      credit_growth: 4.2,
      iip_manufacturing: -1.8,
      pmi_composite: 48.3,
      usdinr: 83.5,
      rupee_depreciation: 2.5,
    });
    setIsCustom(true);
    setResult(null);
  };

  // Get status display
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

  // Get indicator health status
  const getIndicatorHealth = (key: string): "good" | "warning" | "danger" => {
    const value = indicators[key as keyof typeof indicators];
    
    switch (key) {
      case "credit_growth":
        if (value >= 5) return "good";
        if (value >= 0) return "warning";
        return "danger";
      case "iip_manufacturing":
        if (value >= 5) return "good";
        if (value >= 0) return "warning";
        return "danger";
      case "pmi_composite":
        if (value >= 50) return "good";
        if (value >= 45) return "warning";
        return "danger";
      case "usdinr":
        if (value <= 82) return "good";
        if (value <= 85) return "warning";
        return "danger";
      case "rupee_depreciation":
        if (value <= 1) return "good";
        if (value <= 3) return "warning";
        return "danger";
      default:
        return "good";
    }
  };

  const getHealthColor = (health: string): string => {
    switch (health) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "danger":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  // Prepare data for comparison chart
  const comparisonChartData = result
    ? [
        {
          name: "Base",
          probability: result.base_probability,
          fill: "#3b82f6",
        },
        {
          name: "Modified",
          probability: result.modified_probability,
          fill: result.probability_change > 0 ? "#ef4444" : "#10b981",
        },
      ]
    : [];

  // Prepare radar chart data
  const radarData = [
    {
      indicator: "Credit Growth",
      value: Math.max(0, Math.min(10, indicators.credit_growth + 5)),
      fullMark: 10,
    },
    {
      indicator: "IIP Mfg",
      value: Math.max(0, Math.min(10, indicators.iip_manufacturing + 10)),
      fullMark: 10,
    },
    {
      indicator: "PMI",
      value: (indicators.pmi_composite / 70) * 10,
      fullMark: 10,
    },
    {
      indicator: "USD-INR",
      value: Math.max(0, Math.min(10, 15 - indicators.usdinr / 6)),
      fullMark: 10,
    },
    {
      indicator: "Rupee Dep.",
      value: Math.max(0, Math.min(10, 8 - indicators.rupee_depreciation)),
      fullMark: 10,
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🎯</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Scenario Builder</h1>
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
          <h2 className="text-4xl font-bold text-white mb-2">🎯 Scenario Analysis</h2>
          <p className="text-slate-400 mb-4">
            Adjust economic indicators to forecast recession probability
          </p>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>Logged in as:</span>
            <span className="text-blue-400 font-semibold">{username}</span>
          </div>
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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("sliders")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "sliders"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            🎚️ Adjust Indicators
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "scenarios"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📊 Quick Scenarios
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "results"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📈 Results
          </button>
        </div>

        {/* SLIDERS TAB */}
        {activeTab === "sliders" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left: Sliders */}
            <div className="lg:col-span-2 space-y-6">
              {/* Base Month Selector */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  📅 Base Month (YYYY-MM)
                </label>
                <input
                  type="month"
                  value={baseMonth}
                  onChange={(e) => setBaseMonth(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Select the period for scenario analysis
                </p>
              </div>

              {/* Indicator Sliders */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-6">
                <h3 className="text-lg font-bold text-white">🎚️ Economic Indicators</h3>

                {Object.entries(indicatorConfigs).map(([key, config]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        {config.name}
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-blue-400">
                          {config.value.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-500">{config.unit}</span>
                        <span className={`text-lg ${getHealthColor(getIndicatorHealth(key))}`}>
                          {getIndicatorHealth(key) === "good"
                            ? "✓"
                            : getIndicatorHealth(key) === "warning"
                            ? "⚠"
                            : "✗"}
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      value={config.value}
                      onChange={(e) =>
                        handleSliderChange(key, parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((config.value - config.min) / (config.max - config.min)) *
                          100
                        }%, #475569 ${
                          ((config.value - config.min) / (config.max - config.min)) *
                          100
                        }%, #475569 100%)`,
                      }}
                    />

                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{config.description}</span>
                      <span>
                        {config.min} to {config.max}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={runScenario}
                  disabled={loading || !token}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  {loading ? "⏳ Analyzing..." : "🚀 Run Scenario"}
                </button>
                <button
                  onClick={resetIndicators}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 px-4 rounded-lg transition"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            {/* Right: Radar Chart & Stats */}
            <div className="space-y-6">
              {/* Radar Chart */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-white font-bold mb-4">📡 Indicator Overview</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid strokeDasharray="3 3" stroke="#475569" />
                    <PolarAngleAxis
                      dataKey="indicator"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Indicators"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Info */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
                <h4 className="text-white font-bold">💡 Indicator Ranges</h4>
                <div className="text-xs space-y-2 text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Good: Favorable conditions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Warning: Moderate concern</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Danger: High risk signals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIOS TAB */}
        {activeTab === "scenarios" && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6">📊 Predefined Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => applyScenario(scenario)}
                  className={`bg-gradient-to-r ${scenario.color} rounded-lg p-6 text-white hover:shadow-lg hover:shadow-${scenario.color.split("-")[1]}-500/20 transition text-left group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{scenario.icon}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition">
                      Apply →
                    </span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{scenario.name}</h4>
                  <p className="text-sm opacity-90">{scenario.description}</p>
                </button>
              ))}
            </div>

            {/* Scenario Details */}
            <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h4 className="text-white font-bold mb-4">📝 Scenario Definitions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-white font-semibold mb-2">📊 Baseline</p>
                  <p className="text-slate-400">
                    Current market conditions with expected economic trajectory
                  </p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-2">📉 Stress Scenario</p>
                  <p className="text-slate-400">
                    Severe downturn with deteriorating economic indicators
                  </p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-2">📈 Recovery</p>
                  <p className="text-slate-400">
                    Strong rebound with improving economic conditions
                  </p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-2">⚡ Geopolitical Shock</p>
                  <p className="text-slate-400">
                    External crisis with mixed economic impacts
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <div className="mb-8 space-y-6">
            {result ? (
              <>
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      📊 Base Probability
                    </p>
                    <p className="text-3xl font-bold text-blue-400">
                      {(result.base_probability * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      🔄 Modified Probability
                    </p>
                    <p className="text-3xl font-bold text-blue-400">
                      {(result.modified_probability * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      📈 Change
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        result.probability_change > 0
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {result.probability_change > 0 ? "+" : ""}
                      {(result.probability_change * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div
                    className={`${
                      getStatusDisplay(result.status).bgColor
                    } rounded-lg p-6 border border-slate-700`}
                  >
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      🚨 Status
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        getStatusDisplay(result.status).color
                      }`}
                    >
                      {getStatusDisplay(result.status).icon}{" "}
                      {getStatusDisplay(result.status).label}
                    </p>
                  </div>
                </div>

                {/* Comparison Chart */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="text-lg font-bold text-white mb-4">
                    📊 Probability Comparison
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[0, 1]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                        }}
                        formatter={(value) => [
                          `${(Number(value) * 100).toFixed(1)}%`,
                          "Probability",
                        ]}
                      />
                      <Bar dataKey="probability" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                        {comparisonChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Explanation & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4">💡 AI Analysis</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4">📡 Indicators Used</h4>
                    <div className="space-y-2">
                      {result.indicators_used.map((indicator, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-slate-300 text-sm">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signal Strength & Confidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4">⚡ Signal Strength</h4>
                    <p className="text-2xl font-bold text-yellow-400 mb-3">
                      {result.signal_strength}
                    </p>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width:
                            result.signal_strength === "Strong"
                              ? "80%"
                              : result.signal_strength === "Moderate"
                              ? "50%"
                              : "30%",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4">⭐ Model Confidence</h4>
                    <p className="text-2xl font-bold text-green-400 mb-3">
                      {(result.confidence * 100).toFixed(0)}%
                    </p>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${result.confidence * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="text-white font-bold mb-4">📥 Actions</h4>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                      💾 Save Analysis
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                      📊 Export Report
                    </button>
                    <button
                      onClick={() => setActiveTab("sliders")}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-lg transition"
                    >
                      ✏️ Edit Scenario
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                <p className="text-slate-400 text-lg mb-4">
                  No scenario results yet
                </p>
                <p className="text-slate-500 text-sm mb-6">
                  Adjust indicators or select a scenario and click "Run Scenario" to see results
                </p>
                <button
                  onClick={() => setActiveTab("sliders")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Get Started →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>Scenario analysis powered by ML model | All calculations run on Flask backend</p>
          <p className="mt-2">
            Base API: http://localhost:5000/api/v1/recession/scenario
          </p>
        </div>
      </div>
    </div>
  );
}