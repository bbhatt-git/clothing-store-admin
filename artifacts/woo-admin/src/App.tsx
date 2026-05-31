import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products/index";
import ProductNew from "@/pages/products/new";
import ProductEdit from "@/pages/products/edit";
import Orders from "@/pages/orders/index";
import OrderDetail from "@/pages/orders/detail";
import Categories from "@/pages/categories/index";
import Reviews from "@/pages/reviews/index";
import Coupons from "@/pages/coupons/index";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/products/new" component={ProductNew} />
      <Route path="/products/:id/edit" component={ProductEdit} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/categories" component={Categories} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/coupons" component={Coupons} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Layout>
                <Router />
              </Layout>
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
