import { useState, useEffect } from "react";

interface RegisterResponse {
  success: boolean;
  user_id: number;
  email: string;
  username: string;
  token: string;
  error?: string;
}

export default function Register() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
    color: string;
  }>({
    score: 0,
    message: "Very Weak",
    color: "text-red-400",
  });

  const navigate = (path: string) => {
    window.location.assign(path);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Check password strength whenever password changes
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

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

  // Check password strength
  const checkPasswordStrength = (pass: string): void => {
    let score = 0;
    let message = "Very Weak";
    let color = "text-red-400";

    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*]/.test(pass)) score++;

    if (score === 0) {
      message = "Very Weak";
      color = "text-red-400";
    } else if (score <= 2) {
      message = "Weak";
      color = "text-red-400";
    } else if (score <= 3) {
      message = "Fair";
      color = "text-yellow-400";
    } else if (score <= 4) {
      message = "Good";
      color = "text-yellow-500";
    } else if (score <= 5) {
      message = "Strong";
      color = "text-blue-400";
    } else {
      message = "Very Strong";
      color = "text-green-400";
    }

    setPasswordStrength({ score, message, color });
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    setError("");

    // Check username
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (username.trim().length > 50) {
      setError("Username must be less than 50 characters");
      return false;
    }

    // Check email
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }

    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check password
    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password.length > 128) {
      setError("Password must be less than 128 characters");
      return false;
    }

    // Check confirm password
    if (!confirmPassword) {
      setError("Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }

    return true;
  };

  // ============================================================================
  // API CALLS
  // ============================================================================

  // Main register handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      // Make register API call to Flask backend
      const response = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (response.ok && data.success) {
        // ====================================================================
        // REGISTRATION SUCCESS
        // ====================================================================

        setSuccess("✅ Account created successfully! Redirecting to login...");

        // Store authentication data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", String(data.user_id));
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("registrationTime", new Date().toISOString());

        // Clear form inputs
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setAgreedToTerms(false);

        // Redirect to login page after delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        // ====================================================================
        // REGISTRATION FAILED
        // ====================================================================

        const errorMessage = data.error || "Registration failed. Please try again.";
        setError(errorMessage);
      }
    } catch (err) {
      // ====================================================================
      // NETWORK ERROR
      // ====================================================================

      console.error("Registration error:", err);
      setError(
        "Failed to connect to backend server. Please ensure Flask is running on http://localhost:5000 and try again."
      );
    } finally {
      setLoading(false);
    }
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
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                <span className="mr-2">📝</span>
                Create Account
              </h1>
              <p className="text-green-100 text-sm">
                Join India Recession Predictor Platform
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
              <div className="mb-4 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                <p className="text-red-300 text-sm flex items-start">
                  <span className="mr-2 mt-0.5 text-lg">❌</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                <p className="text-green-300 text-sm flex items-start">
                  <span className="mr-2 mt-0.5 text-lg">✅</span>
                  <span>{success}</span>
                </p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4 mb-6">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Dr. Priya"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                    disabled={loading}
                    required
                    autoComplete="username"
                  />
                  {username && username.length >= 3 && (
                    <span className="absolute right-3 top-3 text-green-400">✓</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {username.length}/50 characters
                </p>
              </div>

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
                      if (error) setError("");
                    }}
                    placeholder="researcher@example.com"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                    disabled={loading}
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
                      if (error) setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.score <= 2
                            ? "bg-red-500"
                            : passwordStrength.score <= 3
                            ? "bg-yellow-500"
                            : passwordStrength.score <= 4
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${(passwordStrength.score / 6) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                      Password Strength: {passwordStrength.message}
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  💡 Use uppercase, lowercase, numbers, and special characters for a stronger password
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {password && confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${
                      password === confirmPassword
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-slate-400 cursor-pointer hover:text-slate-300"
                >
                  I agree to the{" "}
                  <a href="#" className="text-green-400 hover:text-green-300">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-400 hover:text-green-300">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || backendStatus.status === "offline"}
                className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 ${
                  loading || backendStatus.status === "offline"
                    ? "bg-green-600/50 text-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg hover:shadow-green-500/25"
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Create Account</span>
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

            {/* Footer Links */}
            <div className="text-center text-sm border-t border-slate-700 pt-6">
              <p className="text-slate-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-green-400 hover:text-green-300 font-semibold transition"
                >
                  Login here
                </a>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-slate-900/50 border-t border-slate-700 px-8 py-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="font-semibold text-slate-300 text-sm flex items-center mb-2">
                <span className="mr-2">📋</span>
                Requirements
              </p>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>✓ Username: 3-50 characters</li>
                <li>✓ Email: Valid email format</li>
                <li>✓ Password: Minimum 6 characters</li>
                <li>✓ Passwords must match</li>
              </ul>
            </div>
          </div>

          {/* Footer Status */}
          <div className="bg-slate-900 border-t border-slate-700 px-8 py-3 text-center text-xs text-slate-500">
            <p>🔗 API: http://localhost:5000/api/v1/auth/register</p>
          </div>
        </div>

                {/* Additional Info Below Card */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          <p>
            Backend must be running at{" "}
            <span className="font-mono text-slate-400">http://localhost:5000</span>
          </p>
        </div>
      </div>
    </div>
  );
}