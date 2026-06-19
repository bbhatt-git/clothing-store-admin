import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalProvider } from "@/contexts/ModalContext";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import WishlistPage from "@/pages/WishlistPage";
import OrdersPage from "@/pages/OrdersPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/shop/:slug" component={ProductPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </ModalProvider>
    </QueryClientProvider>
  );
}

export default App;
