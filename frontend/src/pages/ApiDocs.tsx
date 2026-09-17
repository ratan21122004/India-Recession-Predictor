import { useState } from "react";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  parameters?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  body?: string;
  response: string;
  example: string;
}

export default function ApiDocs() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<"overview" | "endpoints" | "auth" | "examples">(
    "overview"
  );
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // API Base URL
  const API_BASE = "http://localhost:5000/api/v1";

  // API Endpoints
  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/health",
      description: "Check API health status",
      auth: false,
      response: '{ "status": "running", "version": "1.0.0" }',
      example: `curl -X GET ${API_BASE}/health`,
    },
    {
      method: "POST",
      path: "/auth/register",
      description: "Register a new user",
      auth: false,
      body: '{ "username": "string", "email": "string", "password": "string" }',
      response: '{ "success": true, "user_id": number, "token": "string" }',
      example: `curl -X POST ${API_BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john","email":"john@example.com","password":"pass123"}'`,
    },
    {
      method: "POST",
      path: "/auth/login",
      description: "Login and get JWT token",
      auth: false,
      body: '{ "email": "string", "password": "string" }',
      response: '{ "success": true, "token": "string", "user_id": number, "email": "string" }',
      example: `curl -X POST ${API_BASE}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"pass123"}'`,
    },
    {
      method: "GET",
      path: "/recession/current",
      description: "Get current month recession probability",
      auth: false,
      response: `{
  "date": "2026-02",
  "probability": 0.45,
  "status": "watch",
  "confidence": 0.87,
  "signals": "string",
  "explanation": "string"
}`,
      example: `curl -X GET ${API_BASE}/recession/current`,
    },
    {
      method: "GET",
      path: "/recession/timeline",
      description: "Get historical timeline data (314 months)",
      auth: false,
      response: `[
  { "date": "2000-01", "probability": 0.25, "status": "normal" },
  { "date": "2000-02", "probability": 0.28, "status": "normal" }
]`,
      example: `curl -X GET ${API_BASE}/recession/timeline`,
    },
    {
      method: "POST",
      path: "/recession/predict",
      description: "Upload CSV and get recession prediction",
      auth: true,
      body: "multipart/form-data (file: CSV)",
      response: `{
  "filename": "string",
  "recession_probability": number,
  "status": "alert|watch|normal",
  "num_rows": number,
  "explanation": "string"
}`,
      example: `curl -X POST ${API_BASE}/recession/predict \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@data.csv"`,
    },
    {
      method: "POST",
      path: "/recession/scenario",
      description: "Run scenario analysis with custom indicators",
      auth: true,
      body: `{
  "base_month": "YYYY-MM",
  "indicators": {
    "credit_growth": number,
    "iip_manufacturing": number,
    "pmi_composite": number
  }
}`,
      response: `{
  "base_probability": number,
  "modified_probability": number,
  "status": "string",
  "explanation": "string"
}`,
      example: `curl -X POST ${API_BASE}/recession/scenario \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "base_month": "2026-02",
    "indicators": {
      "credit_growth": 4.2,
      "iip_manufacturing": -1.8,
      "pmi_composite": 48.3
    }
  }'`,
    },
    {
      method: "GET",
      path: "/recession/history",
      description: "Get user's prediction history",
      auth: true,
      response: `{
  "predictions": [
    {
      "filename": "string",
      "recession_probability": number,
      "status": "string",
      "created_at": "ISO8601"
    }
  ]
}`,
      example: `curl -X GET ${API_BASE}/recession/history \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
    },
  ];

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case "GET":
        return "bg-blue-900/20 text-blue-400";
      case "POST":
        return "bg-green-900/20 text-green-400";
      case "PUT":
        return "bg-orange-900/20 text-orange-400";
      case "DELETE":
        return "bg-red-900/20 text-red-400";
      default:
        return "bg-slate-900/20 text-slate-400";
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
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📡</span>
              </div>
              <h1 className="text-2xl font-bold text-white">API Documentation</h1>
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
          <h2 className="text-4xl font-bold text-white mb-2">📡 API Reference</h2>
          <p className="text-slate-400">
            Complete documentation for India Recession Predictor API v1.0
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Base URL</p>
            <p className="text-white font-mono text-sm">{API_BASE}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Version</p>
            <p className="text-white font-bold text-lg">1.0.0</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              Auth Method
            </p>
            <p className="text-white font-bold">JWT Bearer Token</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Rate Limit</p>
            <p className="text-white font-bold">60 req/min</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "overview"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            📖 Overview
          </button>
          <button
            onClick={() => setActiveTab("auth")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "auth"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            🔐 Authentication
          </button>
          <button
            onClick={() => setActiveTab("endpoints")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "endpoints"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            🔌 Endpoints
          </button>
          <button
            onClick={() => setActiveTab("examples")}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === "examples"
                ? "text-blue-400 border-b-blue-400"
                : "text-slate-400 border-b-transparent hover:text-slate-300"
            }`}
          >
            💻 Examples
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Getting Started</h3>
              <div className="space-y-4 text-slate-300">
                <p>
                  Welcome to the India Recession Predictor API! This REST API provides access to
                  our machine learning models for predicting economic recession probability.
                </p>
                <p>
                  All API calls use HTTPS and return JSON responses. Authenticated endpoints
                  require a JWT Bearer token.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">📋 Base Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Endpoint</p>
                    <p className="text-white font-mono">{API_BASE}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Content Type</p>
                    <p className="text-white font-mono">application/json</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Response Format</p>
                    <p className="text-white font-mono">JSON</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">⚙️ Requirements</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✓ Backend running at http://localhost:5000</p>
                  <p>✓ Valid JWT token for protected endpoints</p>
                  <p>✓ HTTP headers: Content-Type, Authorization</p>
                  <p>✓ Rate limit: 60 requests per minute</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTH TAB */}
        {activeTab === "auth" && (
          <div className="space-y-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">🔐 Authentication</h3>

              <div className="space-y-6">
                {/* JWT */}
                <div>
                  <h4 className="text-white font-bold mb-3">JWT Bearer Token</h4>
                  <p className="text-slate-300 mb-4">
                    All protected endpoints require a JWT Bearer token in the Authorization header.
                  </p>
                  <div className="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4">
                    <p>Authorization: Bearer {'<YOUR_JWT_TOKEN>'}</p>
                  </div>
                </div>

                {/* Getting Token */}
                <div>
                  <h4 className="text-white font-bold mb-3">Getting a Token</h4>
                  <p className="text-slate-300 mb-4">
                    Register or login to get a JWT token:
                  </p>
                  <div className="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300">
                    <pre>{`POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": 123,
  "email": "user@example.com"
}`}</pre>
                  </div>
                </div>

                {/* Token Usage */}
                <div>
                  <h4 className="text-white font-bold mb-3">Using the Token</h4>
                  <p className="text-slate-300 mb-4">Include token in all protected requests:</p>
                  <div className="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300">
                    <pre>{`curl -X POST ${API_BASE}/recession/predict \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@data.csv"`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ENDPOINTS TAB */}
        {activeTab === "endpoints" && (
          <div className="space-y-4 mb-8">
            {endpoints.map((endpoint, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setSelectedEndpoint(selectedEndpoint?.path === endpoint.path ? null : endpoint)
                }
                className="w-full bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition text-left"
              >
                {/* Endpoint Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded font-bold text-sm ${getMethodColor(
                        endpoint.method
                      )}`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-white font-mono">{endpoint.path}</code>
                  </div>
                  <span className="text-slate-400">
                    {selectedEndpoint?.path === endpoint.path ? "▼" : "▶"}
                  </span>
                </div>

                <p className="text-slate-400 text-sm">{endpoint.description}</p>

                {endpoint.auth && (
                  <p className="text-xs text-orange-400 mt-2">🔒 Requires authentication</p>
                )}

                {/* Expanded Details */}
                {selectedEndpoint?.path === endpoint.path && (
                  <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                    {/* Parameters */}
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div>
                        <h4 className="text-white font-bold mb-3">Parameters</h4>
                        <div className="bg-slate-900 rounded p-4">
                          {endpoint.parameters.map((param, pidx) => (
                            <div key={pidx} className="mb-2 text-sm">
                              <span className="text-blue-400">{param.name}</span>
                              <span className="text-slate-400"> ({param.type}) </span>
                              {param.required && <span className="text-red-400">*required</span>}
                              <p className="text-slate-500 text-xs">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request Body */}
                    {endpoint.body && (
                      <div>
                        <h4 className="text-white font-bold mb-3">Request Body</h4>
                        <div className="bg-slate-900 rounded p-4">
                          <pre className="text-slate-300 text-sm font-mono overflow-x-auto">
                            {endpoint.body}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Response */}
                    <div>
                      <h4 className="text-white font-bold mb-3">Response</h4>
                      <div className="bg-slate-900 rounded p-4">
                        <pre className="text-slate-300 text-sm font-mono overflow-x-auto">
                          {endpoint.response}
                        </pre>
                      </div>
                    </div>

                    {/* Example */}
                    <div>
                      <h4 className="text-white font-bold mb-3">Example</h4>
                      <div className="bg-slate-900 rounded p-4 relative">
                        <pre className="text-slate-300 text-sm font-mono overflow-x-auto">
                          {endpoint.example}
                        </pre>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(endpoint.example, `${idx}-example`);
                          }}
                          className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded transition"
                        >
                          {copiedCode === `${idx}-example` ? "✓ Copied" : "📋 Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === "examples" && (
          <div className="space-y-6 mb-8">
            {/* JavaScript Example */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">JavaScript/Fetch</h3>
              <div className="bg-slate-900 rounded p-4 relative">
                <pre className="text-slate-300 text-sm font-mono overflow-x-auto">{`// Get current recession probability
const response = await fetch('${API_BASE}/recession/current');
const data = await response.json();
console.log(data.probability); // 0.45

// Login and get token
const loginRes = await fetch('${API_BASE}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginRes.json();

// Upload CSV with token
const formData = new FormData();
formData.append('file', csvFile);

const uploadRes = await fetch('${API_BASE}/recession/predict', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${token}\` },
  body: formData
});
const prediction = await uploadRes.json();`}</pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `// Get current recession probability\nconst response = await fetch('${API_BASE}/recession/current');`,
                      "js-example"
                    )
                  }
                  className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  {copiedCode === "js-example" ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* Python Example */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Python/Requests</h3>
              <div className="bg-slate-900 rounded p-4 relative">
                <pre className="text-slate-300 text-sm font-mono overflow-x-auto">{`import requests

# Get current prediction
response = requests.get('${API_BASE}/recession/current')
data = response.json()
print(data['probability'])  # 0.45

# Login
login_res = requests.post('${API_BASE}/auth/login', json={
    'email': 'user@example.com',
    'password': 'password123'
})
token = login_res.json()['token']

# Upload CSV
headers = {'Authorization': f'Bearer {token}'}
files = {'file': open('data.csv', 'rb')}
upload_res = requests.post(
    '${API_BASE}/recession/predict',
    headers=headers,
    files=files
)
prediction = upload_res.json()`}</pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `import requests\n\n# Get current prediction\nresponse = requests.get('${API_BASE}/recession/current')`,
                      "python-example"
                    )
                  }
                  className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  {copiedCode === "python-example" ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* cURL Example */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">cURL</h3>
              <div className="bg-slate-900 rounded p-4 relative">
                <pre className="text-slate-300 text-sm font-mono overflow-x-auto">{`# Check API health
curl ${API_BASE}/health

# Login
curl -X POST ${API_BASE}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password123"}'

# Get current prediction
curl ${API_BASE}/recession/current

# Upload CSV (with token)
curl -X POST ${API_BASE}/recession/predict \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@data.csv"`}</pre>
                <button
                  onClick={() =>
                    copyToClipboard(`curl ${API_BASE}/health`, "curl-example")
                  }
                  className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  {copiedCode === "curl-example" ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Codes */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">❌ Error Codes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded p-4">
              <p className="text-blue-400 font-bold mb-2">200 OK</p>
              <p className="text-slate-400 text-sm">Request succeeded</p>
            </div>
            <div className="bg-slate-900 rounded p-4">
              <p className="text-yellow-400 font-bold mb-2">400 Bad Request</p>
              <p className="text-slate-400 text-sm">Invalid parameters</p>
            </div>
            <div className="bg-slate-900 rounded p-4">
              <p className="text-red-400 font-bold mb-2">401 Unauthorized</p>
              <p className="text-slate-400 text-sm">Missing/invalid token</p>
            </div>
            <div className="bg-slate-900 rounded p-4">
              <p className="text-red-400 font-bold mb-2">429 Too Many Requests</p>
              <p className="text-slate-400 text-sm">Rate limit exceeded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>API Documentation | Version 1.0.0</p>
          <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}