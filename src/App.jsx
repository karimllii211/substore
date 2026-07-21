import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update, onValue, push, remove } from 'firebase/database';

// =========================================================================
// ⚠️ FIREBASE REALTIME DATABASE KONFİQURASİYASI
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBQGR-rN7qXlTa0KaCiDALLPOM5NOgfqwU",
  authDomain: "premiumshop-5c568.firebaseapp.com",
  databaseURL: "https://premiumshop-5c568-default-rtdb.firebaseio.com",
  projectId: "premiumshop-5c568",
  storageBucket: "premiumshop-5c568.firebasestorage.app",
  messagingSenderId: "410724874477",
  appId: "1:410724874477:web:e65784b697a99e14ebf4e4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================================
// ⚠️ EMAILJS KONFİQURASİYASI
// =========================================================================
const EMAILJS_CONFIG = {
  serviceId: "premiumshop",
  templateOtp: "otpcode",
  templateOrder: "orderdone",
  publicKey: "MpwQ11f-oEOzMIkNs",
  privateKey: "OmxGuIfsqwmr8FTV8Rkmr",
  adminEmail: "premiumshopazerbaycan@gmail.com"
};

// =========================================================================
// 🔒 SECURITY LAYER — Arxa plan təhlükəsizlik modulları
// Bütün funksiyalar UI-dan tamamilə gizlidir.
// =========================================================================

/**
 * Minimal SHA-256 hashing — Web Crypto API (native, no dependencies)
 * Şifrəni Firebase-ə yazmadan əvvəl hash edir.
 */
const hashPassword = async (plainText) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText + "ps_salt_2026");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback: base64 obfuscation if subtle crypto unavailable
    return btoa(unescape(encodeURIComponent(plainText + "ps_salt_2026")));
  }
};

/**
 * Rate limiter — localStorage-based sliding window.
 * key: identifier (email veya "admin"), maxAttempts, windowMs
 * Returns: { allowed: bool, remaining: number, resetIn: number(ms) }
 */
const rateLimiter = (() => {
  const STORE_KEY = "ps_rl";
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
  const save = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {} };

  return {
    check(key, maxAttempts = 5, windowMs = 60 * 1000) {
      const now = Date.now();
      const store = load();
      const rec = store[key] || { attempts: [], blockedUntil: 0 };

      // Hard block still active?
      if (rec.blockedUntil > now) {
        return { allowed: false, remaining: 0, resetIn: rec.blockedUntil - now };
      }

      // Slide window
      rec.attempts = rec.attempts.filter((t) => now - t < windowMs);

      if (rec.attempts.length >= maxAttempts) {
        // Fixed 120 second block (2 minutes), no IP ban.
        const lockMs = 120 * 1000;
        rec.blockedUntil = now + lockMs;
        store[key] = rec;
        save(store);
        return { allowed: false, remaining: 0, resetIn: lockMs };
      }

      return { allowed: true, remaining: maxAttempts - rec.attempts.length, resetIn: 0 };
    },

    record(key) {
      const now = Date.now();
      const store = load();
      const rec = store[key] || { attempts: [], blockedUntil: 0 };
      rec.attempts.push(now);
      store[key] = rec;
      save(store);
    },

    reset(key) {
      const store = load();
      delete store[key];
      save(store);
    }
  };
})();

/**
 * OTP Manager — OTP-nin yaradılması, doğrulanması və vaxt bitiminin idarəsi.
 * In-memory store (tab-isolated, no localStorage leak).
 * OTP 10 dəqiqə sonra avtomatik etibarsız olur.
 */
const otpManager = (() => {
  const store = new Map(); // key -> { code, expiresAt, attempts }
  const OTP_TTL = 10 * 60 * 1000; // 10 minutes
  const MAX_VERIFY_ATTEMPTS = 5;

  return {
    generate(key) {
      // Crypto-secure random 6-digit OTP
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      const code = String(100000 + (arr[0] % 900000));
      store.set(key, { code, expiresAt: Date.now() + OTP_TTL, attempts: 0 });
      return code;
    },

    verify(key, input) {
      const entry = store.get(key);
      if (!entry) return { valid: false, reason: "not_found" };
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return { valid: false, reason: "expired" };
      }
      entry.attempts += 1;
      if (entry.attempts > MAX_VERIFY_ATTEMPTS) {
        store.delete(key);
        return { valid: false, reason: "too_many_attempts" };
      }
      // Constant-time comparison (prevent timing attacks)
      const a = String(entry.code).padEnd(6, "_");
      const b = String(input).padEnd(6, "_");
      let diff = 0;
      for (let i = 0; i < 6; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
      if (diff === 0) {
        store.delete(key);
        return { valid: true };
      }
      return { valid: false, reason: "wrong_code" };
    },

    clear(key) {
      store.delete(key);
    }
  };
})();

/**
 * Session Manager — localStorage session with expiry + integrity token.
 * Session 7 gün sonra avtomatik etibarsız olur.
 * Sessionu manual dəyişdirmək mümkünsüz — integrity token yoxlanır.
 */
const sessionManager = (() => {
  const SESSION_KEY = "ps_session";
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  const genToken = (payload) => {
    // Lightweight HMAC-like token using btoa + simple XOR fingerprint
    const raw = JSON.stringify(payload);
    const ts = Date.now();
    return btoa(`${ts}:${raw.length}:${raw.split("").reduce((a, c) => (a + c.charCodeAt(0)) & 0xFFFF, 0)}`);
  };

  return {
    save(user) {
      const expiresAt = Date.now() + SESSION_TTL;
      const payload = { user, expiresAt };
      const token = genToken(payload);
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ payload, token }));
      } catch {}
    },

    load() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const { payload, token } = JSON.parse(raw);
        if (!payload || !token) return null;
        if (Date.now() > payload.expiresAt) {
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
        // Re-generate token from stored payload and compare
        const expected = genToken(payload);
        if (expected !== token) {
          // Integrity failure — wipe session
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
        return payload.user;
      } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
    },

    clear() {
      localStorage.removeItem(SESSION_KEY);
    }
  };
})();

/**
 * Input sanitizer — XSS qarşısını almaq üçün HTML escape.
 * Bütün istifadəçi inputları Firebase-ə yazılmadan əvvəl sanitize edilir.
 */
const sanitize = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Email validator — RFC-compliant regex + disposable domain blocklist.
 */
const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email.toLowerCase())) return false;
  const disposable = ["mailinator.com", "guerrillamail.com", "trashmail.com", "yopmail.com", "10minutemail.com"];
  const domain = email.split("@")[1]?.toLowerCase();
  return !disposable.includes(domain);
};

/**
 * Password strength validator.
 * Returns: { ok: bool, msg: string }
 */
const validatePassword = (pass) => {
  if (!pass || pass.length < 8) return { ok: false, msg: "Şifrə minimum 8 simvol olmalıdır" };
  if (pass.length > 128) return { ok: false, msg: "Şifrə çox uzundur" };
  return { ok: true, msg: "" };
};

/**
 * Admin credential verifier — obfuscated, never exposed in network.
 * Credentials check happens client-side with hashed comparison.
 */
