import { useState, useEffect, useRef } from "react";
import { Check, ChevronRight, User, Shield, AlertCircle, Scan, RotateCcw, Eye, EyeOff } from "lucide-react";

type View = "login" | "register";
type ScanState = "idle" | "scanning" | "success" | "failed";
type RegStep = 0 | 1 | 2 | 3;

const SCAN_DOTS = Array.from({ length: 24 }, (_, i) => i);

function ScannerFrame({ scanState }: { scanState: ScanState }) {
  const color =
    scanState === "success"
      ? "#00ff9d"
      : scanState === "failed"
      ? "#ff4d6a"
      : "#00d4ff";

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Corner brackets */}
      {[
        "top-0 left-0",
        "top-0 right-0 rotate-90",
        "bottom-0 right-0 rotate-180",
        "bottom-0 left-0 -rotate-90",
      ].map((pos, i) => (
        <svg
          key={i}
          className={`absolute ${pos} w-8 h-8`}
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M2 18 L2 2 L18 2"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "stroke 0.4s ease" }}
          />
        </svg>
      ))}

      {/* Face oval */}
      <div
        className="absolute inset-8 rounded-full border-2 transition-all duration-500"
        style={{ borderColor: `${color}40` }}
      />

      {/* Scan line */}
      {scanState === "scanning" && (
        <div
          className="absolute inset-8 rounded-full overflow-hidden"
          style={{ clipPath: "ellipse(50% 50% at 50% 50%)" }}
        >
          <div
            className="absolute inset-x-0 h-0.5 animate-[scanline_2s_ease-in-out_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 12px 2px ${color}80`,
            }}
          />
        </div>
      )}

      {/* Landmark dots */}
      {scanState !== "idle" &&
        SCAN_DOTS.slice(0, 12).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const rx = 44, ry = 56;
          const cx = 128 + rx * Math.cos(angle);
          const cy = 128 + ry * Math.sin(angle);
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full transition-all duration-300"
              style={{
                left: `${(cx / 256) * 100}%`,
                top: `${(cy / 256) * 100}%`,
                transform: "translate(-50%,-50%)",
                background: color,
                opacity: scanState === "scanning" ? 0.6 : 1,
                boxShadow:
                  scanState === "success" ? `0 0 6px 1px ${color}` : "none",
                animationDelay: `${i * 80}ms`,
              }}
            />
          );
        })}

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {scanState === "success" ? (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#00ff9d20", border: "1px solid #00ff9d40" }}
          >
            <Check size={22} style={{ color: "#00ff9d" }} strokeWidth={2.5} />
          </div>
        ) : scanState === "failed" ? (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#ff4d6a20", border: "1px solid #ff4d6a40" }}
          >
            <AlertCircle size={22} style={{ color: "#ff4d6a" }} strokeWidth={2} />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#00d4ff10", border: "1px solid #00d4ff20" }}
          >
            <User size={18} style={{ color: "#6b7a99" }} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Pulse rings on success */}
      {scanState === "success" && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "#00ff9d" }}
          />
          <div
            className="absolute inset-[-8px] rounded-full animate-ping opacity-10"
            style={{ background: "#00ff9d", animationDelay: "0.3s" }}
          />
        </>
      )}
    </div>
  );
}

function StatusLabel({ state }: { state: ScanState }) {
  const map = {
    idle: { text: "POSITION YOUR FACE", color: "#6b7a99" },
    scanning: { text: "SCANNING...", color: "#00d4ff" },
    success: { text: "FACE RECOGNIZED", color: "#00ff9d" },
    failed: { text: "NOT RECOGNIZED", color: "#ff4d6a" },
  };
  const { text, color } = map[state];
  return (
    <p
      className="font-mono text-xs tracking-[0.2em] mt-2 transition-all duration-300"
      style={{ color, fontFamily: "'DM Mono', monospace" }}
    >
      {text}
    </p>
  );
}

