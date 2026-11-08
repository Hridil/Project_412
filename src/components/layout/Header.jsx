import React from 'react';
import ProfileMenu from './ProfileMenu.jsx';

export default function Header({
  U,
  S,
  currentPageTitle,
  sideOpen,
  setSideOpen,
  dark,
  toggleTheme,
  go,
  unreadCount,
  userAvatar,
  avatarInputRef,
  profileMenuOpen,
  setProfileMenuOpen,
  handleAvatarUpload,
  handleRemoveAvatar,
  acc,
  streak,
  myC,
  logout,
  T
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/90 dark:bg-[#14292a]/90 backdrop-blur-md border-b border-[#dde7e3] dark:border-[#23403f]">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-center text-teal-800 dark:text-teal-200"
          onClick={() => setSideOpen(!sideOpen)}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#14302c] dark:text-[#e3efec]">
          {currentPageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Crisis Support Pill */}
        <a
          href="tel:988"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde8e4] text-[#b3392a] dark:bg-[#3b1f1b] dark:text-[#f4a496] text-xs font-semibold hover:opacity-90 transition"
          title="24/7 Lifeline Support"
        >
          <span className="material-symbols-outlined text-[16px]">emergency</span>
          <span>24/7 Crisis (988)</span>
        </a>

        {/* Dark mode toggle */}
        <button
          className="w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-center text-teal-800 dark:text-teal-200 transition hover:scale-105"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notifications bell */}
        <button
          className="w-9 h-9 rounded-xl bg-[#e3f1ee] dark:bg-[#173b3a] flex items-center justify-center text-teal-800 dark:text-teal-200 relative transition hover:scale-105"
          onClick={() => go(U.role === 'client' ? 'cl-notif' : 'c-notif')}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e07a5f] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-[#dde7e3] dark:bg-[#23403f]" />

        {/* User Profile Pill & Overview Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-2xl hover:bg-[#e3f1ee] dark:hover:bg-[#173b3a] transition cursor-pointer group border border-transparent hover:border-[#dde7e3] dark:hover:border-[#23403f]"
            aria-label="User Profile and Overview"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-teal-700 dark:bg-teal-400 text-white dark:text-[#052321] flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-teal-700/20 dark:ring-teal-400/20 group-hover:ring-teal-700 dark:group-hover:ring-teal-400 transition-all shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt={U.name} className="w-full h-full object-cover" />
              ) : (
                <span>{U.name.replace('Dr. ', '')[0]}</span>
              )}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <span className="material-symbols-outlined text-[15px]">photo_camera</span>
              </div>
            </div>
            <div className="hidden md:block leading-tight text-left">
              <div className="text-xs font-bold text-[#14302c] dark:text-[#e3efec] group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors flex items-center gap-0.5">
                <span>{U.name}</span>
                <span className="material-symbols-outlined text-[16px] text-[#5f7571] dark:text-[#8fa8a3]">expand_more</span>
              </div>
              <div className="text-[11px] text-[#5f7571] dark:text-[#8fa8a3] capitalize">{U.role}</div>
            </div>
          </button>

          {/* Hidden Avatar File Input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          {profileMenuOpen && (
            <ProfileMenu
              U={U}
              S={S}
              userAvatar={userAvatar}
              avatarInputRef={avatarInputRef}
              setProfileMenuOpen={setProfileMenuOpen}
              handleRemoveAvatar={handleRemoveAvatar}
              acc={acc}
              streak={streak}
              myC={myC}
              go={go}
              logout={logout}
              T={T}
            />
          )}
        </div>
      </div>
    </header>
  );
}
