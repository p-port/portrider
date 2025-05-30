
import { useAuth } from '@/hooks/useAuth';
import { DashboardCard } from './DashboardCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { 
  Bike, 
  MessageSquare, 
  Newspaper, 
  Users, 
  ShoppingBag, 
  MapPin, 
  Ticket,
  LogOut,
  Settings,
  User,
  Menu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const dashboardItems = [
  {
    id: 'my_garage',
    title: 'My Garage',
    description: 'Manage your motorcycles and maintenance records',
    icon: Bike,
    route: '/garage',
  },
  {
    id: 'forums',
    title: 'Forums',
    description: 'Connect with the motorcycle community',
    icon: MessageSquare,
    route: '/forum',
  },
  {
    id: 'news',
    title: 'News',
    description: 'Latest motorcycle news and updates',
    icon: Newspaper,
    route: '/news',
  },
  {
    id: 'groups',
    title: 'Groups / Clubs',
    description: 'Join motorcycle groups and clubs',
    icon: Users,
    route: '/groups',
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Buy and sell motorcycle gear',
    icon: ShoppingBag,
    route: '/marketplace',
  },
  {
    id: 'twisties',
    title: 'Twisties',
    description: 'Discover amazing motorcycle routes',
    icon: MapPin,
    route: '/twisties',
  },
  {
    id: 'tickets',
    title: 'Support',
    description: 'Get help and submit support tickets',
    icon: Ticket,
    route: '/support',
  },
];

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCardClick = (item: typeof dashboardItems[0]) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (profile?.username) return profile.username;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || 'User';
  };

  const MobileMenu = () => (
    <div className="flex flex-col gap-2 p-4">
      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
        <User className="h-4 w-4 mr-2" />
        Profile
      </Button>
      <Button variant="ghost" className="justify-start">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
      <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Mobile-First Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo - Always visible and clickable */}
            <div className="flex items-center gap-2 cursor-pointer min-w-0 hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <Bike className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Port Rider</h1>
            </div>
            
            {/* Global Search - Hidden on small screens, shown on medium+ */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <GlobalSearch />
            </div>
            
            {/* Desktop User Menu - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-foreground truncate max-w-32">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'rider'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex items-center gap-3 mb-6 pt-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'rider'}</p>
                    </div>
                  </div>
                  <MobileMenu />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search - Shown only on small screens */}
          <div className="md:hidden pb-3">
            <GlobalSearch />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.first_name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            What would you like to explore today?
          </p>
        </div>

        {/* Dashboard Grid - Mobile-first responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {dashboardItems.map((item) => (
            <DashboardCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onClick={() => handleCardClick(item)}
              className="bg-card border-border"
            />
          ))}
        </div>

        {/* Quick Stats - Mobile-first responsive */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Your Garage</h3>
            <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Motorcycles registered</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Forum Activity</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-500">0</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Posts and comments</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Groups</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-500">0</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Groups joined</p>
          </div>
        </div>
      </main>
    </div>
  );
}
