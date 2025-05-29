import { useAuth } from '@/hooks/useAuth';
import { DashboardCard } from './DashboardCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bike, 
  MessageSquare, 
  Newspaper, 
  Users, 
  ShoppingBag, 
  MapPin, 
  Ticket,
  LogOut,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  },
  {
    id: 'news',
    title: 'News',
    description: 'Latest motorcycle news and updates',
    icon: Newspaper,
  },
  {
    id: 'groups',
    title: 'Groups / Clubs',
    description: 'Join motorcycle groups and clubs',
    icon: Users,
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Buy and sell motorcycle gear',
    icon: ShoppingBag,
  },
  {
    id: 'twisties',
    title: 'Twisties',
    description: 'Discover amazing motorcycle routes',
    icon: MapPin,
  },
  {
    id: 'tickets',
    title: 'Support',
    description: 'Get help and submit support tickets',
    icon: Ticket,
  },
];

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCardClick = (cardId: string, route?: string) => {
    if (route) {
      navigate(route);
    } else {
      toast({
        title: "Feature Coming Soon",
        description: `${cardId.replace('_', ' ')} feature is currently being developed.`,
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Bike className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Port Rider</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role || 'rider'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.first_name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            What would you like to explore today?
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardItems.map((item) => (
            <DashboardCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onClick={() => handleCardClick(item.id, item.route)}
              className="bg-white"
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Garage</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Motorcycles registered</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Forum Activity</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Posts and comments</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Groups</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Groups joined</p>
          </div>
        </div>
      </main>
    </div>
  );
}
