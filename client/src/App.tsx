import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./components/app/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Employees from "./pages/app/Employees";
import EmployeeDetail from "./pages/app/EmployeeDetail";
import EmployeeForm from "./pages/app/EmployeeForm";
import Settings from "./pages/app/Settings";
import UsersPage from "./pages/app/Users";
import PayrollPeriods from "./pages/app/PayrollPeriods";
import PayrollPeriodDetail from "./pages/app/PayrollPeriodDetail";
import Leaves from "./pages/app/Leaves";
import SelfService from "./pages/app/SelfService";
import Documents from "./pages/app/Documents";
import Declarations from "./pages/app/Declarations";
import Reports from "./pages/app/Reports";
import Analytics from "./pages/app/Analytics";
import Notifications from "./pages/app/Notifications";
import ApiKeys from "./pages/app/ApiKeys";
import PlatformDashboard from "./pages/app/PlatformDashboard";
import DocumentRequests from "./pages/app/DocumentRequests";
import Loans from "./pages/app/Loans";
import { Loader2 } from "lucide-react";

// Protected route wrapper — redirects to login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">PH</span>
          </div>
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <p className="text-sm text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={Home} />

      {/* Authentication */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* App Routes (Protected) */}
      <Route path="/app">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/employes">
        {() => (
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/employes/nouveau">
        {() => (
          <ProtectedRoute>
            <EmployeeForm />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/employes/:id/modifier">
        {() => (
          <ProtectedRoute>
            <EmployeeForm />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/employes/:id">
        {() => (
          <ProtectedRoute>
            <EmployeeDetail />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/paie/:id">
        {() => (
          <ProtectedRoute>
            <PayrollPeriodDetail />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/paie">
        {() => (
          <ProtectedRoute>
            <PayrollPeriods />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/conges">
        {() => (
          <ProtectedRoute>
            <Leaves />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/prets">
        {() => (
          <ProtectedRoute>
            <Loans />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/mon-espace">
        {() => (
          <ProtectedRoute>
            <SelfService />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/documents">
        {() => (
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/declarations">
        {() => (
          <ProtectedRoute>
            <Declarations />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/rapports">
        {() => (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/analytique">
        {() => (
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/parametres">
        {() => (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/utilisateurs">
        {() => (
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/notifications">
        {() => (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/cles-api">
        {() => (
          <ProtectedRoute>
            <ApiKeys />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/plateforme">
        {() => (
          <ProtectedRoute>
            <PlatformDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/app/demandes-documents">
        {() => (
          <ProtectedRoute>
            <DocumentRequests />
          </ProtectedRoute>
        )}
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
