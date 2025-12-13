// client/src/components/MainNav.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import { User, ChevronDown } from "lucide-react";

function MainNav() {
  const carts = useEcomStore((s) => s.carts);
  const user = useEcomStore((s) => s.user);
  const logout = useEcomStore((s) => s.logout);

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to={"/"}>
              <img src="/LOGO.png" alt="Website Logo" className="w-20 h-auto" />
            </Link>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium "
              }
              to={"/"}
            >
              Home
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium "
              }
              to={"/shop"}
            >
              Shop
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium relative"
                  : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium relative"
              }
              to={"/cart"}
            >
              Cart
              {carts.length > 0 && (
                <span className="absolute top-0 -right-2 bg-red-500 rounded-full px-2 text-white text-xs">
                  {carts.length}
                </span>
              )}
            </NavLink>
          </div>

          {user ? (
            <div className="flex items-center gap-4 relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-between gap-3 hover:bg-gray-200 px-3 py-2 rounded-full border border-gray-100 transition duration-150 shadow-sm min-w-[160px]"
              >
                <div className="flex items-center gap-2">
                  {/* ส่วนรูปภาพ */}
                  {user.picture ? (
                    <img
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      src={user.picture}
                      alt="Profile"
                      onError={(e) => {
                        e.target.onError = null;
                        e.target.src =
                          "https://cdn.iconscout.com/icon/free/png-512/free-avatar-icon-download-in-svg-png-gif-file-formats--user-professor-avatars-flat-icons-pack-people-456317.png?f=webp&w=256";
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                      <User size={20} />
                    </div>
                  )}

                  <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">
                    {user.name || user.email}
                  </span>
                </div>

                <ChevronDown size={18} className="text-gray-500" />
              </button>

              {isOpen && (
                <div className="absolute top-16 right-0 bg-white shadow-md z-50 w-48 rounded-md overflow-hidden border border-gray-100">
                  <Link
                    to={"/user/profile"}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-200 border-b text-sm"
                  >
                    Profile
                  </Link>

                  <Link
                    to={"/user/history"}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-200 text-sm"
                  >
                    History
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-200 w-full text-left text-sm text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium "
                }
                to={"/register"}
              >
                Register
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium "
                }
                to={"/login"}
              >
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default MainNav;
