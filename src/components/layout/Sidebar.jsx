import React from 'react';

export default function Sidebar({
  U,
  page,
  navItems,
  unreadCount,
  sideOpen,
  setSideOpen,
  userAvatar,
  setProfileMenuOpen,
  exportData,
  logout,
  go
}) {
  return (
    <>
      <aside
        className={`w-64 bg-[#0c3b37] dark:bg-[#081f1e] text-[#cfe5e1] p-4 fixed lg:sticky top-0 h-screen flex flex-col justify-between shrink-0 z-30 transition-all duration-300 ${
          sideOpen ? 'left-0' : '-left-64 lg:left-0'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-4 border-b border-teal-800/60">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">spa</span>
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-white leading-none">MindCare Pro</div>
              <span className="text-[10px] uppercase tracking-wider text-teal-300">Sanctuary Portal</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map(([key, label, iconName]) => (
              <button
                key={key}
                className={`flex items-center justify-between w-full text-left rounded-xl px-3.5 py-2.5 text-sm transition cursor-pointer ${
                  key === page
                    ? 'bg-teal-700/60 text-white font-semibold shadow-xs'
                    : 'text-[#b7d3ce] hover:bg-white/10'
                }`}
                onClick={() => go(key)}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                  <span>{label}</span>
                </div>
                {key.includes('notif') && unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e07a5f] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-3 border-t border-teal-800/60">
          <div
            onClick={() => setProfileMenuOpen(true)}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-900/60 hover:bg-teal-900/90 cursor-pointer transition mb-2 group"
            title="Click to view overview & update picture"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-white/20">
              {userAvatar ? (
                <img src={userAvatar} alt={U.name} className="w-full h-full object-cover" />
              ) : (
                <span>{U.name.replace('Dr. ', '')[0]}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <span className="material-symbols-outlined text-[13px]">photo_camera</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate group-hover:text-teal-200 transition-colors">
                {U.name}
              </div>
              <div className="text-[10px] text-teal-300 capitalize">{U.role} · Click to edit</div>
            </div>
          </div>

          <div className="space-y-1">
            <button
              className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2 text-sm text-[#b7d3ce] hover:bg-white/10 transition cursor-pointer"
              onClick={exportData}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Data</span>
            </button>
            <button
              className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2 text-sm text-[#f4a496] hover:bg-[#3b1f1b]/50 transition cursor-pointer"
              onClick={logout}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}
    </>
  );
}
