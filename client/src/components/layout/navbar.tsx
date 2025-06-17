import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChartLine, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { FundryLogo } from "@/components/ui/fundry-logo";
import { queryClient } from "@/lib/queryClient";
import NotificationDropdown from "@/components/notifications/notification-dropdown";

interface NavbarProps {
  title?: string;
  showNotifications?: boolean;
  actions?: React.ReactNode;
}

export default function Navbar({ title, showNotifications = true, actions }: NavbarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    // Clear the React Query cache before logout
    queryClient.clear();
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getNavLinks = () => {
    if (user?.userType === "founder") {
      return [
        { href: "/founder/dashboard", label: "Dashboard", active: location === "/founder/dashboard" },
        { href: "/founder/campaigns", label: "Campaigns", active: location.startsWith("/founder/campaigns") },
        { href: "/founder/investors", label: "Investors", active: location.startsWith("/founder/investors") },
        { href: "/founder/analytics", label: "Analytics", active: location.startsWith("/founder/analytics") },
      ];
    } else {
      return [];
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <FundryLogo className="h-10 w-auto" />
            
            {!title && (
              <div className="hidden md:flex space-x-6">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors pb-4 ${
                      link.active
                        ? "text-fundry-orange font-medium border-b-2 border-fundry-orange"
                        : "text-gray-700 hover:text-fundry-orange"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {actions}
            
            {showNotifications && <NotificationDropdown />}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback className="bg-fundry-orange text-white text-sm">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
