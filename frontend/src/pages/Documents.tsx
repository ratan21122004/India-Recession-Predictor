import { useState, useEffect } from "react";

interface Document {
  id: number;
  title: string;
  category: "policy" | "research" | "guide" | "report" | "manual";
  description: string;
  fileSize: string;
  uploadDate: string;
  downloads: number;
  author: string;
  url: string;
  icon: string;
}

export default function Documents() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "policy" | "research" | "guide" | "report" | "manual"
  >("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title" | "downloads">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock documents data
  const mockDocuments: Document[] = [
    {
      id: 1,
      title: "India Recession Predictor - Technical Documentation",
      category: "manual",
      description:
        "Complete technical guide for the India Recession Predictor platform including architecture, API endpoints, and implementation details.",
      fileSize: "2.4 MB",
      uploadDate: "2026-02-15",
      downloads: 234,
      author: "Development Team",
      url: "/docs/technical-guide.pdf",
      icon: "📘",
    },
    {
      id: 2,
      title: "RBI Monetary Policy Framework 2026",
      category: "policy",
      description:
        "Official Reserve Bank of India monetary policy guidelines and frameworks for 2026. Essential reading for understanding economic indicators.",
      fileSize: "1.8 MB",
      uploadDate: "2026-01-20",
      downloads: 567,
      author: "Reserve Bank of India",
      url: "/docs/rbi-policy-2026.pdf",
      icon: "📋",
    },
    {
      id: 3,
      title: "Machine Learning in Economic Forecasting",
      category: "research",
      description:
        "Peer-reviewed research paper on applying machine learning techniques to economic recession prediction.",
      fileSize: "3.2 MB",
      uploadDate: "2025-12-10",
      downloads: 445,
      author: "Dr. Priya Sharma et al.",
      url: "/docs/ml-economic-forecasting.pdf",
      icon: "📊",
    },
    {
      id: 4,
      title: "User Guide - Getting Started",
      category: "guide",
      description:
        "Step-by-step guide for new users to get started with the India Recession Predictor platform.",
      fileSize: "1.2 MB",
      uploadDate: "2026-02-01",
      downloads: 892,
      author: "Support Team",
      url: "/docs/getting-started.pdf",
      icon: "📖",
    },
    {
      id: 5,
      title: "Q4 2025 Economic Report",
      category: "report",
      description:
        "Comprehensive quarterly economic analysis covering GDP, inflation, employment, and trade indicators.",
      fileSize: "4.1 MB",
      uploadDate: "2026-01-31",
      downloads: 678,
      author: "Research Department",
      url: "/docs/q4-2025-report.pdf",
      icon: "📈",
    },
    {
      id: 6,
      title: "API Documentation v1.0",
      category: "manual",
      description:
        "Complete API reference guide with examples, authentication, rate limits, and error handling.",
      fileSize: "2.8 MB",
      uploadDate: "2026-02-10",
      downloads: 456,
      author: "API Team",
      url: "/docs/api-docs-v1.pdf",
      icon: "🔌",
    },
    {
      id: 7,
      title: "Global Economic Trends - 2026",
      category: "research",
      description:
        "Analysis of global economic trends and their impact on Indian economy.",
      fileSize: "3.5 MB",
      uploadDate: "2026-02-05",
      downloads: 234,
      author: "International Research Consortium",
      url: "/docs/global-trends-2026.pdf",
      icon: "🌍",
    },
    {
      id: 8,
      title: "Model Training Guide",
      category: "guide",
      description:
        "Detailed guide on training and fine-tuning the recession prediction model with custom data.",
      fileSize: "1.9 MB",
      uploadDate: "2026-01-28",
      downloads: 189,
      author: "ML Team",
      url: "/docs/model-training-guide.pdf",
      icon: "🤖",
    },
    {
      id: 9,
      title: "Risk Management Framework",
      category: "policy",
      description:
        "Policy framework for managing financial risks in recession scenarios.",
      fileSize: "2.3 MB",
      uploadDate: "2026-02-08",
      downloads: 345,
      author: "Risk Management Division",
      url: "/docs/risk-framework.pdf",
      icon: "🛡️",
    },
    {
      id: 10,
      title: "Data Privacy & Security Policy",
      category: "policy",
      description:
        "Comprehensive privacy policy and security guidelines for the platform.",
      fileSize: "1.5 MB",
      uploadDate: "2026-02-12",
      downloads: 234,
      author: "Compliance Team",
      url: "/docs/privacy-policy.pdf",
      icon: "🔒",
    },
  ];

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Simulate loading documents
    setLoading(true);
    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort documents
  useEffect(() => {
    let filtered = documents;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "downloads":
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case "date":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedCategory, sortBy]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getCategoryColor = (
    category: string
  ): {
    color: string;
    bgColor: string;
    icon: string;
  } => {
    switch (category) {
      case "policy":
        return { color: "text-blue-400", bgColor: "bg-blue-900/20", icon: "📋" };
      case "research":
        return { color: "text-purple-400", bgColor: "bg-purple-900/20", icon: "📊" };
      case "guide":
        return { color: "text-green-400", bgColor: "bg-green-900/20", icon: "📖" };
      case "report":
        return { color: "text-orange-400", bgColor: "bg-orange-900/20", icon: "📈" };
      case "manual":
        return { color: "text-pink-400", bgColor: "bg-pink-900/20", icon: "📘" };
      default:
        return { color: "text-slate-400", bgColor: "bg-slate-900/20", icon: "📄" };
    }
  };

  const handleDownload = (doc: Document) => {
    // Simulate download
    alert(`Downloading: ${doc.title}`);
    // In real implementation, this would trigger actual file download
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white text-xl">Loading documents...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📚</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Documents & Resources</h1>
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
          <h2 className="text-4xl font-bold text-white mb-2">📚 Documents & Resources</h2>
          <p className="text-slate-400">
            Access policy documents, research papers, guides, and reports
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="policy">📋 Policy</option>
              <option value="research">📊 Research</option>
              <option value="guide">📖 Guide</option>
              <option value="report">📈 Report</option>
              <option value="manual">📘 Manual</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="date">Latest First</option>
              <option value="title">By Title</option>
              <option value="downloads">Most Downloaded</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 py-2 px-4 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 py-2 px-4 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                ☰ List
              </button>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-slate-400 text-sm">
            Found {filteredDocuments.length} document
            {filteredDocuments.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Documents Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition cursor-pointer group"
              >
                {/* Icon & Category */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl group-hover:scale-110 transition">
                    {doc.icon}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      getCategoryColor(doc.category).bgColor
                    } ${getCategoryColor(doc.category).color}`}
                  >
                    {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                  {doc.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {doc.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-slate-500 mb-4 border-t border-slate-700 pt-4">
                  <div className="flex justify-between">
                    <span>📅 {new Date(doc.uploadDate).toLocaleDateString()}</span>
                    <span>📦 {doc.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✍️ {doc.author}</span>
                    <span>📥 {doc.downloads} downloads</span>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(doc);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Documents List View */}
        {viewMode === "list" && (
          <div className="space-y-4 mb-8">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <span className="text-3xl group-hover:scale-110 transition">
                    {doc.icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold truncate">{doc.title}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                          getCategoryColor(doc.category).bgColor
                        } ${getCategoryColor(doc.category).color}`}
                      >
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-1">
                      {doc.description}
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>📅 {new Date(doc.uploadDate).toLocaleDateString()}</span>
                      <span>📦 {doc.fileSize}</span>
                      <span>📥 {doc.downloads} downloads</span>
                      <span>✍️ {doc.author}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition whitespace-nowrap"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredDocuments.length === 0 && (
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
            <p className="text-slate-400 text-lg mb-4">No documents found</p>
            <p className="text-slate-500 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📚 Total Documents
            </p>
            <p className="text-3xl font-bold text-blue-400">{documents.length}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📊 Policy Documents
            </p>
            <p className="text-3xl font-bold text-blue-400">
              {documents.filter((d) => d.category === "policy").length}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              📈 Total Downloads
            </p>
            <p className="text-3xl font-bold text-green-400">
              {documents.reduce((sum, d) => sum + d.downloads, 0)}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
              ⭐ Most Popular
            </p>
            <p className="text-3xl font-bold text-orange-400">
              {Math.max(...documents.map((d) => d.downloads))}
            </p>
          </div>
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto border border-slate-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedDocument.icon} {selectedDocument.title}
                </h3>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded inline-block ${
                    getCategoryColor(selectedDocument.category).bgColor
                  } ${getCategoryColor(selectedDocument.category).color}`}
                >
                  {selectedDocument.category.charAt(0).toUpperCase() +
                    selectedDocument.category.slice(1)}
                </span>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-slate-400 hover:text-slate-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-white font-bold mb-2">Description</h4>
                <p className="text-slate-300">{selectedDocument.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Author</p>
                  <p className="text-white font-semibold">{selectedDocument.author}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">File Size</p>
                  <p className="text-white font-semibold">{selectedDocument.fileSize}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Upload Date</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Downloads</p>
                  <p className="text-white font-semibold">{selectedDocument.downloads}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  ⬇️ Download Document
                </button>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 px-4 rounded-lg transition">
                  👁️ Preview
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-slate-900 rounded p-4">
                <p className="text-slate-400 text-xs">
                  💡 Tip: You can search within your downloaded documents or read them in your
                  preferred PDF reader for better annotation features.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>Documents & Resources Library | Access policy documents and research papers</p>
          <p className="mt-2">
            {documents.length} documents available | Last updated:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}