function LoginView({ onSwitch }: { onSwitch: () => void }) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = () => {
    setScanState("scanning");
    timerRef.current = setTimeout(() => {
      const ok = Math.random() > 0.3;
      setScanState(ok ? "success" : "failed");
    }, 2800);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setScanState("idle");
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield size={14} style={{ color: "#00d4ff" }} strokeWidth={1.5} />
          <span
            className="font-mono text-xs tracking-[0.18em] uppercase"
            style={{ color: "#6b7a99", fontFamily: "'DM Mono', monospace" }}
          >
            My Planner
          </span>
        </div>
        <h1
          className="text-3xl font-light tracking-tight"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#e8edf5" }}
        >
          Welcome back
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7a99" }}>
          Verify your identity to continue
        </p>
      </div>

      {/* Scanner */}
      <div className="flex flex-col items-center gap-3">
        <ScannerFrame scanState={scanState} />
        <StatusLabel state={scanState} />
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        {scanState === "idle" && (
          <button
            onClick={startScan}
            className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #0099cc)",
              color: "#080c14",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 0 20px #00d4ff30",
            }}
          >
            <Scan size={16} strokeWidth={2} />
            Scan Face
          </button>
        )}

        {scanState === "scanning" && (
          <button
            disabled
            className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
            style={{
              background: "#1a2235",
              color: "#00d4ff",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#00d4ff40", borderTopColor: "#00d4ff" }}
            />
            Analyzing...
          </button>
        )}

        {scanState === "success" && (
          <button
            className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #00ff9d, #00cc7a)",
              color: "#080c14",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 0 24px #00ff9d30",
            }}
          >
            <Check size={16} strokeWidth={2.5} />
            Continue as "Your Name"
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        )}

        {scanState === "failed" && (
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "#1a2235",
              color: "#ff4d6a",
              border: "1px solid #ff4d6a30",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <RotateCcw size={15} strokeWidth={2} />
            Try Again
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: "rgba(0,212,255,0.1)" }} />
          <span
            className="text-xs font-mono tracking-widest"
            style={{ color: "#3a4a66", fontFamily: "'DM Mono', monospace" }}
          >
            OR
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(0,212,255,0.1)" }} />
        </div>

        {/* Password fallback */}
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Use password instead"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-[#3a4a66]"
            style={{
              background: "#111827",
              border: "1px solid rgba(0,212,255,0.12)",
              color: "#e8edf5",
              fontFamily: "'Outfit', sans-serif",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(0,212,255,0.4)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(0,212,255,0.12)")
            }
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
            style={{ color: "#3a4a66" }}
          >
            {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs" style={{ color: "#3a4a66", fontFamily: "'Outfit', sans-serif" }}>
        Don&apos;t have an account?{" "}
        <button
          onClick={onSwitch}
          className="transition-colors hover:opacity-80"
          style={{ color: "#00d4ff" }}
        >
          Register now
        </button>
      </p>
    </div>
  );
}

const REGISTER_STEPS = [
  { label: "Capture Face", desc: "Position your face within the frame" },
  { label: "Profile Setup", desc: "Enter your account details" },
  { label: "Confirm", desc: "Review and finalize your account" },
];

