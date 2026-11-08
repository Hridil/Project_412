import React from 'react';
import { clsBtnSecondary, clsBtnDanger } from '../../data/constants.js';

export default function ProfileMenu({
  U,
  S,
  userAvatar,
  avatarInputRef,
  setProfileMenuOpen,
  handleRemoveAvatar,
  acc,
  streak,
  myC,
  go,
  logout,
  T
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#14292a] border border-[#dde7e3] dark:border-[#23403f] shadow-2xl z-50 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#14302c] dark:text-[#e3efec]">
        {/* Header / Picture update */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#dde7e3] dark:border-[#23403f]">
          <div className="relative group shrink-0">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-16 h-16 rounded-full overflow-hidden bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-2xl shadow-sm ring-2 ring-teal-700/30 cursor-pointer"
              title="Click to upload/change photo"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={U.name} className="w-full h-full object-cover" />
              ) : (
                <span>{U.name.replace('Dr. ', '')[0]}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-md transition cursor-pointer"
              title="Upload / change picture"
            >
              <span className="material-symbols-outlined text-[13px]">photo_camera</span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-serif font-bold text-base m-0 truncate">{U.name}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e3f1ee] dark:bg-[#173b3a] text-teal-800 dark:text-teal-200 capitalize">
                {U.role}
              </span>
            </div>
            <div className="text-xs text-[#5f7571] dark:text-[#8fa8a3] truncate mt-0.5">{U.email}</div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">upload</span>
                {userAvatar ? 'Change Photo' : 'Upload Photo'}
              </button>
              {userAvatar && (
                <>
                  <span className="text-[#5f7571] dark:text-[#8fa8a3]">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs font-semibold text-[#b3392a] dark:text-[#f4a496] hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Overview Section */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f7571] dark:text-[#8fa8a3]">
              {U.role === 'consultant' ? 'Practitioner Overview' : 'Client Sanctuary Overview'}
            </span>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">Active Profile</span>
          </div>

          {U.role === 'consultant' ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Active Clients</div>
                <div className="font-serif text-lg font-bold text-teal-900 dark:text-teal-200 mt-0.5">{acc().length}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Pending Triage</div>
                <div className="font-serif text-lg font-bold text-[#e9b44c] mt-0.5">
                  {S.cl.filter((c) => c.status === 'Pending').length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Upcoming</div>
                <div className="font-serif text-lg font-bold text-[#6c8ebf] mt-0.5">
                  {S.ap.filter((a) => a.date >= T()).length} sessions
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Vault Documents</div>
                <div className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] mt-0.5">{S.fl.length} files</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Intake Status</div>
                <div className="font-serif text-base font-bold text-teal-900 dark:text-teal-200 mt-0.5">
                  {myC()?.status || 'Pending'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Mindful Streak</div>
                <div className="font-serif text-lg font-bold text-[#e9b44c] mt-0.5">{streak(U.id)} Days</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Care Goals</div>
                <div className="font-serif text-lg font-bold text-[#6c8ebf] mt-0.5">
                  {S.pl.filter((p) => p.uid === U.id && p.done).length} / {S.pl.filter((p) => p.uid === U.id).length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f2f5f3] dark:bg-[#0d1b1a] border border-[#dde7e3] dark:border-[#23403f]">
                <div className="text-[10px] text-[#5f7571] dark:text-[#8fa8a3] font-semibold uppercase">Documents</div>
                <div className="font-serif text-lg font-bold text-[#14302c] dark:text-[#e3efec] mt-0.5">
                  {S.fl.filter((f) => f.uid === U.id).length} files
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#dde7e3] dark:border-[#23403f] flex items-center justify-between gap-2">
          <button
            type="button"
            className={`${clsBtnSecondary} text-xs py-1.5 px-3 flex-1 justify-center cursor-pointer`}
            onClick={() => {
              setProfileMenuOpen(false);
              go(U.role === 'client' ? 'cl-home' : 'c-home');
            }}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Overview
          </button>
          <button
            type="button"
            className={`${clsBtnDanger} text-xs py-1.5 px-3 flex-1 justify-center cursor-pointer`}
            onClick={() => {
              setProfileMenuOpen(false);
              logout();
            }}
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
