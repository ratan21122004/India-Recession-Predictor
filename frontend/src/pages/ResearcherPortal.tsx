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
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PredictionResult {
  filename: string;
  recession_probability: number;
  status: "alert" | "watch" | "normal";
  signals: string;
  explanation: string;
  num_rows: number;
  created_at: string;
  probability: number;
}

interface UserHistory {
  predictions: PredictionResult[];
  total_predictions: number;
  avg_probability: number;
}

interface AlertConfig {
  threshold: number;
  email: string;
  created_at: string;
}

export default function ResearcherPortal() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<
    "upload" | "results" | "history" | "settings" | "api"
  >("upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<PredictionResult | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<string>("");
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<number>(60);
  const [alertEmail, setAlertEmail] = useState<string>("");
  const [filePreview, setFilePreview] = useState<{
    columns: string[];
    rows: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    totalUploads: number;
    avgProbability: number;
    highRiskCount: number;
  }>({
    totalUploads: 0,
    avgProbability: 0,
    highRiskCount: 0,
  });

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email") || "researcher@example.com";
  const username = localStorage.getItem("username") || "Researcher";

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch user history on mount
  useEffect(() => {
    if (token) {
      fetchHistory();
      fetchAlerts();
    }
  }, [token]);

  // Calculate stats when history changes
  useEffect(() => {
    if (history.length > 0) {
      const avgProb =
        history.reduce((sum, p) => sum + p.recession_probability, 0) /
        history.length;
      const highRisk = history.filter(
        (p) => p.recession_probability >= 0.6
      ).length;

      setStats({
        totalUploads: history.length,
        avgProbability: avgProb,
        highRiskCount: highRisk,
      });
    }
  }, [history]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Fetch prediction history
  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/recession/history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: UserHistory = await response.json();

      if (response.ok) {
        setHistory(data.predictions || []);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch alert configuration
  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/recession/alerts",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
        if (data.alerts && data.alerts.length > 0) {
          setAlertThreshold(data.alerts[0].threshold);
          setAlertEmail(data.alerts[0].email);
        }
      }
    } catch (err) {
      console.error("Alert fetch error:", err);
    }
  };

  // Upload CSV and run prediction
  const handleUploadCSV = async () => {
    if (!csvFile) {
      setUploadError("Please select a CSV file");
      return;
    }

    if (!token) {
      setUploadError("Please login first");
      return;
    }

    // Validate file size (max 10MB)
    if (csvFile.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    if (!csvFile.name.endsWith(".csv")) {
      setUploadError("Please upload a CSV file");
      return;
    }

    setUploadLoading(true);
    setUploadError("");
    setUploadSuccess("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch(
        "http://localhost:5000/api/v1/recession/predict",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data: PredictionResult = await response.json();

      if (response.ok) {
        setUploadResult(data);
        setUploadSuccess(
          `✅ Prediction complete! Analyzed ${data.num_rows} rows.`
        );
        setCsvFile(null);
        setFilePreview(null);

        // Refresh history
        setTimeout(() => fetchHistory(), 1000);

        // Switch to results tab
        setActiveTab("results");
      } else {
        setUploadError(
          data.explanation || "Upload failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(
        "Failed to upload CSV. Make sure Flask backend is running on http://localhost:5000"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  // Save alert configuration
  const handleSaveAlert = async () => {
    if (!alertEmail) {
      setUploadError("Please enter an email address");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/recession/alerts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            threshold: alertThreshold,
            email: alertEmail,
          }),
        }
      );

      if (response.ok) {
        setUploadSuccess("✅ Alert configuration saved!");
        fetchAlerts();
        setTimeout(() => setUploadSuccess(""), 3000);
      } else {
        setUploadError("Failed to save alert configuration");
      }
    } catch (err) {
      console.error("Alert save error:", err);
      setUploadError("Failed to save alert configuration");
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setCsvFile(file);
      setUploadError("");
      setUploadResult(null);

      // Try to preview file (read first line)
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.split("\n");
          const headers = lines[0].split(",");
          setFilePreview({
            columns: headers,
            rows: lines.length - 1,
          });
        };
        reader.readAsText(file);
      }
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCsvFile(file);
      setUploadError("");

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",");
        setFilePreview({
          columns: headers,
          rows: lines.length - 1,
        });
      };
      reader.readAsText(file);
    }
  };

  // Get status color
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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">👨‍🔬</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Researcher Portal</h1>
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
          <h2 className="text-4xl font-bold text-white mb-2">👨‍🔬 Researcher Portal</h2>
          <p className="text-slate-400 mb-4">
            Upload CSV data and run custom recession probability predictions
          </p>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>Logged in as:</span>
            <span className="text-blue-400 font-semibold">{username}</span>
            <span>|</span>
            <span>{email}</span>
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-300 text-sm flex items-start">
              <span className="mr-2 mt-0.5 text-lg">❌</span>
              <span>{uploadError}</span>
            </p>
          </div>
        )}

        {/* Success Alert */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-300 text-sm flex items-start">
              <span className="mr-2 mt-0.5 text-lg">✅</span>
              <span>{uploadSuccess}</span>
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📤 Total Uploads
            </p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalUploads}</p>
            <p className="text-xs text-slate-500 mt-2">CSV files analyzed</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📊 Average Probability
            </p>
            <p className="text-3xl font-bold text-blue-400">
              {(stats.avgProbability * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">Across all uploads</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              🔴 High Risk Uploads
            </p>
            <p className="text-3xl font-bold text-red-400">{stats.highRiskCount}</p>
            <p className="text-xs text-slate-500 mt-2">≥60% probability</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              ⚙️ Account Status
            </p>
            <p className="text-3xl font-bold text-green-400">Active</p>
            <p className="text-xs text-slate-500 mt-2">Full access enabled</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "upload"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📤 Upload Data
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "results"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📊 Latest Results
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "history"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📋 History
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
          <button
            onClick={() => setActiveTab("api")}
            className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "api"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📡 API Access
          </button>
        </div>

        {/* UPLOAD TAB */}
        {activeTab === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">📤 Upload CSV File</h3>

                {/* Drag & Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                    dragActive
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 bg-slate-700/20"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-input"
                  />
                  <label
                    htmlFor="csv-input"
                    className="cursor-pointer block"
                  >
                    <p className="text-4xl mb-3">📁</p>
                    <p className="text-white font-bold mb-2">
                      Click to select or drag and drop
                    </p>
                    <p className="text-slate-400 text-sm">CSV files only (max 10MB)</p>
                    {csvFile && (
                      <p className="text-green-400 mt-3 font-semibold">
                        ✓ {csvFile.name}
                      </p>
                    )}
                  </label>
                </div>

                {/* File Preview */}
                {filePreview && (
                  <div className="mt-6 bg-slate-700 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-3">📋 File Preview</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-300">
                        <span className="text-slate-400">Columns:</span>{" "}
                        {filePreview.columns.length}
                      </p>
                      <p className="text-slate-300">
                        <span className="text-slate-400">Rows:</span>{" "}
                        {filePreview.rows}
                      </p>
                      <div className="mt-3">
                        <p className="text-slate-400 text-xs mb-2">Column Names:</p>
                        <div className="flex flex-wrap gap-2">
                          {filePreview.columns.map((col, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded"
                            >
                              {col.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUploadCSV}
                  disabled={uploadLoading || !csvFile}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  {uploadLoading ? "⏳ Analyzing..." : "🚀 Run Prediction"}
                </button>
              </div>

              {/* Requirements */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-6">
                <h4 className="text-white font-bold mb-4">📋 CSV Requirements</h4>
                <div className="space-y-3 text-sm text-slate-300">
                  <p>
                    ✓ Your CSV must include the following columns (case-insensitive):
                  </p>
                  <div className="bg-slate-700 rounded p-3 space-y-2 text-xs font-mono">
                    <p>• credit_growth (number)</p>
                    <p>• iip_manufacturing (number)</p>
                    <p>• pmi_composite (number)</p>
                    <p>• usdinr (number)</p>
                    <p>• rupee_depreciation (number)</p>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Optional: date column in YYYY-MM format
                  </p>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-white font-bold mb-4">📊 Quick Tips</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Maximum file size is 10MB</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Minimum 1 row of data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>All required columns must be present</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Historical data recommended for accuracy</span>
                  </li>
                </ul>
              </div>

              {/* Example */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-white font-bold mb-4">📝 Example CSV</h4>
                <div className="bg-slate-900 rounded p-3 text-xs font-mono text-slate-300 overflow-x-auto">
                  <pre>{`date,credit_growth,iip_manufacturing,pmi_composite,usdinr,rupee_depreciation
2026-01,4.2,-1.8,48.3,83.5,2.5
2026-02,4.5,-1.2,49.1,83.2,2.3`}</pre>
                </div>
              </div>

              {/* Support */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-white font-bold mb-4">💡 Need Help?</h4>
                <p className="text-sm text-slate-400 mb-4">
                  Check the API documentation or contact support
                </p>
                
                <a
                  href="/api-docs"
                  className="block bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded-lg transition"
                >
                  View API Docs
                </a>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <div className="mb-8">
            {uploadResult ? (
              <div className="space-y-6">
                {/* Result Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      📁 File Name
                    </p>
                    <p className="text-lg font-bold text-white">
                      {uploadResult.filename}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      📊 Recession Probability
                    </p>
                    <p className="text-3xl font-bold text-blue-400">
                      {(uploadResult.recession_probability * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div
                    className={`${
                      getStatusDisplay(uploadResult.status).bgColor
                    } rounded-lg p-6 border border-slate-700`}
                  >
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      🚨 Status
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        getStatusDisplay(uploadResult.status).color
                      }`}
                    >
                      {getStatusDisplay(uploadResult.status).icon}{" "}
                      {getStatusDisplay(uploadResult.status).label}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                      📈 Rows Analyzed
                    </p>
                    <p className="text-3xl font-bold text-green-400">
                      {uploadResult.num_rows}
                    </p>
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4">💡 AI Analysis</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {uploadResult.explanation}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4">🔔 Key Signals</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {uploadResult.signals || "No major signals detected"}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="text-white font-bold mb-4">📋 Prediction Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">Created At</p>
                      <p className="text-white font-semibold">
                        {new Date(uploadResult.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Rows Processed</p>
                      <p className="text-white font-semibold">
                        {uploadResult.num_rows}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Probability</p>
                      <p className="text-white font-semibold">
                        {(uploadResult.probability * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">File</p>
                      <p className="text-white font-semibold truncate">
                        {uploadResult.filename}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    💾 Save Analysis
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    📊 Export Report
                  </button>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-lg transition"
                  >
                    📤 Upload Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                <p className="text-slate-400 text-lg mb-4">No results yet</p>
                <p className="text-slate-500 text-sm mb-6">
                  Upload a CSV file to see prediction results
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Upload CSV →
                </button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="mb-8">
            {historyLoading ? (
              <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                <p className="text-slate-400">Loading history...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-6">
                  📋 Prediction History ({history.length} total)
                </h3>

                {history.map((prediction, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setSelectedHistoryItem(
                        selectedHistoryItem === idx ? null : idx
                      )
                    }
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-slate-600 transition"
                  >
                    {/* Main Row */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg">
                          {prediction.filename}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {new Date(prediction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">
                            {(prediction.recession_probability * 100).toFixed(
                              1
                            )}
                            %
                          </p>
                          <p className="text-xs text-slate-500">Probability</p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded ${
                            getStatusDisplay(prediction.status).bgColor
                          }`}
                        >
                          <p
                            className={`font-bold ${
                              getStatusDisplay(prediction.status).color
                            }`}
                          >
                            {getStatusDisplay(prediction.status).icon}{" "}
                            {getStatusDisplay(prediction.status).label}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {selectedHistoryItem === idx && (
                      <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                        <p className="text-slate-300 text-sm">
                          <span className="text-slate-400">Rows:</span>{" "}
                          {prediction.num_rows}
                        </p>
                        <div>
                          <p className="text-slate-400 text-sm font-semibold mb-2">
                            Explanation
                          </p>
                          <p className="text-slate-300 text-sm">
                            {prediction.explanation}
                          </p>
                        </div>
                        {prediction.signals && (
                          <div>
                            <p className="text-slate-400 text-sm font-semibold mb-2">
                              Signals
                            </p>
                            <p className="text-slate-300 text-sm">
                              {prediction.signals}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                <p className="text-slate-400 text-lg mb-4">No predictions yet</p>
                <p className="text-slate-500 text-sm mb-6">
                  Upload a CSV file to see it in your history
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Upload CSV →
                </button>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Settings */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-6">👤 Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      disabled
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400"
                    />
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    🔐 Change Password
                  </button>
                </div>
              </div>

              {/* Alert Configuration */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-6">🔔 Alert Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Alert Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Send alert when probability exceeds this threshold
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Alert Email
                    </label>
                    <input
                      type="email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleSaveAlert}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    💾 Save Alert Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6">⚙️ Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Email Notifications</p>
                    <p className="text-slate-400 text-sm">Receive alerts via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Dark Mode</p>
                    <p className="text-slate-400 text-sm">Always enabled</p>
                  </div>
                  <input type="checkbox" defaultChecked disabled className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Data Analytics</p>
                    <p className="text-slate-400 text-sm">Help us improve the model</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API ACCESS TAB */}
        {activeTab === "api" && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Key */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">🔑 API Key</h3>
                <div className="bg-slate-900 rounded p-4 mb-4">
                  <p className="font-mono text-xs text-slate-300 break-all">
                    {token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : "No token"}
                  </p>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition mb-2">
                  📋 Copy API Key
                </button>
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-lg transition">
                  🔄 Regenerate Key
                </button>
              </div>

              {/* Endpoint */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">🌐 API Endpoint</h3>
                <div className="bg-slate-900 rounded p-4 mb-4">
                  <p className="font-mono text-xs text-slate-300 break-all">
                    http://localhost:5000/api/v1/recession/predict
                  </p>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  POST endpoint for custom predictions
                </p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                  📖 View Full Docs
                </button>
              </div>
            </div>

            {/* Usage Example */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">💻 Usage Example</h3>
              <div className="bg-slate-900 rounded p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                <pre>{`curl -X POST http://localhost:5000/api/v1/recession/predict \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@data.csv"

# Response:
{
  "filename": "data.csv",
  "recession_probability": 0.62,
  "status": "alert",
  "num_rows": 120,
  "explanation": "Model indicates high recession risk..."
}`}</pre>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">📊 Rate Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-2">Requests per minute</p>
                  <p className="text-2xl font-bold text-blue-400">60</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-2">Max file size</p>
                  <p className="text-2xl font-bold text-blue-400">10MB</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-2">Max rows per file</p>
                  <p className="text-2xl font-bold text-blue-400">10K</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>Researcher Portal | Advanced prediction tools for data scientists</p>
          <p className="mt-2">API: http://localhost:5000 | Support: support@recession-predictor.ai</p>
        </div>
      </div>
    </div>
  );
}