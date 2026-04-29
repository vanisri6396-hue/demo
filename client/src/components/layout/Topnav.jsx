import { Search, Bell, HelpCircle } from 'lucide-react';

export default function Topnav({ title, subtitle }) {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

  return (
    <header className="h-[70px] px-8 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex flex-col">
        {title && <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>}
        {subtitle && <p className="text-[13px] text-gray-500 font-semibold uppercase tracking-wider">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search activities..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all w-64 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <HelpCircle size={20} />
          </button>
          
          <div className="flex items-center gap-3 ml-2 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
