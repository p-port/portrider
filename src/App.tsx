
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyGarage from "./pages/MyGarage";
import Forum from "./pages/Forum";
import ForumCategory from "./pages/ForumCategory";
import ForumPost from "./pages/ForumPost";
import Marketplace from "./pages/Marketplace";
import RegisterBusiness from "./pages/RegisterBusiness";
import BusinessProfile from "./pages/BusinessProfile";
import ManageProducts from "./pages/ManageProducts";
import ManageOrders from "./pages/ManageOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/garage" element={
            <ProtectedRoute>
              <MyGarage />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />
          <Route path="/forum/category/:categoryId" element={
            <ProtectedRoute>
              <ForumCategory />
            </ProtectedRoute>
          } />
          <Route path="/forum/post/:postId" element={
            <ProtectedRoute>
              <ForumPost />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/marketplace/register-business" element={
            <ProtectedRoute>
              <RegisterBusiness />
            </ProtectedRoute>
          } />
          <Route path="/marketplace/business/:businessId" element={
            <ProtectedRoute>
              <BusinessProfile />
            </ProtectedRoute>
          } />
          <Route path="/marketplace/manage-products" element={
            <ProtectedRoute>
              <ManageProducts />
            </ProtectedRoute>
          } />
          <Route path="/marketplace/manage-orders" element={
            <ProtectedRoute>
              <ManageOrders />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
