import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const MIP_API = "https://mip-service-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const SUPABASE_URL = "https://xwguviuinmafenlqwtka.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Z3V2aXVpbm1hZmVubHF3dGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTU3MDksImV4cCI6MjA4NzQzMTcwOX0.kCJ47zKNbj-jPFVPEV98WRcbyfqMrYRoM01CUPt-fHs";

// Same allowlist ProtectedRoute enforces client-side (src/auth/ProtectedRoute.tsx).
const ALLOWED_EMAILS = ["ed@dobbles.ai"];

// Exact admin endpoints the MIPOps page calls. No open proxy: anything not
// listed here 404s before it ever reaches the upstream fetch.
const PROXY_ROUTES = {
  health: { method: "GET", upstream: "/health" },
  "pipeline-snapshot": { method: "GET", upstream: "/api/pipeline/snapshot" },
};

const app = express();

async function requireAuthorizedUser(req, res) {
  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "missing bearer token" });
    return null;
  }

  let user;
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    });
    if (!userRes.ok) {
      res.status(401).json({ error: "invalid session" });
      return null;
    }
    user = await userRes.json();
  } catch {
    res.status(401).json({ error: "invalid session" });
    return null;
  }

  const email = (user?.email || "").toLowerCase();
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    res.status(403).json({ error: "forbidden" });
    return null;
  }
  return user;
}

app.get("/api/mip-proxy/:route", async (req, res) => {
  const route = PROXY_ROUTES[req.params.route];
  if (!route) {
    return res.status(404).json({ error: "not found" });
  }

  const user = await requireAuthorizedUser(req, res);
  if (!user) return;

  if (!ADMIN_API_KEY) {
    return res.status(500).json({ error: "server misconfigured: ADMIN_API_KEY not set" });
  }

  try {
    const upstream = await fetch(`${MIP_API}${route.upstream}`, {
      method: route.method,
      headers: { "x-admin-key": ADMIN_API_KEY, "Content-Type": "application/json" },
    });
    const body = await upstream.text();
    res.status(upstream.status);
    res.set("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.send(body);
  } catch {
    res.status(502).json({ error: "upstream fetch failed" });
  }
});

// Explicit deny-by-default for any other /api/* path — no open proxy, and
// prevents unmatched admin paths from falling through to the SPA catch-all.
app.all(/^\/api\//, (req, res) => {
  res.status(404).json({ error: "not found" });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`mornin-boost-hub server listening on ${PORT}`);
});