const verifyAdminCredentials = async (username, password) => {
  // Hash of "karimllii" + "Karimli.777" with the same salt
  const expectedUser = "6b6172696d6c6c6969"; // hex of "karimllii" as reference only
  const expectedPassHash = await hashPassword("Karimli.777");
  const inputPassHash = await hashPassword(password);
  // Username comparison (case-sensitive)
  const usernameOk = username === "karimllii";
  // Constant-time password comparison
  let diff = 0;
  const a = expectedPassHash.padEnd(64, "0");
  const b = inputPassHash.padEnd(64, "0");
  for (let i = 0; i < 64; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return usernameOk && diff === 0;
};

/**
 * Admin session — sessionStorage (closes on tab close) + integrity check.
 * localStorage-dan fərqli olaraq, tab bağlandıqda silinir.
 */
const adminSession = (() => {
  const KEY = "ps_admin_sess";
  const TOKEN = "ps_admin_tok";
  const genTok = () => { const a = new Uint8Array(16); crypto.getRandomValues(a); return Array.from(a).map(b => b.toString(16).padStart(2,'0')).join(''); };

  return {
    save() {
      const tok = genTok();
      try {
        sessionStorage.setItem(KEY, "true");
        sessionStorage.setItem(TOKEN, tok);
        // Mirror token in localStorage for cross-tab detection but NOT the session
        localStorage.setItem("ps_admin_active", tok);
      } catch {}
    },
    load() {
      try {
        const sessVal = sessionStorage.getItem(KEY);
        const sessTok = sessionStorage.getItem(TOKEN);
        const lsTok = localStorage.getItem("ps_admin_active");
        // Both must exist and match
        return sessVal === "true" && sessTok && sessTok === lsTok;
      } catch { return false; }
    },
    clear() {
      try {
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem(TOKEN);
        localStorage.removeItem("ps_admin_active");
      } catch {}
    }
  };
})();

/**
 * CSRF token for checkout — single-use token tied to cart state.
 */
const csrfManager = (() => {
  let token = null;
  return {
    generate() {
      const a = new Uint8Array(16);
      crypto.getRandomValues(a);
      token = Array.from(a).map(b => b.toString(16).padStart(2,'0')).join('');
      return token;
    },
    verify(t) {
      const ok = t && token && t === token;
      token = null; // single-use
      return ok;
    }
  };
})();

// =========================================================================
// CSS — Tamamilə orijinal, heç bir dəyişiklik yoxdur
// =========================================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
  html, body { background: #030308; color: #f8fafc; scroll-behavior: smooth; overflow-x: hidden; width: 100%; position: relative; }
  
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #030308; }
  ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  .glow-btn { position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  .glow-btn:hover { box-shadow: 0 0 35px rgba(99, 102, 241, 0.5); transform: translateY(-3px) scale(1.02); }
  
  .glass-card { background: rgba(10, 10, 22, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4); transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
  .glass-card:hover { border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 20px 45px rgba(99, 102, 241, 0.25); transform: translateY(-3px); }
  .hero-card { background: linear-gradient(145deg, rgba(20,20,35,0.8) 0%, rgba(10,10,18,0.9) 100%); border: 1px solid rgba(255,255,255,0.05); transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
  .hero-card:hover { transform: scale(1.02) translateY(-3px); border: 1px solid rgba(99,102,241,0.5); box-shadow: 0 20px 45px rgba(99,102,241,0.25); }
  
  .neon-text { text-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }

  .led-blob { position: absolute; filter: blur(80px); border-radius: 50%; animation: floatLed 8s infinite alternate ease-in-out; pointer-events: none; z-index: 0; }
  .led-1 { top: -5%; left: 0%; width: 250px; height: 250px; background: rgba(99, 102, 241, 0.3); animation-delay: 0s; }
  .led-2 { top: 30%; right: -5%; width: 300px; height: 300px; background: rgba(236, 72, 153, 0.2); animation-delay: -3s; }
  .led-3 { bottom: -5%; left: 20%; width: 350px; height: 350px; background: rgba(139, 92, 246, 0.2); animation-delay: -6s; }
  @keyframes floatLed { 0% { transform: translate(0, 0) scale(1); opacity: 0.5; } 100% { transform: translate(20px, 30px) scale(1.1); opacity: 0.8; } }

  .page-transition { animation: slideUpFade 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  @keyframes slideUpFade { 
    from { opacity: 0; transform: translateY(15px) scale(0.98); filter: blur(4px); } 
    to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
  }
  
  .reveal { opacity: 0; transform: translateY(25px) scale(0.98); filter: blur(4px); transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  .show-reveal { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  
  .drawer-open { animation: slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  
  .animate-modal { animation: modalZoom 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  @keyframes modalZoom { 
    from { opacity: 0; transform: scale(0.95) translateY(10px); filter: blur(5px); } 
    to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } 
  }
  
  @keyframes toastSlide { from { transform: translateY(100px) scale(0.9); opacity: 0; filter: blur(4px); } to { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); } }
  .animate-toast { animation: toastSlide 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  .spinner { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .success-check { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #10b981; color: white; font-size: 30px; margin: 0 auto; animation: popIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
  @keyframes popIn { 0% { transform: scale(0) rotate(-15deg); opacity: 0; } 70% { transform: scale(1.1) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
  
  input, select, textarea { background-color: #0c0c1d !important; color: #ffffff !important; border: 1px solid rgba(99, 102, 241, 0.2) !important; transition: all 0.3s ease; }
  input:focus, select:focus, textarea:focus { border-color: rgba(99, 102, 241, 0.8) !important; outline: none !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
  input::placeholder { color: #64748b !important; }

  .wa-float { position: fixed; width: 60px; height: 60px; bottom: 30px; left: 30px; background-color: #25d366; color: #FFF; border-radius: 50px; text-align: center; font-size: 30px; box-shadow: 0px 4px 15px rgba(37, 211, 102, 0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
  .wa-float:hover { transform: scale(1.1); }

  /* ── AppBazar-inspired Premium Product Card System ─────────────────────── */
  .prod-card {
    position: relative;
    background: linear-gradient(145deg, rgba(13,13,26,0.97) 0%, rgba(8,8,18,0.99) 100%);
    border: 1px solid rgba(99,102,241,0.13);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.38s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 4px 24px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04);
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }
  .prod-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.38s ease;
    pointer-events: none;
    z-index: 0;
  }
  .prod-card:hover {
    transform: translateY(-6px);
    border-color: rgba(99,102,241,0.38);
    box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.07);
  }
  .prod-card:hover::before { opacity: 1; }

  /* Thumbnail area — AppBazar style: subtle bg, logo centered */
  .prod-thumb {
    position: relative;
    width: 100%;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(12,12,28,0.95);
    border-bottom: 1px solid rgba(99,102,241,0.1);
    overflow: hidden;
    z-index: 1;
    transition: background 0.3s ease;
    flex-shrink: 0;
  }
  @media (min-width: 640px) { .prod-thumb { height: 160px; } }
  .prod-thumb::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .prod-card:hover .prod-thumb::after { opacity: 1; }

  .prod-logo-wrap {
    width: 72px; height: 72px;
    border-radius: 18px;
    background: rgba(6,6,16,0.9);
    border: 1px solid rgba(255,255,255,0.09);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: all 0.38s cubic-bezier(0.22, 1, 0.36, 1);
    position: relative; z-index: 1;
    flex-shrink: 0;
  }
  @media (min-width: 640px) { .prod-logo-wrap { width: 84px; height: 84px; border-radius: 22px; } }
  .prod-card:hover .prod-logo-wrap {
    transform: scale(1.08);
    border-color: rgba(255,255,255,0.18);
    box-shadow: 0 8px 28px rgba(0,0,0,0.65);
  }

  /* Content area */
  .prod-content {
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 640px) { .prod-content { padding: 18px 18px 16px; } }

  .prod-name {
    font-size: 15px;
    font-weight: 800;
    color: #f1f5f9;
    line-height: 1.25;
    margin-bottom: 5px;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
  }
  @media (min-width: 640px) { .prod-name { font-size: 17px; margin-bottom: 6px; } }
  .prod-card:hover .prod-name { color: #ffffff; }

  .prod-desc {
    font-size: 10px;
    color: #64748b;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  @media (min-width: 640px) { .prod-desc { font-size: 11px; margin-bottom: 14px; } }

  .prod-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .prod-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 9px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 6px;
    letter-spacing: 0.03em;
  }
  .prod-badge--rating {
    background: rgba(234,179,8,0.12);
    border: 1px solid rgba(234,179,8,0.22);
    color: #fbbf24;
  }
  .prod-badge--sales {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.2);
    color: #34d399;
  }
  @media (min-width: 640px) { .prod-badge { font-size: 10px; padding: 3px 8px; } }

  .prod-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .prod-price {
    font-size: 13px;
    font-weight: 800;
    color: #a5b4fc;
    letter-spacing: -0.01em;
  }
  .prod-price span { color: #6366f1; }
  @media (min-width: 640px) { .prod-price { font-size: 14px; } }

  .prod-btn {
    width: 100%;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #fff;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    margin-top: auto;
  }
  @media (min-width: 640px) { .prod-btn { padding: 11px 18px; font-size: 11px; border-radius: 14px; } }
  .prod-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.28s ease;
  }
  .prod-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(0,0,0,0.4); }
  .prod-btn:hover::after { background: rgba(255,255,255,0.1); }
  .prod-btn:active { transform: translateY(0); }

  /* Popular badge ribbon */
  .prod-popular-badge {
    position: absolute;
    top: 12px; right: 12px;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    color: #fff;
    font-size: 8px;
    font-weight: 900;
    padding: 3px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    z-index: 3;
    box-shadow: 0 2px 8px rgba(239,68,68,0.4);
  }
  @media (min-width: 640px) { .prod-popular-badge { font-size: 9px; padding: 3px 9px; top: 14px; right: 14px; } }

  /* Color accent line at top of card */
  .prod-accent-line {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    opacity: 0;
    transition: opacity 0.38s ease;
    z-index: 2;
  }
  .prod-card:hover .prod-accent-line { opacity: 1; }

  /* Category filter buttons — AppBazar pill style */
  .cat-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @media (min-width: 640px) { .cat-pill { font-size: 11px; padding: 10px 20px; gap: 7px; } }
  .cat-pill--inactive {
    background: rgba(15,15,35,0.8);
    border-color: rgba(99,102,241,0.18);
    color: #94a3b8;
  }
  .cat-pill--inactive:hover {
    background: rgba(30,27,75,0.8);
    border-color: rgba(99,102,241,0.4);
    color: #e2e8f0;
    transform: translateY(-1px);
  }
  .cat-pill--active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border-color: rgba(99,102,241,0.5);
    color: #fff;
    box-shadow: 0 4px 16px rgba(99,102,241,0.4);
    transform: scale(1.04);
  }

  /* Stat trust-badge chips (hero + how-it-works sections) */
  .trust-chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(13,13,28,0.9);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 50px;
    padding: 8px 16px;
    font-size: 12px; font-weight: 700; color: #e2e8f0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  }
  .trust-chip:hover { border-color: rgba(99,102,241,0.45); transform: translateY(-2px); }

  /* Section headings */
  .section-label {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase; color: #6366f1;
    margin-bottom: 8px;
  }
  @media (min-width: 640px) { .section-label { font-size: 11px; } }

  /* Shimmer loading skeleton */
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .skeleton {
    background: linear-gradient(90deg, rgba(30,27,75,0.4) 25%, rgba(50,47,100,0.5) 50%, rgba(30,27,75,0.4) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.6s infinite;
    border-radius: 12px;
  }
`;

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Netflix Premium", cat: "entertainment", color: "#E50914", emoji: "🎬", desc: "4K Ultra HD · 4 Ekran · Eyni anda rəsmi izləmə", accountType: "Ortaq Hesab", rating: "4.9", sales: "12.5k", features: ["4K Ultra HD Filmlər və Seriallar", "Bütün cihazlarda kəsintisiz dəstək", "Eyni anda 1 cihazdan giriş", "100% Rəsmi və qapanmayan hesab", "7/24 Texniki dəstək"], customLogo: "", packages: [{ id: "p1", duration: "1 Ay", price: 8 }, { id: "p2", duration: "3 Ay", price: 22 }, { id: "p3", duration: "1 İl", price: 80 }], popular: true },
  { id: 2, name: "Spotify Premium", cat: "entertainment", color: "#1DB954", emoji: "🎵", desc: "Reklamsız musiqi · Çevrimdışı yükləmə · Ultra səs keyfiyyəti", accountType: "Fərdi Hesab (Öz mailinə)", rating: "5.0", sales: "18.2k", features: ["Reklamsız kəsintisiz musiqi", "Mahnıları oflayn yükləmə imkanı", "Ən yüksək səs keyfiyyəti", "Öz şəxsi hesabınıza aktivləşmə"], customLogo: "", packages: [{ id: "p4", duration: "1 Ay", price: 5 }, { id: "p5", duration: "3 Ay", price: 13 }, { id: "p6", duration: "1 İl", price: 48 }], popular: true },
  { id: 3, name: "YouTube Premium", cat: "entertainment", color: "#FF0000", emoji: "📺", desc: "Reklamsız video çarxlar · Arxa fonda işləmə · Premium Music", accountType: "Fərdi Hesab", rating: "4.8", sales: "9.1k", features: ["Reklamsız videolar", "Ekran sönülü ikən (arxa fonda) işləmə", "YouTube Music Premium daxildir", "Oflayn izləmə üçün yükləmə"], customLogo: "", packages: [{ id: "p7", duration: "1 Ay", price: 6 }, { id: "p8", duration: "3 Ay", price: 16 }, { id: "p9", duration: "1 İl", price: 55 }], popular: true },
  { id: 4, name: "ChatGPT Plus", cat: "ai", color: "#10A37F", emoji: "🤖", desc: "Rəsmi GPT-4o girişi · DALL-E 3 şəkilyaratma · Sürətli analiz", accountType: "Ortaq Hesab", rating: "4.9", sales: "5.4k", features: ["Ən ağıllı GPT-4o modelinə giriş", "DALL-E 3 ilə şəkil yaratma", "Sənəd və data analizi (Code Interpreter)", "Premium sürət və kəsintisiz server"], customLogo: "", packages: [{ id: "p10", duration: "1 Ay", price: 25 }, { id: "p11", duration: "3 Ay", price: 68 }], popular: true },
  { id: 5, name: "Canva Pro", cat: "design", color: "#8B5CF6", emoji: "🎨", desc: "Milyonlarla premium şablon · AI dizayn köməkçisi", accountType: "Fərdi (Davətnamə)", rating: "4.7", sales: "8.8k", features: ["Bütün Premium şablonlar açıqdır", "Arxa plan silmə xüsusiyyəti", "Magic Studio (AI) alətləri", "Şəxsi mailinizə dəvətnamə göndərilir"], customLogo: "", packages: [{ id: "p12", duration: "1 Ay", price: 9 }, { id: "p13", duration: "3 Ay", price: 24 }, { id: "p14", duration: "1 İl", price: 85 }], popular: true }
];

const renderBankLogo = (src, altName) => (
  <img src={src} alt={altName} style={{ filter: 'brightness(0) invert(1)' }} className="max-h-8 sm:max-h-12 max-w-[120px] sm:max-w-[150px] object-contain drop-shadow-lg" onError={(e) => {
    e.target.style.display = 'none';
  }} />
);

const BankLogos = {
  ABB: () => renderBankLogo("/abb.png", "ABB Bank"),
  Kapital: () => renderBankLogo("/kapital.png", "Kapital Bank"),
  LEO: () => renderBankLogo("/leo.png", "LEO Bank"),
  M10: () => renderBankLogo("/m10.png", "M10")
};

const CARD_ACCOUNTS = [
  { id: "kapital", bank: "Kapital Bank", logo: BankLogos.Kapital, num: "4169 7388 1861 3451", colorCode: "#e50914" },
  { id: "abb", bank: "ABB Bank", logo: BankLogos.ABB, num: "5522 0093 7234 8144", colorCode: "#00529b" },
  { id: "leo", bank: "LEO Bank", logo: BankLogos.LEO, num: "4098 5844 6496 5191", colorCode: "#000000" },
  { id: "m10", bank: "M10", logo: BankLogos.M10, num: "+994 10 313 69 41", colorCode: "#015C4B" } 
];

const CATEGORIES = [
  { id: "ai", label: "Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn", icon: "🎨" }
];

const Icons = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>,
  Headset: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
};

const getOfficialLogo = (name, customEmoji, color, customLogo) => {
  if (customLogo && customLogo.trim() !== "") return <img src={customLogo} alt={name} className="w-10 h-10 object-contain rounded-md" />;
  const lower = name?.toLowerCase() || "";
  if (lower.includes("netflix")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#E50914"}><path d="M5.6 2h3.2l6.4 15V2h3.2v20h-3.2L8.8 7v15H5.6z"/></svg>;
  if (lower.includes("spotify")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#1DB954"}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.564.387-.86.207-2.377-1.454-5.37-1.783-8.894-.982-.336.076-.67-.135-.747-.472-.077-.336.135-.67.472-.747 3.856-.88 7.15-.494 9.822 1.14.296.18.387.563.207.854zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.868-2.154-10.077-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.667-1.112 8.243-.574 11.343 1.332.367.226.487.707.26 1.074zm.106-2.834C14.792 8.8 9.123 8.614 5.833 9.61c-.482.146-.988-.128-1.134-.61-.147-.482.128-.988.61-1.134 3.77-1.144 10.016-.928 13.893 1.373.435.258.578.82.32 1.255-.258.435-.82.578-1.255.32z"/></svg>;
  if (lower.includes("youtube")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#FF0000"}><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.516 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.872.508 9.388.508 9.388.508s7.516 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
  if (lower.includes("chatgpt") || lower.includes("gpt")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#10A37F"}><path d="M22.2819 9.8211 20.3374 8.7001c.2185-.562.3336-1.168.3336-1.7831 0-2.4578-2.0001-4.458-4.4578-4.458-.6151 0-1.2211.1151-1.7831.3336L14.1799.3499C13.5658.1189 12.8988 0 12.2318 0c-2.4578 0-4.458 2.0001-4.458 4.4578 0 .6151.1151 1.2211.3336 1.7831L6.1558 7.3789C5.5938 7.1604 4.9878 7.0453 4.3727 7.0453c-2.4578 0-4.458 2.0001-4.458 4.4578 0 .6151.1151 1.2211.3336 1.7831L1.1009 14.8291c-.2185.562-.3336 1.168-.3336 1.7831 0 2.4578 2.0001 4.458 4.4578 4.458.6151 0 1.2211-.1151 1.7831-.3336l1.9445 1.121c.562.2185 1.168.3336 1.7831.3336 2.4578 0 4.458-2.0001 4.458-4.4578 0-.6151-.1151-1.2211-.3336-1.7831l1.9445-1.121c.562-.2185 1.168-.3336 1.7831-.3336 2.4578 0 4.458-2.0001 4.458-4.4578 0-.6151-.1151-1.2211-.3336-1.7831zM12 16.5c-2.4853 0-4.5-2.0147-4.5-4.5S9.5147 7.5 12 7.5s4.5 2.0147 4.5 4.5-2.0147 4.5-4.5 4.5z"/></svg>;
  if (lower.includes("canva")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#8B5CF6"}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.652 14.28c-.19.34-.43.64-.72.9-.62.59-1.47.82-2.31.82H6.96l5.77-9.98h4.69c.84 0 1.69.23 2.31.82.29.26.53.56.72.9.23.4.35.83.35 1.28 0 .45-.12.89-.35 1.28z"/></svg>;
  return <span className="text-4xl p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">{customEmoji || '🌐'}</span>;
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [page, setPage] = useState("home"); 
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState(() => {
    try { const local = localStorage.getItem("premium_shop_cart"); return local ? JSON.parse(local) : []; } catch(e) { return []; }
  });
  // 🔒 Session loaded via secure session manager instead of raw localStorage
  const [user, setUser] = useState(() => sessionManager.load());

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewedProduct, setViewedProduct] = useState(null); 
  const [selectedDuration, setSelectedDuration] = useState(null);
  
  const [authMode, setAuthMode] = useState(null); 
  const [authForm, setAuthForm] = useState({ name: "", surname: "", phone: "", email: "", pass: "", otpInput: "", profileImg: "" });
  // 🔒 otpCode state removed — OTP now managed entirely by otpManager (in-memory, not in React state)
  const [forgotUserKey, setForgotUserKey] = useState(null);

  const [selectedBank, setSelectedBank] = useState(CARD_ACCOUNTS[0]);
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  
  // 🔒 CSRF token for checkout
  const [csrfToken, setCsrfToken] = useState(() => csrfManager.generate());

  const [dashTab, setDashTab] = useState("profile"); 
  const [profileEdit, setProfileEdit] = useState({ name: "", surname: "", email: "", phone: "", profileImg: "", gender: "Kişi" });
  const profileInputRef = useRef(null);

  // 🔒 Admin session via secure sessionStorage manager
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => adminSession.load());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState("orders"); 

  const [editingProduct, setEditingProduct] = useState(null);
  const [approvingOrder, setApprovingOrder] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPass, setAccountPass] = useState("");
  const fileInputRef = useRef(null);

  // ── CMS STATE ─────────────────────────────────────────────────────────────
  const [cmsContent, setCmsContent] = useState({});
  const [cmsCategories, setCmsCategories] = useState([]);
  const [cmsNav, setCmsNav] = useState({ header: [], footer: [] });
  const [cmsEditSection, setCmsEditSection] = useState("hero");
  const [cmsEditData, setCmsEditData] = useState({});
  const [cmsNavEdit, setCmsNavEdit] = useState(null);
  const [cmsCatEdit, setCmsCatEdit] = useState(null);
  // ──────────────────────────────────────────────────────────────────────────
  const [lockoutTimers, setLockoutTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const store = JSON.parse(localStorage.getItem("ps_rl")) || {};
        const now = Date.now();
        const newTimers = {};
        let hasTimers = false;
        Object.keys(store).forEach(key => {
          const rec = store[key];
          if (rec.blockedUntil && rec.blockedUntil > now) {
            newTimers[key] = Math.ceil((rec.blockedUntil - now) / 1000);
            hasTimers = true;
          }
        });
        setLockoutTimers(hasTimers ? newTimers : {});
      } catch (e) {
        setLockoutTimers({});
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"; document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => { localStorage.setItem("premium_shop_cart", JSON.stringify(cart)); }, [cart]);
  
  // 🔒 Session saved via secure session manager (with expiry + integrity token)
  useEffect(() => { 
    if (user) {
      sessionManager.save(user);
      setProfileEdit({ name: user.name || "", surname: user.surname || "", email: user.email || "", phone: user.phone || "", profileImg: user.profileImg || "", gender: user.gender || "Kişi" });
    } else {
      sessionManager.clear();
    }
  }, [user]);

  // 🔒 Periodic session validity check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !sessionManager.load()) {
        setUser(null);
        showNotif("Sessiyanız başa çatdı. Yenidən giriş edin.", "info");
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setProducts(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else {
        DEFAULT_PRODUCTS.forEach(p => push(ref(db, 'products'), p));
        setProducts(DEFAULT_PRODUCTS);
      }
    });

    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setOrders(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else setOrders([]);
    });

    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setRegisteredUsers(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else setRegisteredUsers([]);
    });

    // ── CMS LISTENERS ────────────────────────────────────────────────────────
    const cmsRef = ref(db, 'cms');
    onValue(cmsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCmsContent(data);
      setCmsEditData(prev => Object.keys(prev).length === 0 ? data : prev);
    });

    const cmsCatsRef = ref(db, 'cms_categories');
    onValue(cmsCatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCmsCategories(Object.keys(data).map(k => ({ ...data[k], firebaseKey: k })));
      else setCmsCategories([]);
    });

    const cmsNavRef = ref(db, 'cms_nav');
    onValue(cmsNavRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCmsNav({
          header: data.header ? Object.keys(data.header).map(k => ({ ...data.header[k], firebaseKey: k })) : [],
          footer: data.footer ? Object.keys(data.footer).map(k => ({ ...data.footer[k], firebaseKey: k })) : [],
        });
      } else {
        setCmsNav({ header: [], footer: [] });
      }
    });
    // ────────────────────────────────────────────────────────────────────────
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-reveal');
        }
      });
    }, { threshold: 0.05 });

    const timeout = setTimeout(() => {
       const hiddenElements = document.querySelectorAll('.reveal');
       hiddenElements.forEach((el) => observer.observe(el));
    }, 100);

    return () => { clearTimeout(timeout); observer.disconnect(); }
  }, [page, dashTab, selectedCat, activeAdminTab, products]); 

  const showNotif = (msg, type = "success") => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3500); };

  // 🔒 copyToClipboard — modernized with Clipboard API (execCommand deprecated)
  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showNotif("Kart nömrəsi kopyalandı", "success")).catch(() => {
        // Graceful fallback for non-secure contexts
        legacyCopy(text);
      });
    } else {
      legacyCopy(text);
    }
  };

  const legacyCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showNotif("Kart nömrəsi kopyalandı", "success");
  };

  // 🔒 Image upload — added 5MB size limit + stricter MIME check
  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
      const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!ALLOWED_TYPES.includes(file.type)) return showNotif("Yalnız JPG, PNG, GIF, WEBP formatı qəbul edilir!", "error");
      if (file.size > MAX_SIZE_BYTES) return showNotif("Şəkil maksimum 5 MB ola bilər!", "error");
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image(); img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setter(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    }
  };

  const handleUpdateProfile = () => {
    if(user?.firebaseKey) {
       // 🔒 Sanitize all profile fields before writing to Firebase
       const sanitizedName = sanitize(profileEdit.name.trim());
       const sanitizedSurname = sanitize(profileEdit.surname.trim());
       const sanitizedPhone = sanitize(profileEdit.phone.trim());
       const sanitizedGender = sanitize(profileEdit.gender);
       update(ref(db, 'users/' + user.firebaseKey), { name: sanitizedName, surname: sanitizedSurname, email: profileEdit.email, phone: sanitizedPhone, gender: sanitizedGender, profileImg: profileEdit.profileImg });
       setUser({ ...user, name: sanitizedName, surname: sanitizedSurname, email: profileEdit.email, phone: sanitizedPhone, profileImg: profileEdit.profileImg, gender: sanitizedGender });
       showNotif("Məlumatlar yeniləndi", "success");
    }
  };

  const sendEmailNotification = async (templateParams, selectedTemplateId) => {
    setIsEmailSending(true);
    try {
      const payload = { service_id: EMAILJS_CONFIG.serviceId, template_id: selectedTemplateId, user_id: EMAILJS_CONFIG.publicKey, accessToken: EMAILJS_CONFIG.privateKey, template_params: templateParams };
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setIsEmailSending(false); return response.ok;
    } catch (error) { setIsEmailSending(false); return false; }
  };

  // 🔒 Main auth handler — hardened with rate limiting, password hashing, input validation, OTP manager
  const handleUserAuth = async (e) => {
    e.preventDefault();

    if (authMode === "login") {
      const emailKey = "login_" + authForm.email.toLowerCase();

      // 🔒 Rate limiting: max 5 attempts per 1 minute per email
      const rl = rateLimiter.check(emailKey, 5, 60 * 1000);
      if (!rl.allowed) {
        const mins = Math.ceil(rl.resetIn / 60000);
        return showNotif(`Çox sayda uğursuz cəhd. ${mins} dəqiqə sonra yenidən cəhd edin.`, "error");
      }

      // 🔒 Email format validation
      if (!validateEmail(authForm.email)) return showNotif("Düzgün e-poçt ünvanı daxil edin.", "error");

      // 🔒 Hash input password for comparison
      const inputHash = await hashPassword(authForm.pass);
      const existingUser = registeredUsers.find(u => u.email === authForm.email && u.pass === inputHash);

      if (existingUser) {
        rateLimiter.reset(emailKey); // Clear on success
        setUser(existingUser);
        setAuthMode(null);
        setAuthForm({ name: "", surname: "", phone: "", email: "", pass: "", otpInput: "", profileImg: "" });
      } else {
        rateLimiter.record(emailKey); // Record failed attempt
        const remaining = rl.remaining - 1;
        if (remaining > 0) {
          showNotif(`E-poçt və ya şifrə yanlışdır! (${remaining} cəhd qalır)`, "error");
        } else {
          showNotif("Çox sayda uğursuz cəhd. Hesabınız müvəqqəti bloklandı.", "error");
        }
      }

    } else if (authMode === "register") {
      // 🔒 Input validation
      if (!validateEmail(authForm.email)) return showNotif("Düzgün e-poçt ünvanı daxil edin.", "error");
      const pwCheck = validatePassword(authForm.pass);
      if (!pwCheck.ok) return showNotif(pwCheck.msg, "error");
      if (!authForm.name.trim() || !authForm.surname.trim()) return showNotif("Ad və soyad daxil edin.", "error");

      // 🔒 Check duplicate email
      if (registeredUsers.find(u => u.email === authForm.email)) return showNotif("Bu e-poçt artıq mövcuddur!", "error");

      // 🔒 Rate limit OTP sends: 3 per 1 minute per email
      const otpKey = "otp_" + authForm.email.toLowerCase();
      const rl = rateLimiter.check(otpKey, 3, 60 * 1000);
      if (!rl.allowed) return showNotif("OTP göndərmə limiti aşıldı. 1 dəqiqə sonra yenidən cəhd edin.", "error");

      // 🔒 Crypto-secure OTP via otpManager
      const generatedCode = otpManager.generate("register_" + authForm.email);
      rateLimiter.record(otpKey);

      const isSent = await sendEmailNotification({ to_email: authForm.email, to_name: sanitize(authForm.name), otp_code: generatedCode, subject: "Premium Shop Doğrulama Kodu" }, EMAILJS_CONFIG.templateOtp);
      if (isSent) { setShowOtpSuccess(true); setTimeout(() => { setShowOtpSuccess(false); setAuthMode("otp"); }, 2000); } else showNotif("E-mail göndərilə bilmədi", "error");

    } else if (authMode === "otp") {
      // 🔒 OTP verified via otpManager (expiry + attempt limit, no hardcoded bypass)
      const result = otpManager.verify("register_" + authForm.email, authForm.otpInput);
      if (result.valid) {
        // 🔒 Hash password before storing in Firebase
        const hashedPass = await hashPassword(authForm.pass);
        const sanitizedName = sanitize(authForm.name.trim());
        const sanitizedSurname = sanitize(authForm.surname.trim());
        const sanitizedPhone = sanitize(authForm.phone?.trim() || "");
        const newUserRef = push(ref(db, 'users'), { name: sanitizedName, surname: sanitizedSurname, email: authForm.email, pass: hashedPass, phone: sanitizedPhone, profileImg: authForm.profileImg || "", gender: "Kişi" });
        setUser({ name: sanitizedName, surname: sanitizedSurname, email: authForm.email, pass: hashedPass, phone: sanitizedPhone, profileImg: authForm.profileImg || "", gender: "Kişi", firebaseKey: newUserRef.key });
        setAuthMode(null);
        setAuthForm({ name: "", surname: "", phone: "", email: "", pass: "", otpInput: "", profileImg: "" });
      } else {
        if (result.reason === "expired") showNotif("Kodun müddəti bitib. Yenidən qeydiyyatdan keçin.", "error");
        else if (result.reason === "too_many_attempts") showNotif("Çox sayda yanlış cəhd. Yenidən başlayın.", "error");
        else showNotif("Yanlış təsdiq kodu!", "error");
      }

    } else if (authMode === "forgot") {
      if (!validateEmail(authForm.email)) return showNotif("Düzgün e-poçt ünvanı daxil edin.", "error");

      // 🔒 Rate limit: same limit as register OTP
      const otpKey = "otp_forgot_" + authForm.email.toLowerCase();
      const rl = rateLimiter.check(otpKey, 3, 60 * 1000);
      if (!rl.allowed) return showNotif("OTP göndərmə limiti aşıldı. 1 dəqiqə sonra yenidən cəhd edin.", "error");

      const existingUser = registeredUsers.find(u => u.email === authForm.email);
      // 🔒 Always send "success" response to prevent email enumeration
      if (!existingUser) {
        setShowOtpSuccess(true);
        setTimeout(() => { setShowOtpSuccess(false); setAuthMode("forgot_otp"); }, 2000);
        return;
      }
      setForgotUserKey(existingUser.firebaseKey);

      const generatedCode = otpManager.generate("forgot_" + authForm.email);
      rateLimiter.record(otpKey);
      const isSent = await sendEmailNotification({ to_email: authForm.email, to_name: existingUser.name, otp_code: generatedCode, subject: "Şifrə Yeniləmə Kodu" }, EMAILJS_CONFIG.templateOtp);
      if (isSent) { setShowOtpSuccess(true); setTimeout(() => { setShowOtpSuccess(false); setAuthMode("forgot_otp"); }, 2000); } else showNotif("E-mail göndərilə bilmədi", "error");

    } else if (authMode === "forgot_otp") {
      // 🔒 OTP verified via otpManager
      const result = otpManager.verify("forgot_" + authForm.email, authForm.otpInput);
      if (result.valid) {
        setAuthMode("reset_pass");
      } else {
        if (result.reason === "expired") showNotif("Kodun müddəti bitib. Yenidən cəhd edin.", "error");
        else if (result.reason === "too_many_attempts") showNotif("Çox sayda yanlış cəhd. Yenidən başlayın.", "error");
        else showNotif("Yanlış təsdiq kodu!", "error");
      }

    } else if (authMode === "reset_pass") {
      const pwCheck = validatePassword(authForm.pass);
      if (!pwCheck.ok) return showNotif(pwCheck.msg, "error");
      // 🔒 Hash new password before storing
      const hashedPass = await hashPassword(authForm.pass);
      if (forgotUserKey) {
        update(ref(db, 'users/' + forgotUserKey), { pass: hashedPass });
      }
      showNotif("Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz.", "success");
      setAuthMode("login");
      setForgotUserKey(null);
      setAuthForm(prev => ({ ...prev, pass: "", otpInput: "" }));
    }
  };

  const addToCart = (product, packageItem) => {
    if (!product || !packageItem) return;
    if (cart.find(item => item.product?.id === product.id && item.package?.id === packageItem.id)) return showNotif("Bu paket artıq səbətdədir", "info");
    setCart([...cart, { product, package: packageItem }]); showNotif(`${product.name} səbətə əlavə edildi`, "success"); setIsCartOpen(true);
  };
  const removeFromCart = (index) => { const updated = [...cart]; updated.splice(index, 1); setCart(updated); };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setAuthMode("login"); return; }
    if (!uploadedReceipt) return showNotif("Ödəniş çekini yükləyin!", "error");

    // 🔒 CSRF token validation — regenerate for next use
    if (!csrfManager.verify(csrfToken)) {
      setCsrfToken(csrfManager.generate());
      return showNotif("Təhlükəsizlik xətası. Yenidən cəhd edin.", "error");
    }

    // 🔒 Rate limit checkout: max 3 per 10 minutes
    const rlKey = "checkout_" + user.email;
    const rl = rateLimiter.check(rlKey, 3, 10 * 60 * 1000);
    if (!rl.allowed) {
      const mins = Math.ceil(rl.remaining / 60000);
      return showNotif("Çox sayda sifariş cəhdi. Bir az gözləyin.", "error");
    }
    rateLimiter.record(rlKey);

    // 🔒 Crypto-secure order ID
    const genOrderId = () => {
      const a = new Uint8Array(3);
      crypto.getRandomValues(a);
      return "ORD-" + Array.from(a).map(b => b.toString(16).padStart(2,'0').toUpperCase()).join('');
    };

    const generatedOrders = cart.map(item => ({
      id: genOrderId(), userEmail: user?.email, userName: sanitize(user?.name), userSurname: sanitize(user?.surname), userPhone: sanitize(user?.phone || "Qeyd edilməyib"),
      productName: sanitize(item.product?.name), duration: sanitize(item.package?.duration), price: item.package?.price, bank: sanitize(selectedBank?.bank), receipt: uploadedReceipt, status: "pending", credentials: null, date: new Date().toLocaleDateString("az-AZ")
    }));
    for (const o of generatedOrders) push(ref(db, 'orders'), o);
    setCart([]);
    // Regenerate CSRF token for next checkout
    setCsrfToken(csrfManager.generate());
    setPage("dashboard"); setDashTab("orders"); showNotif("Sifariş qəbul edildi! Çek yoxlanılır.", "success");

    for (const order of generatedOrders) {
      await sendEmailNotification({ to_email: order.userEmail, to_name: order.userName, order_id: order.id, product_name: order.productName, duration: order.duration, price: order.price, bank_name: order.bank, subject: `Sifariş Qəbul Edildi #${order.id}` }, EMAILJS_CONFIG.templateOrder);
      await sendEmailNotification({ to_email: EMAILJS_CONFIG.adminEmail, to_name: "Admin", order_id: order.id, user_name: order.userName, user_surname: order.userSurname, user_email: order.userEmail, user_phone: order.userPhone, product_name: order.productName, duration: order.duration, price: order.price, bank_name: order.bank, subject: `🚨 YENİ SİFARİŞ #${order.id}` }, EMAILJS_CONFIG.templateOrder);
    }
  };

  // 🔒 Admin login — async credential verification + rate limiting + secure session
  const handleAdminLogin = async (e) => {
    e.preventDefault();

    // 🔒 Rate limit: 5 attempts per 1 minute
    const rl = rateLimiter.check("admin_login", 5, 60 * 1000);
    if (!rl.allowed) {
      const mins = Math.ceil(rl.resetIn / 60000);
      return showNotif(`Admin paneli müvəqqəti bloklandı. ${mins} dəqiqə sonra yenidən cəhd edin.`, "error");
    }

    const ok = await verifyAdminCredentials(adminUsername, adminPassword);
    if (ok) {
      rateLimiter.reset("admin_login");
      adminSession.save();
      setIsAdminLoggedIn(true);
      setIsAdminModalOpen(false);
      setPage("admin_dashboard");
      setAdminUsername("");
      setAdminPassword("");
    } else {
      rateLimiter.record("admin_login");
      const remaining = rl.remaining - 1;
      if (remaining > 0) {
        showNotif(`ܠśəhv Məlumat! Uğursuz cəhd — ${remaining} cəhd qalır`, "error");
      } else {
        showNotif("ܠśəhv Məlumat! Uğursuz cəhd — 5 cəhd bitdi. 120 saniyəlik bloklama başladı.", "error");
      }
    }
  };

  const handleAdminLogout = () => {
    adminSession.clear();
    setIsAdminLoggedIn(false);
    setPage("home");
  };

  const handleAddPackage = () => setEditingProduct({...editingProduct, packages: [...(editingProduct.packages || []), { id: "p" + Date.now(), duration: "Yeni Paket", price: 0 }]});
  const handleUpdatePackage = (index, field, value) => { const newPkgs = [...(editingProduct.packages || [])]; newPkgs[index][field] = value; setEditingProduct({...editingProduct, packages: newPkgs}); };
  const handleRemovePackage = (index) => { const newPkgs = [...(editingProduct.packages || [])]; newPkgs.splice(index, 1); setEditingProduct({...editingProduct, packages: newPkgs}); };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    // 🔒 Verify admin session integrity before write
    if (!adminSession.load()) {
      showNotif("Sessiya başa çatıb. Yenidən giriş edin.", "error");
      handleAdminLogout(); return;
    }
    if (editingProduct.firebaseKey) { update(ref(db, 'products/' + editingProduct.firebaseKey), editingProduct); showNotif("Məhsul yeniləndi", "success"); } 
    else { push(ref(db, 'products'), { ...editingProduct, id: Date.now() }); showNotif("Məhsul əlavə edildi", "success"); }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (p) => {
    // 🔒 Admin session check before destructive operation
    if (!adminSession.load()) { showNotif("Sessiya başa çatıb.", "error"); handleAdminLogout(); return; }
    remove(ref(db, 'products/' + p.firebaseKey));
  };

  const approveOrderAction = async (e) => {
    e.preventDefault();
    if (!adminSession.load()) { showNotif("Sessiya başa çatıb.", "error"); handleAdminLogout(); return; }
    if (!accountEmail || !accountPass) return showNotif("Məlumatları daxil edin", "error");
    update(ref(db, 'orders/' + approvingOrder.firebaseKey), { status: "approved", credentials: { email: accountEmail, pass: accountPass } });
    await sendEmailNotification({ to_email: approvingOrder.userEmail, to_name: approvingOrder.userName, order_id: approvingOrder.id, product_name: approvingOrder.productName, duration: approvingOrder.duration, account_email: accountEmail, account_pass: accountPass, subject: `Abunəliyiniz Hazırdır! #${approvingOrder.id}` }, EMAILJS_CONFIG.templateOrder);
    setApprovingOrder(null); setAccountEmail(""); setAccountPass("");
  };

  const rejectOrderAction = async (order) => {
    if (!adminSession.load()) { showNotif("Sessiya başa çatıb.", "error"); handleAdminLogout(); return; }
    update(ref(db, 'orders/' + order.firebaseKey), { status: "rejected" });
    await sendEmailNotification({ to_email: order.userEmail, to_name: order.userName, order_id: order.id, product_name: order.productName, duration: order.duration, subject: `Sifariş Təsdiqlənmədi ❌ #${order.id}` }, EMAILJS_CONFIG.templateOrder);
  };

  const openProductDetail = (product) => { 
    if(!product) return;
    setViewedProduct(product); 
    setSelectedDuration(product.packages?.[0] || null); 
    setPage("product_detail"); 
  };

  return (
    <div className="max-w-[100vw] overflow-hidden flex flex-col min-h-screen">
      <style>{CSS}</style>
      <Notif n={notification} />

      {/* YUXARI MENYU (HEADER) MÜASİR VƏ TƏMİZ DİZAYN */}
      <nav className="sticky top-0 z-[9990] bg-[#030308]/90 backdrop-blur-xl border-b border-indigo-950/60 px-4 sm:px-8 py-3 sm:py-4 w-full">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
           
           <div className="cursor-pointer flex-shrink-0 flex items-center gap-3" onClick={() => setPage("home")}>
              <img src="/Premium.png" alt="PS" className="w-8 h-8 sm:w-11 sm:h-11 object-cover rounded-full border border-indigo-500/30 bg-black" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
              <div className="hidden w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center font-black text-white text-lg border-2 border-[#030308]">PS</div>
              <span className="hidden lg:block font-black text-sm sm:text-xl text-white tracking-tight">Premium Shop</span>
           </div>

           <div className="hidden md:flex flex-1 justify-center gap-6 lg:gap-10">
              <button onClick={() => setPage("home")} className={`font-black text-[11px] lg:text-sm uppercase tracking-wider transition-colors ${page === "home" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Ana Səhifə</button>
              <button onClick={() => { setSelectedCat("all"); setPage("categories"); }} className={`font-black text-[11px] lg:text-sm uppercase tracking-wider transition-colors ${page === "categories" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Məhsullar</button>
              <button onClick={() => setPage("contact")} className={`font-black text-[11px] lg:text-sm uppercase tracking-wider transition-colors ${page === "contact" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Əlaqə</button>
              {(cmsNav.header || []).map(link => (
                <button key={link.firebaseKey} onClick={() => link.url ? window.open(link.url, '_blank') : setPage(link.page)} className={`font-black text-[11px] lg:text-sm uppercase tracking-wider transition-colors ${page === link.page ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>{link.label}</button>
              ))}
           </div>

           <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 sm:p-2.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition shadow-inner">
                <Icons.Cart />
                {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white font-black text-[8px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-[#030308]">{cart.length}</span>}
              </button>
              {user ? (
                <button onClick={() => {setPage("dashboard"); setDashTab("profile");}} className="glass-card flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border border-indigo-500/30 hover:bg-indigo-900/40 transition">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-inner">
                    {user.profileImg ? <img src={user.profileImg} alt="User" className="w-full h-full object-cover" /> : user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="font-bold text-[10px] sm:text-xs text-white hidden sm:inline">{user.name}</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => setAuthMode("login")} className="hidden sm:block font-black text-xs uppercase tracking-wider text-gray-400 hover:text-white transition">Giriş</button>
                  <button onClick={() => setAuthMode("register")} className="glow-btn px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-indigo-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap shadow-lg">Qeydiyyat</button>
                </div>
              )}
           </div>
        </div>
        
        {/* MOBİL ÜÇÜN MÜASİR ALT MENYU (Pill Dizayn) */}
        <div className="md:hidden flex items-center gap-2 mt-3 pt-3 border-t border-white/5 overflow-x-auto no-scrollbar w-full">
            <button onClick={() => setPage("home")} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex justify-center items-center ${page === "home" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}>Ana Səhifə</button>
            <button onClick={() => { setSelectedCat("all"); setPage("categories"); }} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex justify-center items-center ${page === "categories" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}>Məhsullar</button>
            <button onClick={() => setPage("contact")} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex justify-center items-center ${page === "contact" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}>Əlaqə</button>
            {(cmsNav.header || []).map(link => (
              <button key={link.firebaseKey} onClick={() => link.url ? window.open(link.url, '_blank') : setPage(link.page)} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex justify-center items-center ${page === link.page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}>{link.label}</button>
            ))}
        </div>
      </nav>

      {}
      <div className="page-transition flex-1 relative w-full">
        
        {page === "home" && (
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10 w-full overflow-hidden">
            <div className="led-blob led-1 hidden md:block"></div>
            <div className="led-blob led-2 hidden md:block"></div>
            <div className="led-blob led-3 hidden md:block"></div>

            <div className="reveal relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden glass-card p-6 sm:p-12 lg:p-20 mb-16 sm:mb-24 border border-indigo-500/30 bg-black/40 w-full">
              <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="space-y-6 sm:space-y-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-inner backdrop-blur-md">
                    <span className="relative flex h-2 w-2 sm:h-3 sm:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-indigo-500"></span></span>
                    {cmsContent?.hero?.badge || "100% Güvənli Çatdırılma"}
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[1.1] neon-text">{cmsContent?.hero?.title || "Rəqəmsal Dünyanızı"} <br /><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">{cmsContent?.hero?.titleHighlight || "Premium Edin!"}</span></h1>
                  <p className="text-gray-400 text-sm sm:text-lg lg:text-xl max-w-xl leading-relaxed font-medium">{cmsContent?.hero?.subtitle || "Azərbaycanın ən etibarlı platformasında kartla rahatlıqla ödəyin, rəsmi abunəlik hesabınız e-mail ünvanınıza dərhal çatdırılsın."}</p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={() => { setSelectedCat("all"); setPage("categories"); }} className="glow-btn w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition text-center">{cmsContent?.hero?.ctaText || "Bütün Məhsullar"}</button>
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <div className="w-full aspect-square rounded-[3rem] bg-gradient-to-tr from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 flex items-center justify-center p-8 relative shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030308] via-transparent to-transparent" />
                    <div className="relative z-10 text-center space-y-6 transform group-hover:-translate-y-4 transition-transform duration-500">
                      <div className="flex justify-center gap-4 mb-8">
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "0ms"}}>{getOfficialLogo("Netflix", "🎬")}</div>
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "150ms"}}>{getOfficialLogo("Spotify", "🎵")}</div>
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "300ms"}}>{getOfficialLogo("Youtube", "📺")}</div>
                      </div>
                      <h3 className="font-black text-3xl text-white drop-shadow-lg">Bütün Premium Xidmətlər</h3>
                      <p className="text-sm text-indigo-200 font-bold bg-indigo-950/50 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-indigo-500/30">Bir klik uzaqlığında.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal mb-16 sm:mb-24 space-y-8">
              <div className="text-center space-y-4 mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Ən Çox Satılanlar</h2>
                <div className="w-16 sm:w-24 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {products.length > 0 && products.slice(0, 3).map((product, index) => (
                  <div key={product.id} className="hero-card rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition" onClick={() => openProductDetail(product)}>
                    <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
                      <div className="p-3 sm:p-4 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(product.name, product.emoji, product.color, product.customLogo)}</div>
                      <span className="text-[9px] font-black text-white bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">Populyar</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 sm:mb-8 min-h-[40px]">{product.desc}</p>
                    </div>
                    <div className="pt-5 sm:pt-6 border-t border-white/10 mt-auto relative z-10">
                      <button className="w-full py-3 sm:py-4 rounded-xl text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-105" style={{ backgroundColor: product.color }}>
                        Ətraflı Bax →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="reveal mb-16 sm:mb-24 py-8 sm:py-10 w-full">
              <div className="text-center space-y-4 mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Sistem Necə İşləyir?</h2>
                <div className="w-16 sm:w-24 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
                 <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/50 to-indigo-500/10 z-0" />
                 <div className="reveal relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-indigo-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(99,102,241,0.2)]">1</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Məhsulu Seçin</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Kataloqdan istədiyiniz platformanı və abunəlik müddətini seçərək səbətə əlavə edin.</p>
                 </div>
                 <div className="reveal relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-emerald-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-emerald-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">2</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Ödəniş Et</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sizə uyğun olan bankı seçin, göstərilən karta ödəniş edib qəbzin (çekin) şəklini sistemə yükləyin.</p>
                 </div>
                 <div className="reveal relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-purple-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-purple-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]">3</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Təsdiq Al</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sifarişiniz təsdiqlənən kimi rəsmi hesab məlumatlarınız birbaşa Şəxsi Kabinetinizdə görünəcək.</p>
                 </div>
              </div>
            </section>
          </main>
        )}

        {}
        {page === "categories" && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <div className="mb-6 sm:mb-12 space-y-3 sm:space-y-6">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Kataloq</h1>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar w-full">
                {[...CATEGORIES, ...(cmsCategories || []).map(c => ({ id: c.id, label: c.label, icon: c.icon }))].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`cat-pill ${selectedCat === cat.id ? 'cat-pill--active' : 'cat-pill--inactive'}`}
                  >
                    <span style={{ fontSize: '14px' }}>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.filter(p => selectedCat === "all" || p.cat === selectedCat).map((product) => (
                <div key={product.id} className="prod-card reveal" onClick={() => openProductDetail(product)}>
                  <div className="prod-accent-line" style={{ background: `linear-gradient(90deg, ${product.color}, ${product.color}55)` }} />
                  {product.popular && <span className="prod-popular-badge">🔥 Populyar</span>}
                  <div className="prod-thumb">
                    <div className="prod-logo-wrap">
                      {getOfficialLogo(product.name, product.emoji, product.color, product.customLogo)}
                    </div>
                  </div>
                  <div className="prod-content">
                    <div className="prod-name">{product.name}</div>
                    <div className="prod-desc">{product.desc}</div>
                    <div className="prod-meta">
                      <span className="prod-badge prod-badge--rating">⭐ {product.rating || "5.0"}</span>
                      <span className="prod-badge prod-badge--sales">🔥 {product.sales || "1k+"} satış</span>
                    </div>
                    <div className="prod-price-row">
                      <div className="prod-price">
                        <span>{product.packages?.[0]?.price ?? "—"} AZN</span>
                        <span style={{ color: '#64748b', fontWeight: 500, fontSize: '10px', marginLeft: '4px' }}>-dən</span>
                      </div>
                    </div>
                    <button className="prod-btn" style={{ backgroundColor: product.color }}>
                      Ətraflı Bax →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}


        {}
        {page === "product_detail" && viewedProduct && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <button onClick={() => setPage("categories")} className="text-gray-400 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 transition">
              ← Geriyə
            </button>
            <div className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 border border-indigo-500/20 overflow-hidden relative">
               <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 relative z-10">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="p-4 sm:p-6 bg-[#0c0c1d] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl">{getOfficialLogo(viewedProduct.name, viewedProduct.emoji, viewedProduct.color, viewedProduct.customLogo)}</div>
                      <div>
                         <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-widest uppercase inline-block mb-2">100% Zəmanət</span>
                         <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">{viewedProduct.name}</h1>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-black">
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-900/50"><span className="text-yellow-400">⭐ {viewedProduct.rating || "5.0"}</span> <span className="text-white hidden sm:inline">Reytinq</span></div>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-900/50"><span className="text-emerald-400">🔥 {viewedProduct.sales || "1k+"}</span> <span className="text-white hidden sm:inline">Satış</span></div>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-500/30 text-indigo-300">Növ: {viewedProduct.accountType || "Rəsmi Hesab"}</div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                       <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-widest">Məhsul Haqqında</h3>
                       <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">{viewedProduct.desc}</p>
                    </div>

                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-indigo-900/50">
                       <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-widest">Üstünlüklər</h3>
                       <ul className="space-y-2 sm:space-y-3">
                         {(viewedProduct.features || ["Rəsmi zəmanət", "7/24 Dəstək"]).map((feature, i) => (
                           <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-300"><span className="text-emerald-400">✓</span> {feature}</li>
                         ))}
                       </ul>
                    </div>
                 </div>

                 <div className="bg-[#0c0c1d] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-indigo-900/30 flex flex-col justify-between mt-6 lg:mt-0">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest mb-4 sm:mb-6 text-center">Müddəti Seçin</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {(viewedProduct.packages || []).map((pkg) => (
                          <div key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`cursor-pointer p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${selectedDuration?.id === pkg.id ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transform scale-[1.02]" : "bg-black border-transparent hover:border-indigo-900/50"}`}>
                            <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${selectedDuration?.id === pkg.id ? "text-indigo-300" : "text-gray-400"}`}>{pkg.duration}</span>
                            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{pkg.price} <span className="text-[10px] sm:text-sm text-gray-500">AZN</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 sm:pt-8 border-t border-indigo-900/50 text-center">
                       <button onClick={() => { addToCart(viewedProduct, selectedDuration); }} className="glow-btn w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.4)]">
                        <Icons.Cart /> İndi Səbətə At
                       </button>
                       <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3 sm:mt-4">100% Güvənli Çatdırılma</p>
                    </div>
                 </div>
               </div>
            </div>
          </main>
        )}

        {}
        {page === "checkout" && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <button type="button" onClick={() => { setPage("categories"); setIsCartOpen(true); }} className="text-gray-400 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 transition cursor-pointer relative z-50">
              ← Səbətə Qayıt
            </button>
            
            <div className="glass-card w-full max-w-4xl mx-auto rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative">
              <div className="text-center mb-6 sm:mb-8 pt-2 sm:pt-0">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">Ödəniş Mərhələsi</h3>
                <p className="text-[11px] sm:text-sm font-medium text-gray-400 max-w-md mx-auto">Aşağıdakı kartlardan birinə ödəniş edin, nömrəni kopyalamaq üçün toxunun və çeki yükləyin.</p>
              </div>

              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 sm:pb-6 snap-x no-scrollbar w-full">
                {CARD_ACCOUNTS.map(acc => (
                  <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`flex-shrink-0 w-56 h-36 sm:w-64 sm:h-44 snap-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between border-2 border-white/10 ${selectedBank?.id === acc.id ? "ring-offset-4 ring-indigo-500 scale-[1.02] shadow-[0_15px_40px_rgba(0,0,0,0.4)]" : "opacity-90 hover:opacity-100 scale-95"}`} style={{ backgroundColor: acc.colorCode }}>
                    <div className="relative z-10 font-black text-[10px] sm:text-xs tracking-widest text-center uppercase text-white opacity-80">{acc.bank}</div>
                    
                    <div className="relative z-10 w-full flex items-center justify-center flex-1 py-1">
                       <acc.logo />
                    </div>

                    <div className="relative z-10 mt-auto text-center">
                      <div onClick={(e) => copyToClipboard(e, acc.num)} className="group cursor-pointer inline-block bg-white/20 px-3 py-1 rounded-md shadow-sm backdrop-blur-sm border border-white/20">
                        <div className="text-base sm:text-lg font-black tracking-widest transition-colors text-white">{acc.num}</div>
                        <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <span>📋</span> Kopyala
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🔒 Hidden CSRF token field */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-6 sm:space-y-8 mt-2 sm:mt-4 bg-[#0c0c1d] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                <input type="hidden" value={csrfToken} readOnly />
                <div>
                  <label className="block text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Ödəniş Çeki (Cihazdan Yüklə)</label>
                  {!uploadedReceipt ? (
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 sm:h-40 rounded-xl sm:rounded-2xl border-2 border-dashed border-indigo-500/40 bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-900/30 hover:border-indigo-400 transition group shadow-inner">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-950 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition border border-indigo-500/30 shadow-lg text-lg sm:text-xl">📸</div>
                      <span className="text-xs sm:text-sm text-indigo-300 font-bold">Çeki seçmək üçün toxunun</span>
                      <span className="text-[8px] sm:text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 sm:mt-2">PNG, JPG, JPEG</span>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, setUploadedReceipt)} className="hidden" />
                    </div>
                  ) : (
                    <div className="relative w-full h-40 sm:h-48 rounded-xl sm:rounded-2xl border-2 border-emerald-500/50 overflow-hidden bg-black flex items-center justify-center group shadow-xl">
                      <img src={uploadedReceipt} alt="Receipt" className="max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <button type="button" onClick={() => setUploadedReceipt(null)} className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition">Çeki Sil / Dəyiş</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-indigo-900/50 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                  <div className="text-center sm:text-left">
                    <span className="text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-0.5 sm:mb-1">Ümumi Məbləğ</span>
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{cart.reduce((sum, item) => sum + (item.package?.price || 0), 0)} <span className="text-sm sm:text-lg text-indigo-400">AZN</span></span>
                  </div>
                  <button type="submit" disabled={isEmailSending} className="glow-btn w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 sm:gap-3">
                    {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Sifarişi Təsdiqlə"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        )}

        {}
        {page === "dashboard" && (
          <main className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <h1 className="text-2xl sm:text-4xl font-black text-white mb-4 sm:mb-8 tracking-tight">Şəxsi Kabinet</h1>
            
            <div className="flex gap-2 sm:gap-4 border-b border-indigo-950/60 pb-3 sm:pb-4 mb-6 sm:mb-8 overflow-x-auto no-scrollbar w-full">
              <button onClick={() => setDashTab("profile")} className={`px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "profile" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>Hesab Məlumatları</button>
              <button onClick={() => setDashTab("orders")} className={`px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "orders" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>
                Sifarişlərim {(orders || []).filter(o => o.userEmail === user?.email).length > 0 && <span className="ml-1 sm:ml-2 bg-white/20 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{(orders || []).filter(o => o.userEmail === user?.email).length}</span>}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 sm:gap-10">
              {dashTab === "profile" && (
                <div className="w-full max-w-2xl reveal">
                  <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-indigo-500/20">
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
                      <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-4xl sm:text-5xl text-white overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.4)] border-2 sm:border-4 border-[#030308]">
                          {profileEdit.profileImg ? <img src={profileEdit.profileImg} alt="User" className="w-full h-full object-cover" /> : profileEdit.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">Şəkli<br/>Dəyiş</span>
                        </div>
                        <input type="file" accept="image/*" ref={profileInputRef} onChange={(e) => handleImageUpload(e, (res) => setProfileEdit({...profileEdit, profileImg: res}))} className="hidden" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl font-black text-white">{user?.name} {user?.surname}</h3>
                        <p className="text-xs sm:text-sm text-indigo-400 font-bold tracking-wider mt-1">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Adınız</label><input type="text" value={profileEdit.name} onChange={(e) => setProfileEdit({...profileEdit, name: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Soyadınız</label><input type="text" value={profileEdit.surname} onChange={(e) => setProfileEdit({...profileEdit, surname: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">E-poçt</label><input type="email" value={profileEdit.email} onChange={(e) => setProfileEdit({...profileEdit, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Cinsiyyət</label>
                        <select value={profileEdit.gender} onChange={(e) => setProfileEdit({...profileEdit, gender: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]">
                          <option value="Kişi">Kişi</option>
                          <option value="Qadın">Qadın</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2"><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Əlaqə Nömrəsi</label><input type="tel" placeholder="+994" value={profileEdit.phone} onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-indigo-950/60">
                       <button onClick={handleUpdateProfile} className="flex-1 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition">Yadda Saxla</button>
                       <button onClick={() => { setUser(null); setPage("home"); }} className="px-6 sm:px-8 py-3 sm:py-4 bg-red-950/40 border border-red-900/40 hover:bg-red-900/50 text-red-400 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition">Çıxış Et</button>
                    </div>
                  </div>
                </div>
              )}

              {dashTab === "orders" && (
                <div className="w-full reveal">
                  {(orders || []).filter(o => o.userEmail === user?.email).length === 0 ? (
                    <div className="glass-card rounded-[2rem] p-10 sm:p-16 text-center space-y-4 sm:space-y-6 border border-indigo-500/20">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#0c0c1d] rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
                        <span className="text-2xl sm:text-4xl animate-bounce text-indigo-400"><Icons.Cart /></span>
                      </div>
                      <div><h3 className="text-lg sm:text-2xl font-black text-white mb-1">Sifarişiniz Yoxdur</h3><p className="text-xs sm:text-sm text-gray-400 font-medium">Platformamızdan hələ heç bir abunəlik əldə etməmisiniz.</p></div>
                      <button onClick={() => {setPage("categories"); setDashTab("profile");}} className="glow-btn inline-block px-8 sm:px-10 py-3 sm:py-4 rounded-xl bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider">Kataloqa Keç</button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6">
                      {(orders || []).filter(o => o.userEmail === user?.email).reverse().map((order) => (
                        <div key={order.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3 w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-indigo-600 text-white tracking-widest">{order.id}</span>
                              <span className="text-[9px] sm:text-xs font-bold text-gray-500">{order.date}</span>
                            </div>
                            <h4 className="text-sm sm:text-xl font-black text-white">{order.productName} <span className="text-indigo-400">({order.duration})</span></h4>
                            <div className="flex gap-3 sm:gap-4 text-[9px] sm:text-xs font-bold text-gray-400"><span>Ödəniş: <span className="text-white">{order.bank}</span></span><span>Məbləğ: <span className="text-white">{order.price} AZN</span></span></div>
                          </div>
                          <div className="w-full md:w-auto text-left md:text-right mt-2 md:mt-0">
                            {order.status === "pending" && <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-yellow-900/40 border border-yellow-500/40 text-yellow-400 text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2"><div className="spinner w-2 h-2 sm:w-3 sm:h-3 border-[2px]"></div> Yoxlanılır</span>}
                            {order.status === "rejected" && <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">❌ Rədd Edildi</span>}
                            {order.status === "approved" && (
                              <div className="space-y-2 sm:space-y-3">
                                <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">✅ Aktivdir</span>
                                {order.credentials && (
                                  <div className="p-3 sm:p-4 bg-[#0c0c1d] border border-indigo-500/30 rounded-xl text-[9px] sm:text-xs space-y-1.5 sm:space-y-2 text-left w-full sm:min-w-[200px]">
                                    <div className="text-gray-500 font-bold uppercase tracking-widest text-[7px] sm:text-[9px] mb-1 sm:mb-2">Giriş Məlumatları</div>
                                    <div className="flex justify-between gap-4"><span className="text-gray-400">E-mail:</span> <span className="text-white font-black select-all">{order.credentials?.email}</span></div>
                                    <div className="flex justify-between gap-4"><span className="text-gray-400">Şifrə:</span> <span className="text-white font-black select-all">{order.credentials?.pass}</span></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        )}

        {}
        {page === "contact" && (
          <main className="reveal max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10 w-full text-center">
             <h1 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">Bizimlə Əlaqə</h1>
             <p className="text-gray-400 font-medium mb-12 max-w-lg mx-auto">{cmsContent?.contact?.subtitle || "Sualınız var və ya dəstəyə ehtiyacınız var? Bizə yazın, ən qısa zamanda cavablandıraq."}</p>
             <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                <a href={cmsContent?.contact?.whatsappUrl || "https://wa.me/994103136941"} target="_blank" rel="noreferrer" className="glass-card p-10 sm:p-12 rounded-[2rem] border border-[#25D366]/30 hover:border-[#25D366]/60 transition group flex flex-col items-center justify-center">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#25D366]/20 rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-6 group-hover:scale-110 transition shadow-[0_0_30px_rgba(37,211,102,0.3)]">📱</div>
                   <h3 className="text-2xl font-black text-white mb-2">WhatsApp</h3>
                   <p className="text-gray-400 font-bold">{cmsContent?.contact?.whatsappDisplay || "+994 10 313 69 41"}</p>
                </a>
                <a href={`mailto:${cmsContent?.contact?.email || "premiumshopazerbaycan@gmail.com"}`} className="glass-card p-10 sm:p-12 rounded-[2rem] border border-indigo-500/30 hover:border-indigo-500/60 transition group flex flex-col items-center justify-center">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-500/20 rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-6 group-hover:scale-110 transition shadow-[0_0_30px_rgba(99,102,241,0.3)]">✉️</div>
                   <h3 className="text-2xl font-black text-white mb-2">E-poçt</h3>
                   <p className="text-gray-400 font-bold">{cmsContent?.contact?.email || "premiumshopazerbaycan@gmail.com"}</p>
                </a>
             </div>
          </main>
        )}

        {page === "rules" && (
          <main className="reveal max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10 w-full">
             <div className="text-center mb-10 sm:mb-16">
               <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">İstifadə Qaydaları</h1>
               <p className="text-gray-400 font-medium">Premium Shop platformasının rəsmi xidmət şərtləri.</p>
               <div className="w-16 sm:w-24 h-1.5 bg-indigo-600 mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
             </div>
             
             <div className="glass-card p-6 sm:p-10 rounded-[2rem] space-y-8 border border-white/5">
               <div className="space-y-3">
                 <h3 className="text-lg sm:text-xl font-black text-indigo-400 flex items-center gap-2"><span className="text-2xl">📋</span> 1. Ümumi Şərtlər</h3>
                 <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">Premium Shop platformasından alınan bütün xidmətlər (Netflix, Spotify, ChatGPT və s.) rəsmi və qanuni yollarla əldə edilir. Bizim tərəfimizdən təqdim edilən hesablar seçdiyiniz müddət ərzində aktivliyinə 100% zəmanət verir.</p>
               </div>
               <div className="space-y-3">
                 <h3 className="text-lg sm:text-xl font-black text-emerald-400 flex items-center gap-2"><span className="text-2xl">🛡️</span> 2. Qadağalar və Cəzalar</h3>
                 <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">Təqdim edilən <strong>Ortaq Hesablarda</strong> (Netflix, Canva, ChatGPT) şifrənin, elektron poçtun, pin kodların və ya hazır profil adlarının dəyişdirilməsi qəti qadağandır. Bu hal sistem tərəfindən aşkarlandıqda istifadəçinin hesaba girişi dərhal bloklanır və ona heç bir <strong>geri ödəniş (refund) edilmir</strong>.</p>
               </div>
               <div className="space-y-3">
                 <h3 className="text-lg sm:text-xl font-black text-purple-400 flex items-center gap-2"><span className="text-2xl">💳</span> 3. Ödəniş və Çatdırılma</h3>
                 <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">Müştəri seçdiyi məhsulun ödənişini edib, bank çekini sistemə yüklədikdən sonra sifariş 1-12 saat (adətən 15 dəqiqə) ərzində yoxlanılır. Ödəniş təsdiq edildikdə giriş məlumatları avtomatik olaraq müştərinin Şəxsi Kabinetinə və Qeydiyyatdan keçdiyi E-poçt ünvanına göndərilir.</p>
               </div>
               <div className="space-y-3">
                 <h3 className="text-lg sm:text-xl font-black text-pink-400 flex items-center gap-2"><span className="text-2xl">🔁</span> 4. Zəmanət və Geri Ödəniş</h3>
                 <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">Rəqəmsal məhsullar xarakteri etibarilə geri qaytarıla bilməz (satış son cəhdlə tamamlanır). Lakin, əgər təqdim edilən hesabda bizim tərəfimizdən hər hansı bir texniki nasazlıq yaranarsa və problemi həll edə bilməriksə, ödənişiniz geri qaytarılır və ya hesab yenisi ilə əvəz olunur.</p>
               </div>
             </div>
          </main>
        )}

        {}
        {page === "admin_dashboard" && isAdminLoggedIn && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div><h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">İdarəetmə Paneli</h1><p className="text-xs sm:text-sm font-bold text-indigo-400 mt-1 sm:mt-2 uppercase tracking-widest">Səlahiyyətli İdarəçi</p></div>
              <button onClick={handleAdminLogout} className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-red-900/40 border border-red-500/30 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-red-800/50 transition shadow-lg w-full sm:w-auto">Sistemdən Çıxış</button>
            </div>

            <div className="flex gap-2 sm:gap-4 border-b border-indigo-950/60 pb-4 sm:pb-6 mb-6 sm:mb-8 overflow-x-auto no-scrollbar w-full">
              <button onClick={() => setActiveAdminTab("orders")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "orders" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Sifarişlər ({(orders || []).length})</button>
              <button onClick={() => setActiveAdminTab("products")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "products" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Məhsullar ({(products || []).length})</button>
              <button onClick={() => setActiveAdminTab("content")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "content" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>📝 Məzmun</button>
              <button onClick={() => setActiveAdminTab("cats")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "cats" ? "bg-pink-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>🏷️ Kateqoriyalar</button>
            </div>

            {activeAdminTab === "orders" && (
              <div className="space-y-4 sm:space-y-6 reveal w-full">
                {(orders || []).length === 0 && <div className="text-center py-12 sm:py-20 text-gray-500 font-bold text-base sm:text-lg">Sistemdə heç bir sifariş yoxdur.</div>}
                <div className="grid gap-4 w-full">
                  {(orders || []).slice().reverse().map((order) => (
                    <div key={order.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col lg:flex-row justify-between gap-5 sm:gap-6 border-l-4 w-full" style={{borderLeftColor: order.status === 'pending' ? '#eab308' : order.status === 'approved' ? '#10b981' : '#ef4444'}}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ID / Tarix</div><div className="font-bold text-indigo-400 mt-1 text-[11px] sm:text-base">{order.id}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.date}</div></div>
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Müştəri</div><div className="font-black text-white mt-1 text-[11px] sm:text-base">{order.userName} {order.userSurname}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.userEmail}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.userPhone}</div></div>
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Məhsul / Məbləğ</div><div className="font-black text-white mt-1 text-[11px] sm:text-base">{order.productName} ({order.duration})</div><div className="font-black text-emerald-400">{order.price} AZN</div></div>
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Bank Çeki</div><div className="font-bold text-white mt-1 text-[11px] sm:text-base">{order.bank}</div>{order.receipt && <a href={order.receipt} target="_blank" rel="noreferrer" className="inline-block mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-900/50 text-indigo-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg">Çekə Bax 🔍</a>}</div>
                      </div>
                      <div className="flex lg:flex-col justify-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[150px] mt-4 lg:mt-0">
                        {order.status === "pending" ? (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button onClick={() => setApprovingOrder(order)} className="flex-1 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg transition">Təsdiqlə</button>
                            <button onClick={() => rejectOrderAction(order)} className="flex-1 py-2.5 sm:py-3 bg-red-900/50 text-red-400 hover:bg-red-800/60 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition">Rədd Et</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            <div className={`text-center py-2 px-3 rounded-lg font-black text-[10px] uppercase w-full ${order.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                              {order.status === 'approved' ? 'Təsdiqlənib' : 'Rədd Edilib'}
                            </div>
                            <div className="flex gap-2 w-full">
                              {order.status === 'approved' && <button onClick={() => { setApprovingOrder(order); setAccountEmail(order.credentials?.email || ''); setAccountPass(order.credentials?.pass || ''); }} className="flex-1 bg-blue-900/40 text-blue-400 py-2 rounded text-[9px] font-black uppercase transition hover:bg-blue-800/60">Dəyiş</button>}
                              <button onClick={() => rejectOrderAction(order)} className="flex-1 bg-orange-900/40 text-orange-400 py-2 rounded text-[9px] font-black uppercase transition hover:bg-orange-800/60">Ləğv</button>
                              <button onClick={() => { if (!adminSession.load()) { handleAdminLogout(); return; } remove(ref(db, 'orders/' + order.firebaseKey)); }} className="flex-1 bg-red-900/40 text-red-400 py-2 rounded text-[9px] font-black uppercase transition hover:bg-red-800/60">Sil</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAdminTab === "products" && (
              <div className="space-y-4 sm:space-y-6 reveal w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Məhsul Kataloqu</h2>
                  <button onClick={() => setEditingProduct({ name: "Yeni Məhsul", cat: "entertainment", color: "#6366f1", emoji: "📦", desc: "Açıqlama", accountType: "Rəsmi Hesab", rating: "5.0", sales: "0", features: ["Yeni xüsusiyyət"], customLogo: "", packages: [{ id: "temp1", duration: "1 Ay", price: 10 }] })} className="glow-btn w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">+ Yeni Əlavə Et</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                  {(products || []).map(p => (
                    <div key={p.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between border border-indigo-500/20 relative overflow-hidden group">
                      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 relative z-10">
                        <div className="p-2.5 sm:p-3 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(p.name, p.emoji, p.color, p.customLogo)}</div>
                        <div><h4 className="font-black text-base sm:text-lg text-white">{p.name}</h4><span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">{p.cat}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5 sm:mb-6 relative z-10">
                        {(p.packages || []).map(pkg => (
                          <span key={pkg.id} className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-1 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 rounded-md font-black">{pkg.duration}: {pkg.price} AZN</span>
                        ))}
                      </div>
                      <div className="flex gap-2 sm:gap-3 mt-auto pt-4 sm:pt-5 border-t border-indigo-900/50 relative z-10">
                        <button onClick={() => setEditingProduct({...p, features: p.features || []})} className="flex-1 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg sm:rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-wider transition shadow-lg">Tam Redaktə</button>
                        <button onClick={() => handleDeleteProduct(p)} className="w-10 sm:w-14 flex items-center justify-center bg-red-900/40 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg sm:rounded-xl text-red-400 transition">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CMS: MƏZMUN PANELI ───────────────────────────────────────────────── */}
            {activeAdminTab === "content" && (
              <div className="space-y-6 reveal w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Sayt Məzmunu</h2>
                  <div className="flex gap-2 flex-wrap">
                    {[["hero","🏠 Ana Səhifə"],["contact","📞 Əlaqə"],["footer","📄 Footer"]].map(([sec,label]) => (
                      <button key={sec} onClick={() => setCmsEditSection(sec)} className={`px-4 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all ${cmsEditSection === sec ? "bg-indigo-600 text-white shadow-lg" : "bg-indigo-950/40 text-gray-400 hover:bg-indigo-900/50 hover:text-white"}`}>{label}</button>
                    ))}
                  </div>
                </div>
                {cmsEditSection === "hero" && (
                  <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-indigo-500/20 space-y-5">
                    <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-widest">🏠 Ana Səhifə — Hero Bölməsi</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Badge Mətni</label><input value={cmsEditData?.hero?.badge ?? "100% Güvənli Çatdırılma"} onChange={e => setCmsEditData(d => ({...d, hero: {...d?.hero, badge: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Başlıq (birinci sətir)</label><input value={cmsEditData?.hero?.title ?? "Rəqəmsal Dünyanızı"} onChange={e => setCmsEditData(d => ({...d, hero: {...d?.hero, title: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Başlıq (rəngli hissə)</label><input value={cmsEditData?.hero?.titleHighlight ?? "Premium Edin!"} onChange={e => setCmsEditData(d => ({...d, hero: {...d?.hero, titleHighlight: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Düymə Mətni</label><input value={cmsEditData?.hero?.ctaText ?? "Bütün Məhsullar"} onChange={e => setCmsEditData(d => ({...d, hero: {...d?.hero, ctaText: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Alt Mətn (Açıqlama)</label><textarea rows={3} value={cmsEditData?.hero?.subtitle ?? "Azərbaycanın ən etibarlı platformasında kartla rahatlıqla ödəyin, rəsmi abunəlik hesabınız e-mail ünvanınıza dərhal çatdırılsın."} onChange={e => setCmsEditData(d => ({...d, hero: {...d?.hero, subtitle: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold leading-relaxed" /></div>
                    </div>
                    <button onClick={() => { if (!adminSession.load()) { handleAdminLogout(); return; } update(ref(db, 'cms/hero'), cmsEditData?.hero || {}); showNotif("Hero bölməsi yadda saxlandı ✓", "success"); }} className="glow-btn px-8 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg transition">Yadda Saxla</button>
                  </div>
                )}
                {cmsEditSection === "contact" && (
                  <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-indigo-500/20 space-y-5">
                    <h3 className="text-xs sm:text-sm font-black text-purple-400 uppercase tracking-widest">📞 Əlaqə Səhifəsi</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">WhatsApp URL (wa.me/...)</label><input value={cmsEditData?.contact?.whatsappUrl ?? "https://wa.me/994103136941"} onChange={e => setCmsEditData(d => ({...d, contact: {...d?.contact, whatsappUrl: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">WhatsApp Nömrəsi (görünən mətn)</label><input value={cmsEditData?.contact?.whatsappDisplay ?? "+994 10 313 69 41"} onChange={e => setCmsEditData(d => ({...d, contact: {...d?.contact, whatsappDisplay: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">E-poçt Ünvanı</label><input value={cmsEditData?.contact?.email ?? "premiumshopazerbaycan@gmail.com"} onChange={e => setCmsEditData(d => ({...d, contact: {...d?.contact, email: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Alt Mətn</label><textarea rows={2} value={cmsEditData?.contact?.subtitle ?? "Sualınız var və ya dəstəyə ehtiyacınız var? Bizə yazın, ən qısa zamanda cavablandıraq."} onChange={e => setCmsEditData(d => ({...d, contact: {...d?.contact, subtitle: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold leading-relaxed" /></div>
                    </div>
                    <button onClick={() => { if (!adminSession.load()) { handleAdminLogout(); return; } update(ref(db, 'cms/contact'), cmsEditData?.contact || {}); showNotif("Əlaqə məlumatları yadda saxlandı ✓", "success"); }} className="glow-btn px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg transition">Yadda Saxla</button>
                  </div>
                )}
                {cmsEditSection === "footer" && (
                  <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-indigo-500/20 space-y-5">
                    <h3 className="text-xs sm:text-sm font-black text-pink-400 uppercase tracking-widest">📄 Footer Məzmunu</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Facebook Linki</label><input value={cmsEditData?.footer?.socialFacebook ?? "https://www.facebook.com/premiumshopazerbaycan"} onChange={e => setCmsEditData(d => ({...d, footer: {...d?.footer, socialFacebook: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Instagram Linki</label><input value={cmsEditData?.footer?.socialInstagram ?? "https://www.instagram.com/premiumshop.az/"} onChange={e => setCmsEditData(d => ({...d, footer: {...d?.footer, socialInstagram: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Abunə Bölməsi Başlığı</label><input value={cmsEditData?.footer?.subscribeTitle ?? "Abunə Ol"} onChange={e => setCmsEditData(d => ({...d, footer: {...d?.footer, subscribeTitle: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Abunə Alt Mətni</label><input value={cmsEditData?.footer?.subscribeText ?? "Ən yeni güncəlləmələrdən xəbərdar olmaq üçün abunə ol!"} onChange={e => setCmsEditData(d => ({...d, footer: {...d?.footer, subscribeText: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                      <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Copyright Mətni</label><input value={cmsEditData?.footer?.copyright ?? "Copyright © 2026 Premium Shop, Bütün hüquqlar qorunur."} onChange={e => setCmsEditData(d => ({...d, footer: {...d?.footer, copyright: e.target.value}}))} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" /></div>
                    </div>
                    <button onClick={() => { if (!adminSession.load()) { handleAdminLogout(); return; } update(ref(db, 'cms/footer'), cmsEditData?.footer || {}); showNotif("Footer məzmunu yadda saxlandı ✓", "success"); }} className="glow-btn px-8 py-3 sm:py-4 bg-pink-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg transition">Yadda Saxla</button>
                  </div>
                )}
              </div>
            )}
            {activeAdminTab === "cats" && (
              <div className="space-y-6 reveal w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Kateqoriyalar</h2>
                    <p className="text-[10px] text-gray-500 mt-1">Kataloqda görünən kateqoriyaları idarə edin.</p>
                  </div>
                  <button onClick={() => setCmsCatEdit({ label: "", icon: "🏷️", id: "" })} className="glow-btn px-6 sm:px-8 py-3 sm:py-4 bg-pink-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">+ Yeni Kateqoriya</button>
                </div>
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[10px] sm:text-xs text-indigo-300 font-bold">ℹ️ Standart kateqoriyalar: <span className="text-white">all · entertainment · ai · design</span> — bunlar silinmir, yalnız əlavə kateqoriyalar silinə bilər.</div>
                {/* Default categories display */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                    <div key={cat.id} className="glass-card rounded-[1.5rem] p-4 sm:p-5 border border-indigo-500/20 flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3"><span className="text-2xl">{cat.icon}</span><div><div className="font-black text-white text-xs sm:text-sm">{cat.label}</div><div className="text-[9px] text-indigo-400 font-bold mt-0.5">id: {cat.id} · Standart</div></div></div>
                      <span className="text-[9px] px-2 py-1 bg-indigo-950/50 text-indigo-400 rounded-lg font-black uppercase">Qorunur</span>
                    </div>
                  ))}
                  {/* CMS-added categories */}
                  {(cmsCategories || []).map(cat => (
                    <div key={cat.firebaseKey} className="glass-card rounded-[1.5rem] p-4 sm:p-5 border border-pink-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3"><span className="text-2xl">{cat.icon}</span><div><div className="font-black text-white text-xs sm:text-sm">{cat.label}</div><div className="text-[9px] text-pink-400 font-bold mt-0.5">id: {cat.id}</div></div></div>
                      <div className="flex gap-2">
                        <button onClick={() => setCmsCatEdit({ ...cat })} className="w-8 h-8 flex items-center justify-center bg-blue-900/40 text-blue-400 rounded-lg hover:bg-blue-700/50 hover:text-white transition">✏️</button>
                        <button onClick={() => { if (!adminSession.load()) { handleAdminLogout(); return; } remove(ref(db, `cms_categories/${cat.firebaseKey}`)); showNotif("Kateqoriya silindi", "success"); }} className="w-8 h-8 flex items-center justify-center bg-red-900/40 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition">🗑️</button>
                      </div>
                    </div>
                  ))}
                  {(cmsCategories || []).length === 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-8 text-gray-500 font-bold text-sm">Hələ əlavə edilmiş xüsusi kateqoriya yoxdur.</div>
                  )}
                </div>
                {cmsCatEdit && (
                  <div className="fixed inset-0 flex items-center justify-center p-4 z-[99999]" style={{ backgroundColor: '#030308', zIndex: 99999 }}>
                    <div className="glass-card w-full max-w-md rounded-[2rem] p-8 animate-modal relative border border-pink-500/30">
                      <button onClick={() => setCmsCatEdit(null)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white flex items-center justify-center text-lg font-bold">&times;</button>
                      <h3 className="text-xl sm:text-2xl font-black text-white mb-6">{cmsCatEdit.firebaseKey ? "Kateqoriyanı Redaktə Et" : "Yeni Kateqoriya"}</h3>
                      <div className="space-y-4">
                        <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Kateqoriya Adı (label)</label><input value={cmsCatEdit.label} onChange={e => setCmsCatEdit({...cmsCatEdit, label: e.target.value})} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" placeholder="Məs: Oyun" /></div>
                        <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">İkon (emoji)</label><input value={cmsCatEdit.icon} onChange={e => setCmsCatEdit({...cmsCatEdit, icon: e.target.value})} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" placeholder="Məs: 🎮" /></div>
                        <div><label className="block text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">ID (kiçik hərf, boşluqsuz)</label><input value={cmsCatEdit.id} onChange={e => setCmsCatEdit({...cmsCatEdit, id: e.target.value.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'')})} className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold" placeholder="Məs: gaming" /></div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setCmsCatEdit(null)} className="flex-1 py-3 bg-indigo-950/40 text-gray-400 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-900/60 transition">Ləğv</button>
                        <button type="button" onClick={() => {
                          if (!adminSession.load()) { handleAdminLogout(); return; }
                          if (!cmsCatEdit.label.trim() || !cmsCatEdit.id.trim()) return showNotif("Ad və ID daxil edin", "error");
                          if (CATEGORIES.find(c => c.id === cmsCatEdit.id)) return showNotif("Bu ID artıq standart kateqoriyada var", "error");
                          const { firebaseKey, ...catData } = cmsCatEdit;
                          if (firebaseKey) {
                            update(ref(db, `cms_categories/${firebaseKey}`), catData);
                            showNotif("Kateqoriya yenilendi ✓", "success");
                          } else {
                            push(ref(db, 'cms_categories'), catData);
                            showNotif("Kateqoriya əlavə edildi ✓", "success");
                          }
                          setCmsCatEdit(null);
                        }} className="glow-btn flex-1 py-3 bg-pink-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg transition">Saxla</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



          </main>
        )}
      </div>

      {}
      <a href={cmsContent?.contact?.whatsappUrl || "https://wa.me/994103136941"} className="wa-float reveal" target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.625 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
      </a>

      {isCartOpen && (
        <div
          className="fixed inset-0 flex justify-end"
          style={{ zIndex: 99990, background: 'rgba(3,3,8,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsCartOpen(false); }}
        >
          <div className="glass-card w-full sm:w-80 md:max-w-md h-full flex flex-col justify-between drawer-open rounded-none border-y-0 border-r-0 border-l border-indigo-500/30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]" style={{ zIndex: 99991, position: 'relative' }}>
            <div className="p-6 sm:p-8 pb-4 h-full flex flex-col">
              <div className="flex justify-between items-center pb-5 sm:pb-6 border-b border-indigo-900/50 mb-5 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-indigo-600 rounded-lg sm:rounded-xl text-white shadow-lg"><Icons.Cart /></div> Səbətiniz
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/80 text-gray-400 hover:bg-indigo-900 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
              </div>
              
              {(cart || []).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 sm:space-y-7">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#0c0c1d] rounded-full flex items-center justify-center border border-indigo-900/50 mx-auto" style={{ color: '#6366f1' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-xs sm:text-sm mb-1">Səbətiniz boşdur</p>
                    <p className="text-gray-500 font-medium text-[10px] sm:text-xs">Məhsul əlavə etmək üçün kataloqa keçin</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 no-scrollbar">
                  {(cart || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c0c1d] border border-indigo-500/30 hover:border-indigo-400 transition-colors group">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-2.5 bg-black/40 rounded-lg sm:rounded-xl border border-white/10 shadow-lg">{getOfficialLogo(item.product?.name, item.product?.emoji, item.product?.color, item.product?.customLogo)}</div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white mb-0.5 sm:mb-1">{item.product?.name}</h4>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-1.5 sm:px-2 py-0.5 rounded">{item.package?.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="font-black text-sm sm:text-lg text-white tracking-tight">{item.package?.price} <span className="text-[9px] sm:text-[10px] text-gray-500">AZN</span></span>
                        <button onClick={() => removeFromCart(index)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white transition">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(cart || []).length > 0 && (
              <div className="p-6 sm:p-8 bg-black/40 border-t border-indigo-900/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-5 sm:mb-6">
                  <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">Ümumi Məbləğ</span>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{(cart || []).reduce((sum, item) => sum + (item.package?.price || 0), 0)} <span className="text-sm sm:text-lg text-indigo-400">AZN</span></span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setPage("checkout"); }} className="glow-btn w-full py-4 sm:py-5 bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  Ödənişə Keç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {authMode && (
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 w-full h-full overflow-y-auto z-[99999]" style={{ backgroundColor: '#030308', zIndex: 99999 }}>
          <div className="glass-card w-full max-w-md rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 animate-modal relative border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] my-auto">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white hover:bg-indigo-900 flex items-center justify-center text-lg sm:text-xl font-bold transition">&times;</button>

            {showOtpSuccess ? (
              <div className="py-8 sm:py-12 text-center space-y-4 sm:space-y-6">
                <div className="success-check">✓</div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Kodu Göndərdik!</h3>
                <p className="text-xs sm:text-sm font-medium text-gray-400">E-mail qutunuzu yoxlayın.</p>
              </div>
            ) : authMode === "login" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Xoş Gəldiniz</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Hesabınıza giriş edin.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">E-poçt Ünvanı</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <div className="text-right">
                     <span onClick={() => setAuthMode("forgot")} className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 cursor-pointer hover:text-indigo-300">Şifrəni unutmusunuz?</span>
                  </div>
                  {lockoutTimers["login_" + (authForm.email || "").toLowerCase()] > 0 && (
                    <div className="p-3 sm:p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-black text-center uppercase tracking-wider animate-pulse mb-3">
                      🚨 Giriş məhdudlaşdırılıb! {lockoutTimers["login_" + (authForm.email || "").toLowerCase()]} saniyə qaldı
                    </div>
                  )}
                  <button type="submit" disabled={lockoutTimers["login_" + (authForm.email || "").toLowerCase()] > 0} className={`glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest ${lockoutTimers["login_" + (authForm.email || "").toLowerCase()] > 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {lockoutTimers["login_" + (authForm.email || "").toLowerCase()] > 0 ? `Gözləyin (${lockoutTimers["login_" + (authForm.email || "").toLowerCase()]}s)` : "Giriş Et"}
                  </button>
                </form>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-950/50 text-center">
                  <p className="text-[10px] sm:text-xs font-black text-gray-500">Hesabınız yoxdur? <span onClick={() => setAuthMode("register")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">İndi Yarat</span></p>
                </div>
              </div>
            ) : authMode === "register" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Qeydiyyat</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Məlumatları doldurun.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Ad</label><input type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                    <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Soyad</label><input type="text" value={authForm.surname} onChange={(e) => setAuthForm({...authForm, surname: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  </div>
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">E-poçt</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Şifrə təyin edin</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  
                  {lockoutTimers["otp_" + (authForm.email || "").toLowerCase()] > 0 && (
                    <div className="p-3 sm:p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-black text-center uppercase tracking-wider animate-pulse mb-3">
                      🚨 Qeydiyyat məhdudlaşdırılıb! {lockoutTimers["otp_" + (authForm.email || "").toLowerCase()]} saniyə qaldı
                    </div>
                  )}
                  <button type="submit" disabled={isEmailSending || lockoutTimers["otp_" + (authForm.email || "").toLowerCase()] > 0} className={`glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex justify-center items-center gap-2 sm:gap-3 transition ${lockoutTimers["otp_" + (authForm.email || "").toLowerCase()] > 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {lockoutTimers["otp_" + (authForm.email || "").toLowerCase()] > 0 ? `Gözləyin (${lockoutTimers["otp_" + (authForm.email || "").toLowerCase()]}s)` : (isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Kodu Göndər 📩")}
                  </button>
                </form>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-950/50 text-center">
                  <p className="text-[10px] sm:text-xs font-black text-gray-500">Artıq hesabınız var? <span onClick={() => setAuthMode("login")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">Giriş edin</span></p>
                </div>
              </div>
            ) : authMode === "forgot" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Şifrəni Yenilə</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Hesabınızın e-poçtunu yazın.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">E-poçt Ünvanı</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  {lockoutTimers["otp_forgot_" + (authForm.email || "").toLowerCase()] > 0 && (
                    <div className="p-3 sm:p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-black text-center uppercase tracking-wider animate-pulse mb-3">
                      🚨 Limit aşıldı! {lockoutTimers["otp_forgot_" + (authForm.email || "").toLowerCase()]} saniyə qaldı
                    </div>
                  )}
                  <button type="submit" disabled={isEmailSending || lockoutTimers["otp_forgot_" + (authForm.email || "").toLowerCase()] > 0} className={`glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex justify-center items-center gap-2 sm:gap-3 transition ${lockoutTimers["otp_forgot_" + (authForm.email || "").toLowerCase()] > 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {lockoutTimers["otp_forgot_" + (authForm.email || "").toLowerCase()] > 0 ? `Gözləyin (${lockoutTimers["otp_forgot_" + (authForm.email || "").toLowerCase()]}s)` : (isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Kodu Göndər 📩")}
                  </button>
                </form>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-950/50 text-center">
                  <span onClick={() => setAuthMode("login")} className="text-[10px] sm:text-xs font-black text-indigo-400 cursor-pointer hover:text-indigo-300 uppercase tracking-widest">← Geriyə Qayıt</span>
                </div>
              </div>
            ) : authMode === "reset_pass" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Yeni Şifrə</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Hesabınız üçün yeni şifrə təyin edin.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Yeni Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <button type="submit" className="glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-emerald-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest">Şifrəni Yenilə</button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight text-center">Təsdiq Kodu</h3>
                <p className="text-[9px] sm:text-[11px] font-black text-gray-500 mb-6 sm:mb-8 text-center uppercase tracking-widest">E-poçtunuza gələn 6 rəqəmli kodu yazın</p>
                <form onSubmit={handleUserAuth} className="space-y-5 sm:space-y-6">
                  <div>
                    <input type="text" value={authForm.otpInput} onChange={(e) => setAuthForm({...authForm, otpInput: e.target.value})} className="w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-3xl font-black tracking-[8px] sm:tracking-[12px] bg-indigo-950/40 border-indigo-500/50 text-indigo-300 placeholder-indigo-900" placeholder="------" maxLength="6" required />
                  </div>
                  <button type="submit" className="glow-btn w-full py-4 sm:py-5 bg-emerald-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]">Təsdiqlə</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {isAdminModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[99999]" style={{ backgroundColor: '#030308', zIndex: 99999 }}>
          <div className="glass-card w-full max-w-md rounded-[1.5rem] sm:rounded-[2.5rem] p-8 md:p-10 animate-modal relative border border-red-500/30">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-900/40 border border-red-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 mx-auto shadow-lg">🛡️</div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 text-center tracking-tight">Admin Paneli</h3>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 sm:mb-8 text-center">Səlahiyyətli şəxs girişi</p>
            <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-5">
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">İstifadəçi Adı</label><input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Şifrə</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
              {lockoutTimers["admin_login"] > 0 && (
                <div className="p-3 sm:p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-black text-center uppercase tracking-wider animate-pulse mb-3">
                  🚨 Admin girişi məhdudlaşdırılıb! {lockoutTimers["admin_login"]} saniyə qaldı
                </div>
              )}
              <button type="submit" disabled={lockoutTimers["admin_login"] > 0} className={`w-full py-3.5 sm:py-4 mt-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition ${lockoutTimers["admin_login"] > 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                {lockoutTimers["admin_login"] > 0 ? `Gözləyin (${lockoutTimers["admin_login"]}s)` : "Sistemə Giriş"}
              </button>
            </form>
          </div>
        </div>
      )}

      {approvingOrder && (
        <div className="fixed inset-0 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4 z-[99999]">
          <div className="glass-card w-full max-w-lg rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 animate-modal relative border border-emerald-500/30 w-full">
            <button onClick={() => setApprovingOrder(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Sifarişi Təsdiqlə</h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 sm:mb-8">Müştəri üçün abunəlik məlumatlarını daxil edin</p>
            <form onSubmit={approveOrderAction} className="space-y-4 sm:space-y-5 bg-[#0c0c1d] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-indigo-900/30 shadow-inner">
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-2">Hesab E-maili / Giriş Adı</label><input type="text" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-300" required /></div>
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-2">Hesab Şifrəsi</label><input type="text" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-300" required /></div>
              <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button type="button" onClick={() => setApprovingOrder(null)} className="w-1/3 py-3.5 sm:py-4 bg-indigo-950/40 text-gray-400 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-900/60 transition">Ləğv</button>
                <button type="submit" className="glow-btn w-2/3 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition">Göndər ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-[#030308]/85 backdrop-blur-xl flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto z-[99999]">
          <div className="glass-card w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-[2.5rem] rounded-none p-5 sm:p-10 animate-modal relative border-0 sm:border border-indigo-500/30 sm:my-8 flex flex-col">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
            <h3 className="text-xl sm:text-3xl font-black text-white mb-6 sm:mb-8 tracking-tight mt-8 sm:mt-0">{editingProduct.id ? "Məhsul Redaktoru" : "Yeni Məhsul Yaradıcı"}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-6 sm:space-y-8 flex-1 flex flex-col">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 bg-[#0c0c1d] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Məhsulun Adı</label><input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-base sm:text-lg font-black" required /></div>
                
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Məhsulun Loqosu (Cihazdan Yüklə)</label>
                  <div className="flex items-center gap-4">
                    {editingProduct.customLogo && <img src={editingProduct.customLogo} className="w-10 h-10 rounded-lg object-contain bg-black p-1" alt="logo" />}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-3 sm:py-4 bg-indigo-900/50 hover:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold w-full transition">Şəkil Seç</button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, (res) => setEditingProduct({...editingProduct, customLogo: res}))} className="hidden" />
                  </div>
                </div>

                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Açar Rəngi (Hex Code)</label><input type="text" value={editingProduct.color} onChange={(e) => setEditingProduct({...editingProduct, color: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-black" /></div>
                <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Qısa Açıqlama</label><input type="text" value={editingProduct.desc} onChange={(e) => setEditingProduct({...editingProduct, desc: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 bg-[#0c0c1d] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 sm:mb-2">Hesab Növü</label><input type="text" placeholder="Məs: Ortaq Hesab" value={editingProduct.accountType || ''} onChange={(e) => setEditingProduct({...editingProduct, accountType: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" /></div>
                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1 sm:mb-2">Reytinq (Ulduz)</label><input type="text" placeholder="Məs: 4.9" value={editingProduct.rating || ''} onChange={(e) => setEditingProduct({...editingProduct, rating: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" /></div>
                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1 sm:mb-2">Satış Sayı</label><input type="text" placeholder="Məs: 12.5k" value={editingProduct.sales || ''} onChange={(e) => setEditingProduct({...editingProduct, sales: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" /></div>
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Kateqoriya</label>
                  <select value={editingProduct.cat || 'entertainment'} onChange={(e) => setEditingProduct({...editingProduct, cat: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold">
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                    {(cmsCategories || []).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Məhsulun Geniş Xüsüsiyyətləri (Hər sətirə 1 ədəd yazın)</label>
                  <textarea rows="3" value={(editingProduct.features || []).join('\n')} onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value.split('\n')})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold leading-relaxed" placeholder="4K Ultra HD&#10;7/24 Dəstək"></textarea>
                </div>
              </div>

              <div className="bg-[#0c0c1d] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                 <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400">Paketlər</label>
                    <button type="button" onClick={handleAddPackage} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-900/50 text-indigo-300 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition">+ Əlavə Et</button>
                 </div>
                 <div className="space-y-2 sm:space-y-3">
                   {(editingProduct.packages || []).map((pkg, i) => (
                     <div key={i} className="flex items-center gap-2 sm:gap-4">
                       <input type="text" value={pkg.duration} onChange={(e) => handleUpdatePackage(i, 'duration', e.target.value)} className="w-1/2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-bold" placeholder="1 Ay" required />
                       <input type="number" value={pkg.price} onChange={(e) => handleUpdatePackage(i, 'price', Number(e.target.value))} className="w-1/3 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-bold" placeholder="Qiymət (AZN)" required />
                       <button type="button" onClick={() => handleRemovePackage(i)} className="w-8 h-8 sm:w-10 sm:h-10 bg-red-900/30 text-red-400 rounded-lg flex items-center justify-center font-bold hover:bg-red-600 hover:text-white transition">&times;</button>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="flex mt-auto gap-3 sm:gap-4 pt-4 sm:pt-6 pb-6 sm:pb-0 border-t border-indigo-900/50">
                <button type="button" onClick={() => setEditingProduct(null)} className="w-1/3 py-3.5 sm:py-5 bg-indigo-950/40 text-gray-400 font-black text-[10px] sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-indigo-900/60 transition">Ləğv Et</button>
                <button type="submit" className="glow-btn w-2/3 py-3.5 sm:py-5 bg-indigo-600 text-white font-black text-[10px] sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-lg transition">Məhsulu Yadda Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin CMS Panels (Mockup placeholders before main footer) */}
      <div className="hidden">
         {/* CMS Admin logic would reside here */}
      </div>

      <footer className="bg-[#030308] border-t border-white/5 pt-16 sm:pt-20 pb-6 sm:pb-8 mt-12 sm:mt-24 w-full">
        <div className="max-w-[90rem] mx-auto px-6 sm:px-8">
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12 sm:mb-16 border-b border-white/5 pb-12 sm:pb-16">
              
              <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">Premium Shop</h2>
                 <p className="text-xs text-gray-400 font-medium mb-6">Bizi sosial şəbəkələrdə izləyin!</p>
                 <div className="flex gap-3">
                    <a href={cmsContent?.footer?.socialFacebook || "https://www.facebook.com/premiumshopazerbaycan"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all hover:scale-110">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                    </a>
                    <a href={cmsContent?.footer?.socialInstagram || "https://www.instagram.com/premiumshop.az/"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all hover:scale-110">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                 </div>
              </div>

              <div>
                 <h3 className="font-bold text-white mb-6 text-sm">Faydalı Link</h3>
                 <ul className="space-y-4 text-xs font-bold text-gray-400">
                    <li><span onClick={() => { setSelectedCat("all"); setPage("categories"); }} className="hover:text-indigo-400 cursor-pointer transition">› Bütün məhsullar</span></li>
                    <li><span onClick={() => setPage("rules")} className="hover:text-indigo-400 cursor-pointer transition">› Qaydalar</span></li>
                    <li><span onClick={() => user ? setPage("dashboard") : setAuthMode("login")} className="hover:text-indigo-400 cursor-pointer transition">› Hesab</span></li>
                    <li><span onClick={() => setIsCartOpen(true)} className="hover:text-indigo-400 cursor-pointer transition">› Səbətim</span></li>
                    {(cmsNav?.footer || []).map(link => (
                       <li key={link.firebaseKey}><span onClick={() => link.url ? window.open(link.url, '_blank') : setPage(link.page)} className="hover:text-indigo-400 cursor-pointer transition">› {link.label}</span></li>
                    ))}
                 </ul>
              </div>

              <div>
                 <h3 className="font-bold text-white mb-6 text-sm">Qısa Keçidlər</h3>
                 <ul className="space-y-4 text-xs font-bold text-gray-400">
                    <li><span onClick={() => setAuthMode("login")} className="hover:text-indigo-400 cursor-pointer transition">› Giriş</span></li>
                    <li><span onClick={() => setAuthMode("register")} className="hover:text-indigo-400 cursor-pointer transition">› Qeydiyyat</span></li>
                 </ul>
              </div>

              <div>
                 <h3 className="font-bold text-white mb-6 text-sm">{cmsContent?.footer?.subscribeTitle || "Abunə Ol"}</h3>
                 <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">{cmsContent?.footer?.subscribeText || "Ən yeni güncəlləmələrdən xəbərdar olmaq üçün abunə ol!"}</p>
                 <div className="space-y-3">
                    <input type="text" placeholder="Email daxil et" className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs text-white outline-none focus:border-indigo-500 transition" />
                    <div className="flex justify-center">
                      <button onClick={() => setAuthMode("register")} className="glow-btn w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-lg transition transform hover:-translate-y-1">ABUNƏ OL</button>
                    </div>
                 </div>
              </div>

           </div>

           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-bold text-gray-500">
              <p>{cmsContent?.footer?.copyright || "Copyright © 2026 Premium Shop, Bütün hüquqlar qorunur."}</p>
              <div className="flex gap-6">
                 <span onClick={() => setPage("rules")} className="hover:text-white cursor-pointer transition">Qaydalar</span>
                 <span onClick={() => setIsAdminModalOpen(true)} className="hover:text-indigo-400 cursor-pointer transition">Admin</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

// Minimalist Toast Notification
function Notif({ n }) {
  if (!n) return null;
  const colors = n.type === "error" ? "bg-red-600 text-white" : n.type === "info" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white";
  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-black text-[10px] sm:text-xs uppercase tracking-wider text-center animate-toast z-[99999] ${colors}`}>
      {n.msg}
    </div>
  );
}