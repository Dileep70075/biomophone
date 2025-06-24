import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import ReportedContentTable from "./ReportContentTable";
import PieChart from "./PieChart";
import "./AdminDashBoard.scss";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    flaggedPosts: 0,
    activeEvents: 0,
    communityEngagement: 0,
  });

  const [reportedContent, setReportedContent] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch stats
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`)
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        console.log("stats data:", stats);
      })
      .catch((error) => console.error("Error fetching stats:", error));

    // Fetch reported content
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Reported Content Data:", data); // Log the response here
        setReportedContent(data);
      })
      .catch((error) =>
        console.error("Error fetching reported content:", error)
      );

    // Fetch chart data
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/chart-data`)
      .then((response) => response.json())
      .then((data) => {
        const chartLabels = data.map((item) => item.label);
        const chartValues = data.map((item) => item.value);

        setChartData({
          labels: chartLabels,
          values: chartValues,
        });
      })
      .catch((error) => console.error("Error fetching chart data:", error));
  }, []);

  const blockUser = (userId) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User blocked:", data);
      })
      .catch((error) => console.error("Error blocking user:", error));
  };

  const muteUser = (userId) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/mute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User muted:", data);
      })
      .catch((error) => console.error("Error muting user:", error));
  };

  const reportUser = (userId) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User reported:", data);
      })
      .catch((error) => console.error("Error reporting user:", error));
  };

  const restrictAccount = (userId) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/restrict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Account restricted:", data);
      })
      .catch((error) => console.error("Error restricting account:", error));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <div className="dashboard-grid">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          color="orange"
        />
        <StatsCard
          title="Total Reports"
          value={stats.totalReports}
          color="blue"
        />
        <StatsCard
          title="Flagged Posts"
          value={stats.flaggedPosts}
          color="green"
        />
        <StatsCard
          title="Active Events"
          value={stats.activeEvents}
          color="red"
        />
        <StatsCard
          title="Community Engagement"
          value={stats.communityEngagement}
          color="purple"
        />
      </div>

      <div className="reported-content-section">
        <h2>Reported Content</h2>
        <ReportedContentTable
          data={reportedContent}
          blockUser={blockUser}
          muteUser={muteUser}
          reportUser={reportUser}
          restrictAccount={restrictAccount}
        />
        <div>
          {chartData ? <PieChart data={chartData} /> : <p>Loading chart...</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
