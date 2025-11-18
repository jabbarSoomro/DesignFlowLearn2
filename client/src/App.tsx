import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { useAuthStore } from "@/lib/auth-store";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Problems from "@/pages/problems";
import ProblemDetail from "@/pages/problem-detail";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  
  if (!isAdmin()) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  const { user } = useAuthStore();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/problems">
        {() => <ProtectedRoute component={Problems} />}
      </Route>
      <Route path="/problems/:slug">
        {() => <ProtectedRoute component={ProblemDetail} />}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedRoute component={Leaderboard} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/admin">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user } = useAuthStore();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {user && <Navigation />}
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
