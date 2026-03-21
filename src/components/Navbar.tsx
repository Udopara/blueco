import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((name) => name.charAt(0))
        .join('')
    : '';

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <div className="">
          <Logo />
        </div>
        <div className="hidden md:flex font-semibold">
          {profile?.role === "worker" && (
            <ul className="flex items-center gap-6">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Jobs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/applications"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  My Applications
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/saved-jobs"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Saved
                </NavLink>
              </li>
            </ul>
          )}
          {profile?.role === "employer" && (
            <ul className="flex items-center gap-6">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/jobs/new"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Post a Job
                </NavLink>
              </li>
            </ul>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <BellIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{profile?.full_name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="md:hidden">
                      {profile?.role === "employer" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => navigate("/dashboard")}
                          >
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/jobs/new")}
                          >
                            Post a Job
                          </DropdownMenuItem>
                        </>
                      )}
                      {profile?.role === "worker" && (
                        <>
                          <DropdownMenuItem onClick={() => navigate("/")}>
                            Jobs
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/applications")}
                          >
                            My Applications
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/saved-jobs")}
                          >
                            Saved Jobs
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                    </div>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary"
                    : "text-gray-600 hover:text-gray-800"
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary"
                    : "text-gray-600 hover:text-gray-800"
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
