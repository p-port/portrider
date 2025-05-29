
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyGarage from "./pages/MyGarage";
import Forum from "./pages/Forum";
import ForumCategory from "./pages/ForumCategory";
import ForumPost from "./pages/ForumPost";
import Marketplace from "./pages/Marketplace";
import BusinessProfile from "./pages/BusinessProfile";
import RegisterBusiness from "./pages/RegisterBusiness";
import ManageProducts from "./pages/ManageProducts";
import ManageOrders from "./pages/ManageOrders";
import Twisties from "./pages/Twisties";
import SupportTickets from "./pages/SupportTickets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/garage"
                element={
                  <ProtectedRoute>
                    <MyGarage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forum"
                element={
                  <ProtectedRoute>
                    <Forum />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forum/category/:categoryId"
                element={
                  <ProtectedRoute>
                    <ForumCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forum/post/:postId"
                element={
                  <ProtectedRoute>
                    <ForumPost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <Marketplace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/business/:businessId"
                element={
                  <ProtectedRoute>
                    <BusinessProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register-business"
                element={
                  <ProtectedRoute>
                    <RegisterBusiness />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-products"
                element={
                  <ProtectedRoute>
                    <ManageProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-orders"
                element={
                  <ProtectedRoute>
                    <ManageOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/twisties"
                element={
                  <ProtectedRoute>
                    <Twisties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <SupportTickets />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
