import { lazy } from "react";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

const Home = lazy(() => import("../pages/home/Home"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Marketplace = lazy(() => import("../components/Marketplace/Marketplace"));
const Watch = lazy(() => import("../components/Watch/Watch"));
const Messages = lazy(() => import("../components/Messages/Messages"));
const CreateBorts = lazy(() => import("../components/Reels/CreateBorts"));
const CreateCommunityForm = lazy(() =>
  import("../components/CommunityForm/CreateCommunityForm")
);
const CommunityList = lazy(() =>
  import("../components/CommunityList/CommunityList")
);
const CommunityDetail = lazy(() =>
  import("../components/CommunityDetail/CommunityDetails")
);
const EventCreationForm = lazy(() =>
  import("../components/EventCreationForm/EventCreationForm")
);
const UserList = lazy(() => import("../components/user/UserList"));
const PremiumPage = lazy(() => import("../pages/Premium/PremiumPage"));
const AdvancedAnalytics = lazy(() =>
  import("../components/premium/AdvancedAnalytics")
);
const SubscriptionUI = lazy(() => import("../components/premium/Subscription"));
const Post = lazy(() => import("../components/post/Post"));
const FriendRequests = lazy(() =>
  import("../components/Request/FreindRequests")
);
const Payment = lazy(() => import("../components/premium/Payment"));
const Login = lazy(() => import("../pages/login/Login"));
const Register = lazy(() => import("../pages/register/Register"));

export const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

export const protectedRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Marketplace",
    element: (
      <ProtectedRoute>
        <Marketplace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Watch",
    element: (
      <ProtectedRoute>
        <Watch />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Messages",
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reel",
    element: (
      <ProtectedRoute>
        <CreateBorts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/create",
    element: (
      <ProtectedRoute>
        <CreateCommunityForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community",
    element: (
      <ProtectedRoute>
        <CommunityList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/:id",
    element: (
      <ProtectedRoute>
        <CommunityDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <EventCreationForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/userlist",
    element: (
      <ProtectedRoute>
        <UserList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/premium",
    element: (
      <ProtectedRoute>
        <PremiumPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <AdvancedAnalytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription",
    element: (
      <ProtectedRoute>
        <SubscriptionUI />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post",
    element: (
      <ProtectedRoute>
        <Post />
      </ProtectedRoute>
    ),
  },
  {
    path: "/friends",
    element: (
      <ProtectedRoute>
        <FriendRequests />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment",
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
];
