import { Suspense, useContext } from "react";
import { Outlet } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { DarkModeContext } from "../context/darkModeContext";
import Navbar from "../components/navbar/Navbar";
import LeftBar from "../components/leftBar/LeftBar";
import RightBar from "../components/rightBar/RightBar";
import TipButton from "../components/premium/TripButton";

export const MainLayout = ({ isMobile }) => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={`theme-${darkMode ? "dark" : "light"}`}>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-screen">
        {!isMobile && <LeftBar />}
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
        <aside className="w-full md:w-1/4">
          <RightBar />
          {!isMobile && <TipButton creatorId="12345" amount={10} />}
        </aside>
      </div>
    </div>
  );
};
