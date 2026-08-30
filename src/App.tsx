import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { AppProvider, useApp } from "./context/AppContext";

import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import POS from "./screens/POS";
import Products from "./screens/Products";
import CustomerDue from "./screens/CustomerDue";
import Suppliers from "./screens/Suppliers";
import Purchases from "./screens/Purchases";
import Expenses from "./screens/Expenses";
import CashAccounts from "./screens/CashAccounts";
import Reports from "./screens/Reports";
import Inventory from "./screens/Inventory";
import Settings from "./screens/Settings";
import MobileDashboard from "./screens/MobileDashboard";
import MobilePOS from "./screens/MobilePOS";
import Invoice from "./screens/Invoice";
import Customers from "./screens/Customers";
import Employees from "./screens/Employees";
import Notifications from "./screens/Notifications";
import Marketing from "./screens/Marketing";
import DeliveryAggregator from "./screens/DeliveryAggregator";
import FintechBanking from "./screens/FintechBanking";
import Reselling from "./screens/Reselling";
import WebsiteBuilder from "./screens/WebsiteBuilder";
import MonitoringAlerts from "./screens/MonitoringAlerts";

type AppState = "login" | "onboarding" | "app";
type Screen =
  | "dashboard" | "sales" | "pos" | "purchases" | "products" | "inventory"
  | "customers" | "suppliers" | "dues" | "expenses" | "cash" | "employees"
  | "reports" | "notifications" | "settings" | "addproduct" | "customerdetail"
  | "profitloss" | "mobile-dashboard" | "mobile-pos" | "invoice"
  | "marketing" | "delivery" | "fintech" | "reselling" | "website" | "alerts";

import PWAInstallPrompt from "./components/PWAInstallPrompt";

/** Tracks the same breakpoint Layout uses to swap to its mobile chrome (lg). */
function useIsMobile() {
  const query = "(max-width: 1023px)";
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function MainApp() {
  const { lang, setLang } = useApp();
  const [appState, setAppState] = useState<AppState>("app");
  const [screenRaw, setScreenRaw] = useState<Screen>("dashboard");
  // A plain history stack so every screen can offer a real "back", not just
  // "return to home" — every setScreen call that actually changes screen
  // pushes the screen it left.
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const isMobile = useIsMobile();

  const setScreen = (s: string) => {
    const next = s as Screen;
    if (next === screenRaw) return;
    setScreenHistory(h => [...h, screenRaw]);
    setScreenRaw(next);
  };

  const goBack = () => {
    setScreenHistory(h => {
      if (h.length === 0) {
        setScreenRaw("dashboard");
        return h;
      }
      setScreenRaw(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  if (appState === "login") {
    return (
      <>
        <PWAInstallPrompt lang={lang} />
        <Login
          lang={lang}
          setLang={setLang}
          onLogin={() => setAppState("app")}
        />
      </>
    );
  }

  if (appState === "onboarding") {
    return (
      <>
        <PWAInstallPrompt lang={lang} />
        <Onboarding
          lang={lang}
          setLang={setLang}
          onComplete={() => {
            setAppState("app");
            setScreen("dashboard");
          }}
        />
      </>
    );
  }

  // Full-page mobile / invoice screens (if viewed standalone)
  if (screenRaw === "invoice") {
    return (
      <Layout currentScreen={screenRaw} setScreen={setScreen} onLogout={() => setAppState("login")} onBack={goBack}>
        <PWAInstallPrompt lang={lang} />
        <Invoice lang={lang} setScreen={setScreen} />
      </Layout>
    );
  }

  if (screenRaw === "mobile-pos") {
    return (
      <>
        <PWAInstallPrompt lang={lang} />
        <MobilePOS lang={lang} setScreen={setScreen} />
      </>
    );
  }

  // On a phone the home screen IS the redesigned mobile home — it carries its
  // own header and bottom nav, so it renders outside Layout rather than
  // doubling up on chrome. Desktop keeps the wide analytics dashboard.
  if (screenRaw === "mobile-dashboard" || (screenRaw === "dashboard" && isMobile)) {
    return (
      <>
        <PWAInstallPrompt lang={lang} />
        <MobileDashboard lang={lang} setScreen={setScreen} />
      </>
    );
  }

  const renderScreen = () => {
    switch (screenRaw) {
      case "dashboard":
        return <Dashboard lang={lang} setScreen={setScreen} />;
      case "pos":
      case "sales":
        return <POS lang={lang} setScreen={setScreen} />;
      case "products":
        return <Products lang={lang} setScreen={setScreen} />;
      case "addproduct":
        return <Products lang={lang} showAdd setScreen={setScreen} />;
      case "inventory":
        return <Inventory lang={lang} onBack={goBack} />;
      case "dues":
        return <CustomerDue lang={lang} setScreen={setScreen} onBack={goBack} />;
      case "customerdetail":
        return <CustomerDue lang={lang} showDetail setScreen={setScreen} onBack={goBack} />;
      case "customers":
        return <Customers lang={lang} setScreen={setScreen} />;
      case "suppliers":
        return <Suppliers lang={lang} />;
      case "purchases":
        return <Purchases lang={lang} />;
      case "expenses":
        return <Expenses lang={lang} />;
      case "cash":
        return <CashAccounts lang={lang} onBack={goBack} />;
      case "reports":
        return <Reports lang={lang} setScreen={setScreen} />;
      case "profitloss":
        return <Reports lang={lang} showPL setScreen={setScreen} />;
      case "settings":
        return <Settings lang={lang} setLang={setLang} />;
      case "employees":
        return <Employees lang={lang} />;
      case "notifications":
        return <Notifications lang={lang} />;
      case "marketing":
        return <Marketing lang={lang} setScreen={setScreen} />;
      case "delivery":
        return <DeliveryAggregator lang={lang} setScreen={setScreen} />;
      case "fintech":
        return <FintechBanking lang={lang} setScreen={setScreen} />;
      case "reselling":
        return <Reselling lang={lang} setScreen={setScreen} />;
      case "website":
        return <WebsiteBuilder lang={lang} setScreen={setScreen} />;
      case "alerts":
        return <MonitoringAlerts lang={lang} setScreen={setScreen} />;
      default:
        return <Dashboard lang={lang} setScreen={setScreen} />;
    }
  };

  return (
    <Layout currentScreen={screenRaw} setScreen={setScreen} onLogout={() => setAppState("login")} onBack={goBack}>
      <PWAInstallPrompt lang={lang} />
      {renderScreen()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider />
      <MainApp />
    </AppProvider>
  );
}
