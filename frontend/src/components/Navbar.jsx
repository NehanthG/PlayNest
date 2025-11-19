import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fffaf0]/70 backdrop-blur-sm border-b border-[#e7dfd3] shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-linear-to-br from-[#e43f5a] to-[#f77f6e] rounded-full"></div>
          <h1 className="font-semibold text-lg text-[#2b2b2b] tracking-wide">GameVault</h1>
        </div>
        <div className="flex items-center gap-8 text-sm text-[#2b2b2b]/80">
          <Link to="/" className="hover:text-[#2b2b2b] cursor-pointer">Home</Link>
          <Link to="/upload" className="hover:text-[#2b2b2b] cursor-pointer">Upload</Link>
          <Link to="/games" className="hover:text-[#2b2b2b] cursor-pointer">Leaderboard</Link>
          <Link to="/profile" className="ml-2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#fde8d7] text-[#8a5a3b] font-semibold shadow-sm border border-[#efdac6] hover:bg-[#fbdcc2] overflow-hidden">
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} alt="Profile" className="h-full w-full object-cover rounded-full" />
            ) : (
              (authUser?.fullName?.[0] || authUser?.email?.[0] || 'U').toUpperCase()
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 inline-flex items-center justify-center h-9 px-3 rounded-full bg-[#ffe7d2] text-[#8a5a3b] font-medium shadow-sm border border-[#efdac6] hover:bg-[#ffdcbf]"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
