'use client';

import { useState } from 'react';
import { updateProfile } from '../lib/authApi';
import { X, User, Lock, Save, Loader2 } from 'lucide-react';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  onUpdateSuccess: (updatedUser: any) => void;
}

export default function UpdateProfileModal({ isOpen, onClose, currentUser, onUpdateSuccess }: UpdateProfileModalProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // 비밀번호를 수정하려고 시도하는 경우 검증
    const isChangingPassword = newPassword.trim().length > 0;
    if (isChangingPassword) {
      if (!currentPassword.trim()) {
        setError('비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.');
        return;
      }
      if (newPassword !== newPasswordConfirm) {
        setError('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      if (newPassword.length < 8) {
        setError('새 비밀번호는 8자 이상이어야 합니다.');
        return;
      }
    }

    // 이름 및 비밀번호 수정 중 변경사항이 없는 경우 체크
    const isNameChanged = name.trim() !== (currentUser.name || '').trim();
    if (!isNameChanged && !isChangingPassword) {
      setError('변경할 항목이 없습니다. 이름 또는 비밀번호를 수정해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // API 호출
      // 이름 변경값 또는 새 비밀번호가 없으면 undefined로 처리되어 기존 값을 유지하게 됩니다.
      const updatedData = await updateProfile(
        isNameChanged ? name.trim() : undefined,
        isChangingPassword ? currentPassword : undefined,
        isChangingPassword ? newPassword : undefined
      );

      // localStorage 갱신을 위해 기존 user 데이터 로드 후 머지
      const savedUserStr = localStorage.getItem('user');
      let updatedUser = { ...currentUser };
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        updatedUser = {
          ...savedUser,
          name: updatedData.name,
          avatar: updatedData.avatar,
        };
      } else {
        updatedUser = {
          ...updatedUser,
          name: updatedData.name,
          avatar: updatedData.avatar,
        };
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccessMsg('개인정보가 성공적으로 변경되었습니다!');
      setTimeout(() => {
        onUpdateSuccess(updatedUser);
        onClose();
        // 비밀번호 필드 초기화
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || '개인정보 변경 중 오류가 발생했습니다. 현재 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 flex justify-center items-center z-50 p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/95 text-white rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden relative transform scale-100 transition-all duration-300 flex flex-col p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-slate-800/80 rounded-full z-10"
        >
          <X size={20}/>
        </button>

        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl mb-3 border border-indigo-500/20">
            <User className="text-indigo-400" size={32} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            개인정보 변경
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">이메일(아이디)을 제외한 프로필 정보를 수정합니다.</p>
        </div>

        {/* Message Panel */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-red-200 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-950/50 border border-green-500/30 rounded-lg text-green-200 text-xs font-medium">
            ✓ {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {/* Email (Readonly) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              이메일 주소 (아이디 변경 불가)
            </label>
            <input
              type="text"
              value={currentUser.email}
              disabled
              className="w-full bg-slate-950/30 border border-slate-800 text-slate-500 rounded-xl py-2.5 px-4 font-semibold text-sm cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              이름 (닉네임)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                placeholder={currentUser.name || '이름 입력'}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="border-t border-slate-800/60 my-4 pt-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-3">
              비밀번호 변경 (필요 시에만 입력)
            </span>

            {/* Current Password */}
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                현재 비밀번호 {newPassword.trim() && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  placeholder="현재 비밀번호를 입력해 주세요"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                새 비밀번호
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  placeholder="새로운 비밀번호를 입력해 주세요"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* New Password Confirm */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  placeholder="새로운 비밀번호를 다시 입력해 주세요"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                변경 중...
              </>
            ) : (
              <>
                <Save size={16} />
                개인정보 변경 적용
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
