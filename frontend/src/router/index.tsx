import { createBrowserRouter } from "react-router-dom";

import { AdminDashboardPage } from "@/pages/admin-dashboard-page";
import { AnalyzePage } from "@/pages/analyze-page";
import { HomePage } from "@/pages/home-page";
import { HistoryPage } from "@/pages/history-page";
import { LoginPage } from "@/pages/login-page";
import { ResultPage } from "@/pages/result-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { AboutPage } from "@/pages/about-page";
import { TechnicalDocsPage } from "@/pages/technical-docs-page";
import { DemoPage } from "@/pages/demo-page";
import { ProtectedRoute } from "@/router/protected-route";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/analyse", element: <AnalyzePage /> },
  { path: "/result/:id", element: <ResultPage /> },
  { path: "/history", element: <HistoryPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/technical-docs", element: <TechnicalDocsPage /> },
  { path: "/demo", element: <DemoPage /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <NotFoundPage /> },
]);
