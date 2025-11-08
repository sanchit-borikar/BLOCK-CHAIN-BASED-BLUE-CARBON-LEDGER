import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Waves, 
  Menu, 
  Home, 
  BarChart3, 
  FileUp, 
  ShoppingCart, 
  History, 
  User, 
  Info,
  LogOut,
  Heart,
  Building,
  X
} from "lucide-react";

export type UserRole = 'ngo' | 'mnc';

interface NavigationProps {
  userRole?: UserRole;
  onSignOut?: () => void;
}

const Navigation = ({ userRole, onSignOut }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const getNavigation = () => {
    const dashboardHref = userRole === 'ngo' ? '/ngo-dashboard' : userRole === 'mnc' ? '/mnc-dashboard' : '/dashboard';
    
    return [
      { name: "Dashboard", href: dashboardHref, icon: BarChart3 },
      { name: "Submit Project", href: "/projects/submit", icon: FileUp },
      { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
      { name: "Transactions", href: "/transactions", icon: History },
      { name: "Profile", href: "/profile", icon: User },
      { name: "About", href: "/about", icon: Info },
    ];
  };

  const navigation = getNavigation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center ocean-glow">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Blue Carbon Ledger</span>
          </Link>

          {/* Role Badge */}
          {userRole && (
            <div className="hidden md:flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                {userRole === 'ngo' ? (
                  <>
                    <Heart className="w-3 h-3" />
                    <span>NGO</span>
                  </>
                ) : (
                  <>
                    <Building className="w-3 h-3" />
                    <span>MNC</span>
                  </>
                )}
              </Badge>
            </div>
          )}

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {onSignOut && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            {userRole && (
              <div className="mb-4">
                <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                  {userRole === 'ngo' ? (
                    <>
                      <Heart className="w-3 h-3" />
                      <span>NGO</span>
                    </>
                  ) : (
                    <>
                      <Building className="w-3 h-3" />
                      <span>MNC</span>
                    </>
                  )}
                </Badge>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {onSignOut && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    onSignOut();
                    setIsOpen(false);
                  }}
                  className="justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Change default export to named export to match the import
export { Navigation };