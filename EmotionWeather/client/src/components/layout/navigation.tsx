import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", testId: "nav-dashboard" },
    { path: "/voting", label: "Voting", testId: "nav-voting" },
    { path: "/emotion-map", label: "Emotion Map", testId: "nav-emotion-map" },
    { path: "/summary", label: "AI Summary", testId: "nav-summary" },
    { path: "/manage", label: "Manage Policies", testId: "nav-manage" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EW</span>
            </div>
            <span className="font-semibold text-lg text-foreground">Emotion Weather</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  data-testid={item.testId}
                  className={cn(
                    "nav-link px-4 py-2 rounded-md text-sm font-medium transition-all",
                    location === item.path
                      ? "active bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md hover:bg-accent" data-testid="mobile-menu-button">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
