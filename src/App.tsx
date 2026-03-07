import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { CustomerHome } from "./components/CustomerHome";
import { AdminDashboard } from "./components/AdminDashboard";
import { MenuPage } from "./components/MenuPage";
import { CateringPage } from "./components/CateringPage";
import { OrderHistory } from "./components/OrderHistory";
import Logo from "./assets/logorm2.webp";
import Logo2 from "./assets/logorm3.webp";

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, #451a03, #1d0e01, #451a03)",
      }}
    >
      <Content />
      <Toaster richColors position="top-center" />
    </div>
  );
}

function Content() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const [currentPage, setCurrentPage] = useState<
    "home" | "menu" | "catering" | "orders" | "admin"
  >("home");

  const isAdmin = useMemo(() => {
    return loggedInUser?.email === "Abdoush2008@gmail.com";
  }, [loggedInUser]);

  // توجيه الأدمن تلقائياً إلى لوحة التحكم
  useEffect(() => {
    if (isAuthenticated && loggedInUser && isAdmin && currentPage !== "admin") {
      setCurrentPage("admin");
    }
  }, [isAuthenticated, loggedInUser, isAdmin, currentPage]);

  // انتظار حتى يتم تحميل بيانات المستخدم بشكل كامل
  if (authLoading || loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: "#facc15",
            borderTopColor: "transparent",
          }}
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* الهيدر */}
      <header
        className="relative text-white shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(to right, #451a03, #1d0e01, #451a03)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(to right, transparent, #facc15, transparent)",
          }}
        ></div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(250,204,21,0.1), transparent)",
          }}
        ></div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="ornamental-border w-14 h-14 rounded-full flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: "linear-gradient(to bottom right, #facc15, #d97706)",
                  }}
                >
                  <img src={Logo} alt="Logo" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wide gradient-text">
                  Hameed Catering
                </h1>
                <p className="text-sm italic" style={{ color: "#d97706" }}>
                  Food and Services
                </p>
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                {!isAdmin && (
                  <nav className="hidden md:flex space-x-6">
                    <button
                      onClick={() => setCurrentPage("home")}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === "home" ? "shadow-lg" : "hover:bg-opacity-50"
                      }`}
                      style={
                        currentPage === "home"
                          ? {
                              background: "linear-gradient(to right, #facc15, #d97706)",
                              color: "#451a03",
                              boxShadow: "0 10px 15px -3px rgba(250,204,21,0.3)",
                            }
                          : { color: "#fadd8c", backgroundColor: "rgba(69,26,3,0.5)" }
                      }
                    >
                      Home
                    </button>
                    <button
                      onClick={() => setCurrentPage("orders")}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === "orders" ? "shadow-lg" : "hover:bg-opacity-50"
                      }`}
                      style={
                        currentPage === "orders"
                          ? {
                              background: "linear-gradient(to right, #facc15, #d97706)",
                              color: "#451a03",
                              boxShadow: "0 10px 15px -3px rgba(250,204,21,0.3)",
                            }
                          : { color: "#fadd8c", backgroundColor: "rgba(69,26,3,0.5)" }
                      }
                    >
                      Orders
                    </button>
                  </nav>
                )}
                <SignOutButton />
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(to right, transparent, #facc15, transparent)",
          }}
        ></div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <LoginPage />
        ) : (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <>
              {currentPage === "home" && <CustomerHome onNavigate={setCurrentPage} />}
              {currentPage === "menu" && <MenuPage onBack={() => setCurrentPage("home")} />}
              {currentPage === "catering" && <CateringPage onBack={() => setCurrentPage("home")} />}
              {currentPage === "orders" && <OrderHistory onBack={() => setCurrentPage("home")} />}
            </>
          )
        )}
      </main>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <div
        className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm"
        style={{
          backgroundColor: "#451a03",
          border: "1px solid rgba(250,204,21,0.3)",
        }}
      >
        <div
          className="relative p-8 text-center"
          style={{
            background: "linear-gradient(to right, #451a03, #1d0e01, #451a03)",
          }}
        >
          <div className="relative z-10">
            <img src={Logo2} alt="Logo2" />
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(to right, transparent, #facc15, transparent)",
            }}
          ></div>
        </div>

        <div className="p-8">
          <SignInForm />
        </div>

        <div
          className="h-2"
          style={{
            background: "linear-gradient(to right, rgba(250,204,21,0.5), #d97706, rgba(250,204,21,0.5))",
          }}
        ></div>
      </div>
    </div>
  );
}