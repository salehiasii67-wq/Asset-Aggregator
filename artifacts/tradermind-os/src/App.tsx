import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from './components/Layout';

import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Psychology from './pages/Psychology';
import Growth from './pages/Growth';
import Evolution from './pages/Evolution';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/journal" component={Journal} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/psychology" component={Psychology} />
        <Route path="/growth" component={Growth} />
        <Route path="/evolution" component={Evolution} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;