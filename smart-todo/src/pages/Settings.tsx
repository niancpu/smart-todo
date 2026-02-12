import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { useAuthStore } from '@/features/auth/store';
import { useBoardConfig, useUpdateBoardConfig, useDeleteColumn } from '@/features/board/hooks';
import {
  getProfileApi,
  updateUsernameApi,
  sendChangeEmailCodeApi,
  changeEmailApi,
  setPasswordApi,
  type ProfileResponse,
} from '@/features/auth/api';
import type { Priority, Category, BoardColumn } from '@/types';

const STORAGE_KEY_PRIORITY = 'smart-todo-default-priority';
const STORAGE_KEY_CATEGORY = 'smart-todo-default-category';
const STORAGE_KEY_MINI_STATUSES = 'smart-todo-mini-board-statuses';

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'work', label: '工作' },
  { value: 'personal', label: '个人' },
  { value: 'health', label: '健康' },
  { value: 'study', label: '学习' },
  { value: 'shopping', label: '购物' },
  { value: 'other', label: '其他' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [defaultPriority, setDefaultPriority] = useState<Priority>(() =>
    (localStorage.getItem(STORAGE_KEY_PRIORITY) as Priority) || 'medium'
  );
  const [defaultCategory, setDefaultCategory] = useState<Category>(() =>
    (localStorage.getItem(STORAGE_KEY_CATEGORY) as Category) || 'other'
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  // Board config
  const boardConfig = useBoardConfig();
  const updateBoardConfig = useUpdateBoardConfig();
  const deleteColumn = useDeleteColumn();
  const [newColumnName, setNewColumnName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const defaultColumnIds = ['todo', 'doing', 'done', 'dropped'];

  // Profile state
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);

  // Email change
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailSaving, setEmailSaving] = useState(false);

  // Password
  const [settingPassword, setSettingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRIORITY, defaultPriority);
  }, [defaultPriority]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORY, defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    getProfileApi()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    if (emailCountdown <= 0) return;
    const timer = setInterval(() => setEmailCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [emailCountdown]);

  const showMsg = useCallback((msg: string) => {
    setProfileMsg(msg);
    setProfileErr('');
    setTimeout(() => setProfileMsg(''), 2000);
  }, []);

  const showErr = useCallback((msg: string) => {
    setProfileErr(msg);
    setProfileMsg('');
  }, []);

  const handleClearAll = async () => {
    await db.tasks.clear();
    setShowClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const handleSaveUsername = async () => {
    if (!newUsername || newUsername.length < 2 || newUsername.length > 20) return;
    setUsernameSaving(true);
    setProfileErr('');
    try {
      const res = await updateUsernameApi(newUsername);
      setProfile((p) => p ? { ...p, username: res.username } : p);
      setEditingUsername(false);
      showMsg('用户名已更新');
    } catch (err: any) {
      showErr(err.message || '修改失败');
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (emailCountdown > 0 || !newEmail) return;
    setProfileErr('');
    try {
      await sendChangeEmailCodeApi(newEmail);
      setEmailCountdown(60);
    } catch (err: any) {
      showErr(err.message || '发送验证码失败');
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !emailCode) return;
    setEmailSaving(true);
    setProfileErr('');
    try {
      const res = await changeEmailApi(newEmail, emailCode);
      setProfile((p) => p ? { ...p, email: res.email } : p);
      setChangingEmail(false);
      setNewEmail('');
      setEmailCode('');
      showMsg('邮箱已更新');
    } catch (err: any) {
      showErr(err.message || '换绑失败');
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      showErr('密码至少 8 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErr('两次密码不一致');
      return;
    }
    setPasswordSaving(true);
    setProfileErr('');
    try {
      await setPasswordApi(newPassword, currentPassword || undefined);
      setProfile((p) => p ? { ...p, hasPassword: true } : p);
      setSettingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMsg('密码设置成功');
    } catch (err: any) {
      showErr(err.message || '设置失败');
    } finally {
      setPasswordSaving(false);
    }
  };

  const selectClass = 'px-3 py-1.5 text-sm rounded-xl glass-input';
  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl glass-input text-sm';
  const smallBtnClass = 'px-3 py-1.5 text-sm rounded-xl glass-btn';

  const handleAddColumn = async () => {
    if (!boardConfig || !newColumnName.trim()) return;
    const id = newColumnName.trim().toLowerCase().replace(/\s+/g, '_');
    if (boardConfig.columns.some(c => c.id === id)) return;
    const newCol: BoardColumn = { id, name: newColumnName.trim(), order: boardConfig.columns.length };
    await updateBoardConfig({ ...boardConfig, columns: [...boardConfig.columns, newCol] });
    setNewColumnName('');
  };

  const handleWipChange = async (columnId: string, value: string) => {
    if (!boardConfig) return;
    const wipLimit = value === '' ? undefined : Math.max(1, parseInt(value) || 1);
    const columns = boardConfig.columns.map(c =>
      c.id === columnId ? { ...c, wipLimit } : c
    );
    await updateBoardConfig({ ...boardConfig, columns });
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!boardConfig) return;
    await deleteColumn(boardConfig, columnId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-display font-semibold text-slate-800 animate-fade-in">设置</h1>

      {/* 外观设置 */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          外观
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">主题</p>
            <p className="text-xs text-slate-400 mt-0.5">深色模式即将推出</p>
          </div>
          <select disabled className="px-3 py-1.5 text-sm rounded-xl bg-white/30 border border-white/20 text-slate-400 cursor-not-allowed">
            <option>浅色</option><option>深色</option>
          </select>
        </div>
      </div>

      {/* 默认值设置 */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          默认值
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-600">默认优先级</label>
            <select value={defaultPriority} onChange={(e) => setDefaultPriority(e.target.value as Priority)} className={selectClass}>
              {priorityOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-600">默认分类</label>
            <select value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value as Category)} className={selectClass}>
              {categoryOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* 看板设置 */}
      {boardConfig && (
        <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <rect x="3" y="3" width="5" height="18" rx="1" />
              <rect x="10" y="3" width="5" height="12" rx="1" />
              <rect x="17" y="3" width="5" height="15" rx="1" />
            </svg>
            看板列管理
          </h2>
          <div className="space-y-3">
            {boardConfig.columns
              .sort((a, b) => a.order - b.order)
              .map((col) => (
                <div key={col.id} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-24 truncate">{col.name}</span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-slate-400">WIP上限</label>
                    <input
                      type="number"
                      min="1"
                      value={col.wipLimit ?? ''}
                      onChange={(e) => handleWipChange(col.id, e.target.value)}
                      placeholder="无"
                      className="w-16 px-2 py-1 text-sm rounded-lg glass-input text-center"
                    />
                  </div>
                  {!defaultColumnIds.includes(col.id) && (
                    deleteConfirmId === col.id ? (
                      <div className="flex gap-1.5 ml-auto">
                        <button onClick={() => handleDeleteColumn(col.id)} className="px-2 py-0.5 text-xs text-white bg-red-500 rounded-lg">确认</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-0.5 text-xs text-slate-500 rounded-lg hover:bg-white/40">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(col.id)} className="ml-auto text-xs text-red-400 hover:text-red-500 transition-colors">删除</button>
                    )
                  )}
                </div>
              ))}
            <div className="flex gap-2 pt-2 border-t border-white/15">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="新列名称"
                className="flex-1 px-3 py-1.5 text-sm rounded-xl glass-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              />
              <button onClick={handleAddColumn} disabled={!newColumnName.trim()} className={smallBtnClass + ' disabled:opacity-50'}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 个人信息 */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.125s' }}>
        <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          个人信息
        </h2>

        {profileLoading ? (
          <p className="text-sm text-slate-400">加载中...</p>
        ) : profile ? (
          <div className="space-y-4">
            {/* Feedback messages */}
            {profileMsg && <p className="text-sm text-emerald-500 bg-emerald-400/10 px-3 py-2 rounded-xl">{profileMsg}</p>}
            {profileErr && <p className="text-sm text-red-500 bg-red-400/10 px-3 py-2 rounded-xl">{profileErr}</p>}

            {/* Username */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-xs text-slate-400">用户名</label>
                {editingUsername ? (
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} minLength={2} maxLength={20} className={inputClass + ' flex-1'} placeholder="2-20 个字符" />
                    <button onClick={handleSaveUsername} disabled={usernameSaving} className={smallBtnClass}>{usernameSaving ? '保存中' : '保存'}</button>
                    <button onClick={() => { setEditingUsername(false); setProfileErr(''); }} className="px-3 py-1.5 text-sm text-slate-500 rounded-xl hover:bg-white/40 transition-all">取消</button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 mt-0.5">{profile.username}</p>
                )}
              </div>
              {!editingUsername && (
                <button onClick={() => { setEditingUsername(true); setNewUsername(profile.username); setProfileErr(''); }} className="text-sm text-accent hover:text-accent-dark transition-colors">修改</button>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs text-slate-400">邮箱</label>
                  <p className="text-sm text-slate-700 mt-0.5">{profile.email}</p>
                </div>
                {!changingEmail && (
                  <button onClick={() => { setChangingEmail(true); setProfileErr(''); }} className="text-sm text-accent hover:text-accent-dark transition-colors">换绑</button>
                )}
              </div>
              {changingEmail && (
                <div className="mt-3 space-y-2">
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} placeholder="新邮箱地址" />
                  <div className="flex gap-2">
                    <input type="text" value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className={inputClass + ' flex-1 tracking-widest'} placeholder="6 位验证码" />
                    <button onClick={handleSendEmailCode} disabled={emailCountdown > 0 || !newEmail} className={smallBtnClass + ' whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'}>
                      {emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleChangeEmail} disabled={emailSaving || !emailCode} className={smallBtnClass + ' disabled:opacity-50'}>{emailSaving ? '提交中' : '确认换绑'}</button>
                    <button onClick={() => { setChangingEmail(false); setNewEmail(''); setEmailCode(''); setProfileErr(''); }} className="px-3 py-1.5 text-sm text-slate-500 rounded-xl hover:bg-white/40 transition-all">取消</button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs text-slate-400">密码</label>
                  <p className="text-sm text-slate-700 mt-0.5">{profile.hasPassword ? '已设置' : '未设置'}</p>
                </div>
                {!settingPassword && (
                  <button onClick={() => { setSettingPassword(true); setProfileErr(''); }} className="text-sm text-accent hover:text-accent-dark transition-colors">
                    {profile.hasPassword ? '修改密码' : '设置密码'}
                  </button>
                )}
              </div>
              {settingPassword && (
                <div className="mt-3 space-y-2">
                  {profile.hasPassword && (
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} placeholder="当前密码" />
                  )}
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className={inputClass} placeholder="新密码（至少 8 位）" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} className={inputClass} placeholder="确认新密码" />
                  <div className="flex gap-2">
                    <button onClick={handleSetPassword} disabled={passwordSaving} className={smallBtnClass + ' disabled:opacity-50'}>{passwordSaving ? '提交中' : '确认'}</button>
                    <button onClick={() => { setSettingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setProfileErr(''); }} className="px-3 py-1.5 text-sm text-slate-500 rounded-xl hover:bg-white/40 transition-all">取消</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">无法加载用户信息</p>
        )}
      </div>

      {/* 数据管理 */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          数据管理
        </h2>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)} className="px-4 py-2 text-sm text-red-400 border border-red-200/30 rounded-xl hover:bg-red-50/30 transition-all">
            清空所有任务
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-500">确定要删除所有任务吗？此操作不可撤销</span>
            <button onClick={handleClearAll} className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">确认删除</button>
            <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 text-sm text-slate-500 border border-white/30 rounded-xl hover:bg-white/40 transition-all">取消</button>
          </div>
        )}
        {cleared && <p className="text-sm text-emerald-500 mt-2">所有任务已清空</p>}
      </div>

      {/* 账号 */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.175s' }}>
        <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          账号
        </h2>
        <button
          onClick={async () => { await logout(); navigate('/login'); }}
          className="px-4 py-2 text-sm text-red-500 border border-red-200/30 rounded-xl hover:bg-red-50/30 transition-all"
        >
          退出登录
        </button>
      </div>

      {/* 关于 */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="text-sm font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          关于
        </h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">应用名称</span>
            <span className="text-slate-700 font-display font-medium">Smart Todo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">版本</span>
            <span className="text-slate-700">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">技术栈</span>
            <span className="text-slate-700">Tauri 2.0 + React + TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  );
}
