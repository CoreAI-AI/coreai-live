import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { useAppLock } from "@/hooks/useAppLock";
import { AppLockScreen } from "@/components/AppLockScreen";
import { AppLockSetup } from "@/components/AppLockSetup";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const AppContent = () => {
  const { 
    isLocked, 
    settings, 
    isSetupMode, 
    setIsSetupMode,
    enableLock, 
    verifyPin, 
    authenticateWithBiometric 
  } = useAppLock();

  return (
    <>
      <AnimatePresence mode="wait">
        {isSetupMode && (
          <AppLockSetup
            key="setup"
            onComplete={enableLock}
            onCancel={() => setIsSetupMode(false)}
          />
        )}
        {isLocked && !isSetupMode && (
          <AppLockScreen
            key="lock"
            onUnlock={verifyPin}
            onBiometricAuth={authenticateWithBiometric}
            biometricEnabled={settings.biometricEnabled}
          />
        )}
      </AnimatePresence>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
