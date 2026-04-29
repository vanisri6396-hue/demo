import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topnav from './Topnav';

export default function DashboardLayout({ role, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-background text-gray-800 font-sans">
      <Sidebar role={role} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topnav title={title} subtitle={subtitle} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
