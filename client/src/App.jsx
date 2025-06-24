import { Suspense, useContext, useEffect, useState } from "react";
import React from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { UserProfileContext } from "./context/UserProfileContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
} from "react-router-dom";
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";

import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import CreateBorts from "./components/Reels/CreateBorts";
import CreateCommunityForm from "./components/CommunityForm/CreateCommunityForm";
import CommunityList from "./components/CommunityList/CommunityList";
import CommunityDetail from "./components/CommunityDetail/CommunityDetails";
import Marketplace from "./components/Marketplace/Marketplace";
import Watch from "./components/Watch/Watch";
import Messages from "./components/Messages/Messages";
import EventCreationForm from "./components/EventCreationForm/EventCreationForm";
import UserList from "./components/user/UserList";
import PremiumPage from "./pages/Premium/PremiumPage";
import AdvancedAnalytics from "./components/premium/AdvancedAnalytics";
import TipButton from "./components/premium/TripButton";
import AdComponent from "./components/premium/AdComponent";
import Payment from "./components/premium/Payment";
import SubscriptionUI from "./components/premium/Subscription";
import FriendRequests from "./components/Request/FreindRequests";
import Posts from "./components/posts/Posts";
import Post from "./components/post/Post";
import { useAuth } from "./context/authContext";
import "./index.css";
import { useResponsive } from "./hooks/useResponsive";
import { MainLayout } from "./layouts/MainLayout";
import { protectedRoutes, publicRoutes } from "./routes/routes";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { isMobile } = useResponsive();

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={queryClient}>
          <MainLayout isMobile={isMobile} />
        </QueryClientProvider>
      ),
      children: [...protectedRoutes],
    },
    ...publicRoutes,
  ]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
