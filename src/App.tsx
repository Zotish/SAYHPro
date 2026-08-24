import { useState } from "react";
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

type AppState = "login" | "onboarding" | "app";
type Screen =
  | "dashboard" | "sales" | "pos" | "purchases" | "products" | "inventory"
  | "customers" | "suppliers" | "dues" | "expenses" | "cash" | "employees"
  | "reports" | "notifications" | "settings" | "addproduct" | "customerdetail"
  | "profitloss" | "mobile-dashboard" | "mobile-pos" | "invoice";

function MainApp() {
  const { lang, setLang } = useApp();
  const [appState, setAppState] = useState<AppState>("app");
  const [screenRaw, setScreenRaw] = useState<Screen>("dashboard");

  const setScreen = (s: string) => setScreenRaw(s as Screen);

  if (appState === "login") {
    return (
      <Login
        lang={lang}
        setLang={setLang}
        onLogin={() => setAppState("app")}
      />
    );
  }

  if (appState === "onboarding") {
    return (
      <Onboarding
        lang={lang}
        setLang={setLang}
        onComplete={() => {
          setAppState("app");
          setScreen("dashboard");
        }}
      />
    );
  }

  // Full-page mobile / invoice screens (if viewed standalone)
  if (screenRaw === "invoice") {
    return (
      <Layout currentScreen={screenRaw} setScreen={setScreen} onLogout={() => setAppState("login")}>
        <Invoice lang={lang} setScreen={setScreen} />
      </Layout>
    );
  }

  if (screenRaw === "mobile-pos") {
    return <MobilePOS lang={lang} setScreen={setScreen} />;
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
        return <Inventory lang={lang} />;
      case "dues":
        return <CustomerDue lang={lang} setScreen={setScreen} />;
      case "customerdetail":
        return <CustomerDue lang={lang} showDetail setScreen={setScreen} />;
      case "customers":
        return <Customers lang={lang} setScreen={setScreen} />;
      case "suppliers":
        return <Suppliers lang={lang} />;
      case "purchases":
        return <Purchases lang={lang} />;
      case "expenses":
        return <Expenses lang={lang} />;
      case "cash":
        return <CashAccounts lang={lang} />;
      case "reports":
        return <Reports lang={lang} setScreen={setScreen} />;
      case "profitloss":
        return <Reports lang={lang} showPL setScreen={setScreen} />;
      case "settings":
        return <Settings lang={lang} setLang={setLang} />;
      case "mobile-dashboard":
        return <MobileDashboard lang={lang} setScreen={setScreen} />;
      case "employees":
        return <Employees lang={lang} />;
      case "notifications":
        return <Notifications lang={lang} />;
      default:
        return <Dashboard lang={lang} setScreen={setScreen} />;
    }
  };

  return (
    <Layout currentScreen={screenRaw} setScreen={setScreen} onLogout={() => setAppState("login")}>
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
