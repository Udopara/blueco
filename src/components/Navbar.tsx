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
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="container mx-auto flex items-center justify-between py-3">
        <div className="">
          <Logo />
        </div>
        <div className="hidden md:flex font-medium text-sm">
          {profile?.role === "worker" && (
            <ul className="flex items-center gap-1">
              {[
                { to: "/", label: "Jobs" },
                { to: "/applications", label: "My Applications" },
                { to: "/saved-jobs", label: "Saved" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      isActive
                        ? "relative px-3 py-1.5 rounded-md text-primary bg-primary/8 font-semibold"
                        : "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
          {profile?.role === "employer" && (
            <ul className="flex items-center gap-1">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/jobs/new", label: "Post a Job" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      isActive
                        ? "px-3 py-1.5 rounded-md text-primary bg-primary/8 font-semibold"
                        : "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
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
