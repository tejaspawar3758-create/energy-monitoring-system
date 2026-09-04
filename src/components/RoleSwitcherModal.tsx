import React, { useState } from 'react';
import { useEnergy } from '../context/EnergyContext';
import { Shield, UserCheck, Eye, Key, CheckCircle, X, Sparkles, Building, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser, login, logout, allBlocks, blocks, isDarkMode } = useEnergy();
  const [activeTab, setActiveTab] = useState<'quick' | 'login'>('quick');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleQuickSwitch = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setLoginError('Please enter username');
      return;
    }
    if (!passwordInput.trim()) {
      setLoginError('Please enter password');
      return;
    }
    const success = login(usernameInput.trim(), passwordInput.trim());
    if (success) {
      setLoginError('');
      onClose();
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />;
      case 'block_incharge':
        return <UserCheck className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />;
      case 'viewer':
        return <Eye className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />;
    }
  };

  const getBlockName = (assignedBlockId?: string) => {
    if (!assignedBlockId || assignedBlockId === 'ALL') return 'All Blocks (Dept Wide)';
    const available = allBlocks || blocks;
    const b = available.find((blk) => blk.id === assignedBlockId);
    return b ? b.name : assignedBlockId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isDarkMode ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                User & Role Management
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Switch between Electrical Engineer roles to test permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`flex border-b px-6 pt-2 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-100/60'
        }`}>
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'quick'
                ? isDarkMode ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-blue-600 text-blue-700 font-bold'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            1-Click Demo Roles
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? isDarkMode ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-blue-600 text-blue-700 font-bold'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            Username & Password Login
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'quick' ? (
            <div className="space-y-3">
              <p className={`text-xs mb-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Select a user account to simulate role-based authorization:
              </p>

              {users.map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSwitch(user.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between group cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-cyan-950/50 border-cyan-500/70 ring-1 ring-cyan-500/40 shadow-xs'
                          : 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
                          : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-lg border ${
                        isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold transition-colors ${
                            isSelected
                              ? isDarkMode ? 'text-cyan-300' : 'text-blue-800'
                              : isDarkMode ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-blue-700'
                          }`}>
                            {user.name}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                            isDarkMode
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}>
                            @{user.username}
                          </span>
                        </div>
                        <p className={`text-xs font-medium mt-0.5 ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {user.designation}
                        </p>
                        <div className={`flex items-center gap-2 mt-1.5 text-[11px] ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <span className="flex items-center gap-1 font-medium">
                            <Building className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                            {getBlockName(user.assignedBlockId)}
                          </span>
                          <span>•</span>
                          <span className={`capitalize font-semibold ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-800'
                          }`}>
                            {user.role === 'admin'
                              ? 'Full Read/Write/Admin'
                              : user.role === 'block_incharge'
                              ? 'Block Read/Write'
                              : 'Read Only'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${
                        isDarkMode
                          ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                          : 'text-blue-700 bg-blue-100 border-blue-300 shadow-xs'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Username / ID
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. Tejas, incharge_a, incharge_b, viewer"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs'
                  }`}
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 max-h-36 overflow-y-auto ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <p className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                  Active User Accounts & Usernames:
                </p>
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-xs py-0.5">
                    <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </span>
                    <span className={`font-mono px-1.5 py-0.5 rounded border text-[11px] font-bold ${
                      isDarkMode
                        ? 'text-cyan-400 bg-slate-900 border-slate-800'
                        : 'text-blue-700 bg-white border-slate-300'
                    }`}>
                      @{u.username}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                }`}
              >
                Sign In to Department Portal
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
          <button
            onClick={onClose}
            className={`font-semibold cursor-pointer transition-colors ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
