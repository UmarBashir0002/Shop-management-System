import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // Added useNavigate
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../store/uiSlice";
import { logout } from "../../store/authSlice"; // Import the logout action
import { 
  HomeIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  PrinterIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast"; // Recommended for feedback

export default function DashboardLayout({ children }) {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);
  const user = useSelector((s) => s.auth.user); // Get user data from store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    navigate("/login"); // Redirect to login page
  };

  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: HomeIcon },
    { name: "Items", to: "/products", icon: CubeIcon },
    { name: "Orders", to: "/orders", icon: ShoppingCartIcon },
    { name: "Categories", to: "/categories", icon: PrinterIcon },
    { name: "Settings", to: "/settings/profile", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* --- SIDEBAR --- */}
      <aside 
        className={`bg-[#0F172A] text-slate-300 fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shadow-2xl ${
          sidebarOpen ? "w-64" : "w-20"
        } lg:relative`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-xl text-white tracking-tight">Computer</span>}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                  : "hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <item.icon className={`w-6 h-6 flex-shrink-0 ${sidebarOpen ? "" : "mx-auto"}`} />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
              {!sidebarOpen && (
                <div className="absolute left-20 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* --- TOPBAR --- */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <button 
            onClick={() => dispatch(toggleSidebar())} 
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-slate-500">{user?.role || 'Super Admin'}</span>
            </div>
            <div className="relative group">
              <UserCircleIcon className="w-10 h-10 text-slate-300 cursor-pointer hover:text-indigo-600 transition-colors" />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                <Link to="/settings/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Your Profile</Link>
                <hr className="my-1 border-slate-100" />
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}