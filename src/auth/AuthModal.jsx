import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./AuthProvider.jsx";
import { supabase } from "../lib/supabase.js";
import { inputStyle, Field } from "../ui.jsx";

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

export default function AuthModal({ onClose, onSignedIn }) {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const signup = mode === "signup";

  const missing = !email.includes("@")
    ? "Enter a valid email"
    : password.length < 6
    ? "Password must be at least 6 characters"
    : signup && !USERNAME_RE.test(username)
    ? "Username: 3-24 letters, numbers or underscores"
    : null;

  const submit = async (e) => {
    e.preventDefault();
    if (missing || busy || !isConfigured) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (signup) {
        // Check the handle first: the profiles trigger runs inside the
        // auth.users insert, so a collision there fails the whole sign-up
        // with an opaque database error.
        const { data: taken } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", username)
          .maybeSingle();

        if (taken) {
          setError("That username is already taken");
          return;
        }

        const { data, error: signUpError } = await signUp({ email, password, username });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        // With email confirmation on (the Supabase default) there is no
        // session yet — the user has to click the link first.
        if (!data?.session) {
          setNotice(`Check ${email} for a confirmation link to finish signing up.`);
          return;
        }
      } else {
        const { error: signInError } = await signIn({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
      }

      if (onSignedIn) onSignedIn();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(8,8,10,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{ background: "#17171D", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", maxWidth: 380, width: "100%", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontFamily: "Rajdhani, sans-serif", fontSize: 22, fontWeight: 700 }}>
            {signup ? "Create an account" : "Welcome back"}
          </h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#8B8B95", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {!isConfigured && (
          <p style={{ margin: 0, fontSize: 13, color: "#FFB000", lineHeight: 1.5 }}>
            Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> to your environment and reload.
          </p>
        )}

        {signup && (
          <Field label="Username">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ashketchum"
              autoComplete="username"
              style={inputStyle}
            />
          </Field>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={inputStyle}
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={signup ? "new-password" : "current-password"}
            style={inputStyle}
          />
        </Field>

        {error && <p style={{ margin: 0, fontSize: 13, color: "#FF5C7A" }}>{error}</p>}
        {notice && <p style={{ margin: 0, fontSize: 13, color: "#7BC96F", lineHeight: 1.5 }}>{notice}</p>}

        <button
          type="submit"
          disabled={Boolean(missing) || busy || !isConfigured}
          style={{
            marginTop: 4,
            background: missing || busy || !isConfigured ? "#3A3A44" : "#FFB000",
            color: missing || busy || !isConfigured ? "#77767F" : "#1A1200",
            fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 16,
            border: "none", borderRadius: 10, padding: "12px",
            cursor: missing || busy || !isConfigured ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Working…" : missing || (signup ? "Create account" : "Sign in")}
        </button>

        <button
          type="button"
          onClick={() => { setMode(signup ? "signin" : "signup"); setError(null); setNotice(null); }}
          style={{ background: "none", border: "none", color: "#cfe9e4", fontSize: 13, cursor: "pointer", padding: 0 }}
          className="back-link"
        >
          {signup ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}
