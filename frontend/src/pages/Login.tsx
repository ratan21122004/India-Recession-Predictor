import { useState, useEffect } from "react";

interface LoginResponse {
  success: boolean;
  user_id: number;
  email: string;
  username: string;
  token: string;
  error?: string;
}

export default function Login() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<{
    status: "checking" | "online" | "offline";
    message: string;
  }>({
    status: "checking",
    message: "Checking backend...",
  });
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const [showDemo, setShowDemo] = useState<boolean>(true);

  // Keep this page independent of react-router-dom so it also works in
  // builds where the router package is not installed.
  const navigate = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.location.replace(path);
    } else {
      window.location.assign(path);
    }
  };
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 300; // 5 minutes in seconds

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Load remembered email from localStorage
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle lockout countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockCountdown > 0) {
      interval = setInterval(() => {
        setLockCountdown((prev) => prev - 1);
      }, 1000);
    } else if (lockCountdown === 0 && isLocked) {
      setIsLocked(false);
      setAttemptCount(0);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockCountdown]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Check if backend is running
  const checkBackendStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setBackendStatus({
          status: "online",
          message: "Backend is online",
        });
      } else {
        setBackendStatus({
          status: "offline",
          message: "Backend responded with error",
        });
      }
    } catch (err) {
      setBackendStatus({
        status: "offline",
        message: "Cannot reach backend at http://localhost:5000",
      });
    }
  };

  // Validate email format
  const isValidEmail = (emailToCheck: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToCheck);
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    // Clear previous errors
    setError("");

    // Check if email is provided
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }

    // Check if email format is valid
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check if password is provided
    if (!password) {
      setError("Password is required");
      return false;
    }

    // Check minimum password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  // Format lockout countdown time
  const formatLockoutTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Main login handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked) {
      setError(
        `Too many login attempts. Please try again in ${formatLockoutTime(lockCountdown)}`
      );
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Check backend connectivity
    if (backendStatus.status === "offline") {
      setError(
        "Cannot connect to backend. Make sure Flask is running on http://localhost:5000"
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Make login API call to Flask backend
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success) {
        // ====================================================================
        // LOGIN SUCCESS
        // ====================================================================

        setSuccess("✅ Login successful! Redirecting to dashboard...");
        setAttemptCount(0); // Reset attempt counter on success

        // Store authentication data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", String(data.user_id));
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", new Date().toISOString());

        // Store remembered email if checkbox is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email.trim());
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Clear form inputs
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setRememberMe(false);

        // Redirect to home page after delay
        setTimeout(() => {
          navigate("/", { replace: true });
          window.location.reload();
        }, 1500);
      } else {
        // ====================================================================
        // LOGIN FAILED
        // ====================================================================

        const errorMessage = data.error || "Login failed. Please try again.";
        setError(errorMessage);

        // Increment failed attempt counter
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        // Lock account after max attempts
        if (newAttemptCount >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockCountdown(LOCKOUT_TIME);
          setError(
            `Too many failed login attempts. Account locked for ${formatLockoutTime(LOCKOUT_TIME)}`
          );
        }
      }
    } catch (err) {
      // ====================================================================
      // NETWORK ERROR
      // ====================================================================

      console.error("Login error:", err);
      setError(
        "Failed to connect to backend server. Please ensure Flask is running on http://localhost:5000 and try again."
      );

      // Increment failed attempt counter even for network errors
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setLockCountdown(LOCKOUT_TIME);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle demo login
  const handleDemoLogin = async () => {
    setEmail("test@example.com");
    setPassword("password123");
    setShowPassword(false);
    setRememberMe(false);

    // Create a mock form event
    const mockEvent = new Event("submit", { bubbles: true }) as unknown as React.FormEvent<HTMLFormElement>;
    
    // Small delay to ensure state updates
    setTimeout(() => {
      handleLogin(mockEvent);
    }, 100);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Login to Dashboard
              </h1>
              <p className="text-blue-100 text-sm">
                India Recession Predictor Platform
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Backend Status Indicator */}
            <div className="mb-6 p-3 rounded-lg bg-slate-700 border border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">Backend Status:</span>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      backendStatus.status === "online"
                        ? "bg-green-500"
                        : backendStatus.status === "checking"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span
                    className={`text-xs font-medium ${
                      backendStatus.status === "online"
                        ? "text-green-400"
                        : backendStatus.status === "checking"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {backendStatus.message}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-700/30 rounded-lg animation-pulse">
                <p className="text-red-300 text-sm flex items-start">
                  <span className="mr-2 mt-0.5 text-lg">❌</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-700/30 rounded-lg animation-pulse">
                <p className="text-green-300 text-sm flex items-start">
                  <span className="mr-2 mt-0.5 text-lg">✅</span>
                  <span>{success}</span>
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(""); // Clear error on input
                    }}
                    placeholder="researcher@example.com"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    disabled={loading || isLocked}
                    required
                    autoComplete="email"
                  />
                  {email && isValidEmail(email) && (
                    <span className="absolute right-3 top-3 text-green-400">✓</span>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(""); // Clear error on input
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    disabled={loading || isLocked}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || isLocked}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading || isLocked}
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-400 cursor-pointer hover:text-slate-300"
                >
                  Remember my email
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isLocked || backendStatus.status === "offline"}
                className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 ${
                  loading || isLocked || backendStatus.status === "offline"
                    ? "bg-blue-600/50 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25"
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>Logging in...</span>
                  </>
                ) : isLocked ? (
                  <>
                    <span>🔒</span>
                    <span>Account Locked ({formatLockoutTime(lockCountdown)})</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-800 text-slate-500">OR</span>
              </div>
            </div>

            {/* Demo Button */}
            <button
              onClick={handleDemoLogin}
              disabled={loading || isLocked || backendStatus.status === "offline"}
              className={`w-full font-medium py-3 px-4 rounded-lg transition duration-200 mb-6 ${
                loading || isLocked || backendStatus.status === "offline"
                  ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
              }`}
            >
              🧪 Try Demo Account
            </button>

            {/* Footer Links */}
            <div className="space-y-3 text-center text-sm border-t border-slate-700 pt-6">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Register here
                </a>
              </p>

              <p>
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    setError("Password reset coming soon!");
                  }}
                  className="text-slate-400 hover:text-slate-300 transition"
                >
                  Forgot password?
                </a>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-slate-900/50 border-t border-slate-700 px-8 py-4">
            {showDemo && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-slate-300 text-sm flex items-center">
                  <span className="mr-2">📋</span>
                  Demo Credentials
                </p>
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="font-mono">
                    Email: <span className="text-slate-300">test@example.com</span>
                  </p>
                  <p className="font-mono">
                    Password: <span className="text-slate-300">password123</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowDemo(false)}
                  className="text-xs text-slate-500 hover:text-slate-400 mt-2"
                >
                  Hide
                </button>
              </div>
            )}

                    {!showDemo && (
          <button
            onClick={() => setShowDemo(true)}
            className="text-xs text-slate-500 hover:text-slate-400 transition"
          >
            Show demo credentials
          </button>
        )}
      </div>

      {/* Footer Status */}
      <div className="bg-slate-900 border-t border-slate-700 px-8 py-3 text-center text-xs text-slate-500">
        <p>🔗 API: http://localhost:5000/api/v1</p>
      </div>
    </div>

    {/* Additional Info Below Card */}
    <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
      <p>
        Backend must be running at{" "}
        <span className="font-mono text-slate-400">http://localhost:5000</span>
      </p>
      <p>
        Frontend is running at{" "}
        <span className="font-mono text-slate-400">http://localhost:8443</span>
      </p>
    </div>
  </div>
  </div>
);
}