import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { sendCodeApi, sendRegisterCodeApi } from '@/features/auth/api';

type Mode = 'password' | 'code' | 'register';

export default function Login() {
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login, loginWithCode, register } = useAuthStore();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    if (countdown > 0 || !email) return;
    setError('');
    try {
      if (mode === 'register') {
        await sendRegisterCodeApi(email);
      } else {
        await sendCodeApi(email);
      }
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    }
  }, [email, countdown, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(username, email, code);
      } else if (mode === 'code') {
        await loginWithCode(email, code);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setCode('');
    setPassword('');
    setUsername('');
  };

  const isLoginTab = mode === 'password' || mode === 'code';

  return (
    <div className="min-h-screen flex items-center justify-center relative font-body">
      {/* Background */}
      <div className="app-bg" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div className="blob blob-1 animate-blob" />
        <div className="blob blob-2 animate-blob-reverse" />
        <div className="blob blob-3 animate-blob-slow" />
      </div>

      <div className="w-full max-w-sm p-8 glass-heavy rounded-2xl animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="#3b82f6" strokeWidth="1.8" />
              <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold text-slate-800">
            {mode === 'register' ? '创建账号' : '欢迎回来'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'register' ? '注册以开始使用 Smart Todo' : '登录到 Smart Todo'}
          </p>
        </div>

        {/* Login mode tabs */}
        {isLoginTab && (
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => switchMode('password')}
              className={`flex-1 py-2 text-sm rounded-xl transition-all ${
                mode === 'password'
                  ? 'glass-btn font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              密码登录
            </button>
            <button
              type="button"
              onClick={() => switchMode('code')}
              className={`flex-1 py-2 text-sm rounded-xl transition-all ${
                mode === 'code'
                  ? 'glass-btn font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              验证码登录
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={20}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                placeholder="2-20 个字符"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              placeholder="you@example.com"
            />
          </div>

          {mode === 'code' || mode === 'register' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-sm tracking-widest"
                  placeholder="6 位验证码"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || !email}
                  className="px-3 py-2.5 text-sm rounded-xl glass-btn whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                placeholder="至少 8 位"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-400/10 px-3 py-2 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 glass-btn rounded-xl text-sm font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" className="opacity-30" />
                  <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                处理中
              </span>
            ) : mode === 'register' ? '注册' : '登录'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          {isLoginTab ? '没有账号？' : '已有账号？'}
          <button
            type="button"
            onClick={() => switchMode(isLoginTab ? 'register' : 'password')}
            className="ml-1 text-accent hover:text-accent-dark font-medium transition-colors"
          >
            {isLoginTab ? '去注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
