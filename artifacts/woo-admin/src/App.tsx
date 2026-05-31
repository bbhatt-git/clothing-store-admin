import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";
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
import Tags from "@/pages/tags/index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

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
      <Route path="/tags" component={Tags} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AnimatedRouter() {
  const [location] = useLocation();
  const segment = location.split("/")[1] || "dashboard";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        style={{ height: "100%" }}
      >
        <Router />
      </motion.div>
    </AnimatePresence>
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
                <AnimatedRouter />
              </Layout>
            </AuthProvider>
          </WouterRouter>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