function RegisterView({ onSwitch }: { onSwitch: () => void }) {
  const [step, setStep] = useState<RegStep>(0);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCapture = () => {
    setScanState("scanning");
    timerRef.current = setTimeout(() => {
      setScanState("success");
    }, 3000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const canAdvanceStep1 = form.name.trim() && form.email.includes("@");

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield size={14} style={{ color: "#00d4ff" }} strokeWidth={1.5} />
          <span
            className="font-mono text-xs tracking-[0.18em] uppercase"
            style={{ color: "#6b7a99", fontFamily: "'DM Mono', monospace" }}
          >
            My Planner
          </span>
        </div>
        <h1
          className="text-3xl font-light tracking-tight"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#e8edf5" }}
        >
          Create account
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7a99" }}>
          Set up biometric authentication
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 w-full">
        {REGISTER_STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300"
                style={{
                  background:
                    i < step
                      ? "#00ff9d"
                      : i === step
                      ? "#00d4ff"
                      : "#1a2235",
                  color:
                    i < step || i === step ? "#080c14" : "#3a4a66",
                  border:
                    i === step
                      ? "none"
                      : i < step
                      ? "none"
                      : "1px solid rgba(0,212,255,0.15)",
                  boxShadow:
                    i === step ? "0 0 12px #00d4ff40" : "none",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className="text-[10px] tracking-wide font-mono hidden sm:block"
                style={{
                  color: i <= step ? "#e8edf5" : "#3a4a66",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < REGISTER_STEPS.length - 1 && (
              <div
                className="h-px flex-1 mx-1 transition-all duration-500"
                style={{
                  background:
                    i < step
                      ? "linear-gradient(90deg, #00ff9d, #00d4ff)"
                      : "rgba(0,212,255,0.1)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="w-full">
        {/* Step 0: Capture */}
        {step === 0 && (
          <div className="flex flex-col items-center gap-4">
            <ScannerFrame scanState={scanState} />
            <StatusLabel state={scanState} />
            {scanState === "idle" && (
              <button
                onClick={startCapture}
                className="mt-1 w-full py-3.5 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                  color: "#080c14",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 0 20px #00d4ff30",
                }}
              >
                <Scan size={16} strokeWidth={2} />
                Capture Face
              </button>
            )}
            {scanState === "scanning" && (
              <div className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm opacity-60"
                style={{ background: "#1a2235", color: "#00d4ff", fontFamily: "'Outfit', sans-serif" }}>
                <div className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: "#00d4ff40", borderTopColor: "#00d4ff" }} />
                Capturing biometric data...
              </div>
            )}
            {scanState === "success" && (
              <button
                onClick={() => setStep(1)}
                className="mt-1 w-full py-3.5 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00ff9d, #00cc7a)",
                  color: "#080c14",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 0 24px #00ff9d30",
                }}
              >
                Face Captured — Continue
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {[
              { key: "name", label: "Full Name", placeholder: "Your Name", type: "text" },
              { key: "email", label: "Password", placeholder: "password", type: "password" },
              { key: "email", label: "Confirm Password", placeholder: "confirm password", type: "comfirm password" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label
                  className="text-xs tracking-widest font-mono uppercase"
                  style={{ color: "#6b7a99", fontFamily: "'DM Mono', monospace" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-[#3a4a66]"
                  style={{
                    background: "#111827",
                    border: "1px solid rgba(0,212,255,0.12)",
                    color: "#e8edf5",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(0,212,255,0.4)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(0,212,255,0.12)")
                  }
                />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: "#1a2235",
                  color: "#6b7a99",
                  border: "1px solid rgba(0,212,255,0.1)",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canAdvanceStep1}
                className="flex-[2] py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: canAdvanceStep1
                    ? "linear-gradient(135deg, #00d4ff, #0099cc)"
                    : "#1a2235",
                  color: canAdvanceStep1 ? "#080c14" : "#3a4a66",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: canAdvanceStep1 ? "0 0 16px #00d4ff25" : "none",
                  cursor: canAdvanceStep1 ? "pointer" : "not-allowed",
                }}
              >
                Continue
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {/* Face preview */}
            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: "#111827", border: "1px solid rgba(0,212,255,0.1)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #00ff9d20, #00d4ff20)",
                  border: "2px solid #00ff9d40",
                }}
              >
                <Check size={20} style={{ color: "#00ff9d" }} strokeWidth={2.5} />
              </div>
              <div>
                <p
                  className="text-xs font-mono tracking-widest mb-0.5"
                  style={{ color: "#00ff9d", fontFamily: "'DM Mono', monospace" }}
                >
                  BIOMETRIC CAPTURED
                </p>
                <p className="text-sm" style={{ color: "#6b7a99" }}>
                  Face data encrypted &amp; stored locally
                </p>
              </div>
            </div>

            {/* Profile summary */}
            <div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: "#111827", border: "1px solid rgba(0,212,255,0.1)" }}
            >
              {[
                { k: "Name", v: form.name || "—" },
                { k: "Email", v: form.email || "—" },
                { k: "Role", v: form.role || "Not specified" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between items-center">
                  <span
                    className="text-xs font-mono tracking-widest"
                    style={{ color: "#3a4a66", fontFamily: "'DM Mono', monospace" }}
                  >
                    {k.toUpperCase()}
                  </span>
                  <span className="text-sm" style={{ color: "#e8edf5", fontFamily: "'Outfit', sans-serif" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: "#1a2235",
                  color: "#6b7a99",
                  border: "1px solid rgba(0,212,255,0.1)",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Back
              </button>
              <button
                onClick={onSwitch}
                className="flex-[2] py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                  color: "#080c14",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 0 20px #00d4ff30",
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs" style={{ color: "#3a4a66", fontFamily: "'Outfit', sans-serif" }}>
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          className="transition-colors hover:opacity-80"
          style={{ color: "#00d4ff" }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("login");

  return (
    <div
      className="size-full min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #001a2e 0%, #080c14 60%)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 30% at 50% -5%, #00d4ff12 0%, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col"
        style={{
          background: "rgba(13,19,32,0.85)",
          border: "1px solid rgba(0,212,255,0.12)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 0 0 1px rgba(0,212,255,0.04), 0 32px 64px rgba(0,0,0,0.5), 0 0 80px rgba(0,212,255,0.06)",
        }}
      >
        {view === "login" ? (
          <LoginView onSwitch={() => setView("register")} />
        ) : (
          <RegisterView onSwitch={() => setView("login")} />
        )}
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: calc(100% - 2px); }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
