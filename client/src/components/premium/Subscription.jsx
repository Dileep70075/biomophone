// import React, { useState, useEffect } from "react";
// import "./subscription.scss";
// import { useNavigate } from "react-router-dom";

// const SubscriptionUI = () => {
//   const [isFetching, setIsFetching] = useState(false);

//   const userData = localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user"))
//     : null;

//   const token = userData?.token;
//   const userId = userData?.user?.id;
//   const navigate = useNavigate();
//   const plans = [
//     { name: "Basic", price: "$10", duration: "1 Month", features: ["Feature 1", "Feature 2"] },
//     { name: "Premium", price: "$25", duration: "1 Month", features: ["Feature 1", "Feature 2", "Feature 3"] },
//     { name: "Pro", price: "$50", duration: "1 Month", features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"] },
//   ];

//   const [currentSubscription, setCurrentSubscription] = useState({
//     plan: "Free Trial", // Default is Free Trial
//     status: "Active",
//     trialEndsOn: "2025-01-15", // End date of the free trial
//     expiresOn: null, // No expiry date until a plan is purchased
//   });

//   const handleAction = async (action, planName = null) => {
//     if (!userId || isFetching) return;
  
//     setIsFetching(true);
//     try {
//       const response = await fetch("http://localhost:8800/api/subscriptions/sub", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ userId, action, plan: planName }),
//       });
  
//       const data = await response.json();
//       if (data.success) {
//         alert(data.message || "Action completed successfully.");
//         setCurrentSubscription(data.subscription || currentSubscription);
//       } else {
//         alert(data.message || "Action failed.");
//       }
//     } catch (err) {
//       console.error("Error:", err);
//       alert("Something went wrong. Try again later.");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   const openPaymentModal = (plan) => {
//     setSelectedPlan(plan);
//     setShowPaymentModal(true);
//   };

//   const handleSubscribeClick = (planName) => {
//     openPaymentModal(planName);
//     handleAction("subscribe", planName);
//   };

//   useEffect(() => {
//     if (!token || !userId) {
//       console.warn("Token or User ID missing. Skipping fetch.");
//       return;
//     }
  
//     const fetchSubscription = async () => {
//       try {
//         const response = await fetch("http://localhost:8800/api/subscriptions/sub", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ userId, action: "fetch" }),
//         });
  
//         const data = await response.json();
//         if (data.subscription) {
//           setCurrentSubscription(data.subscription);
//         } else {
//           console.warn("No subscription data found.");
//         }
//       } catch (err) {
//         console.error("Error fetching subscription data:", err);
//       }
//     };
  
//     fetchSubscription();
//   }, [token, userId]);
  

//   return (
//     <div className="subscription-page">
//       <h1 className="title">Subscription Plans</h1>

//       {/* Current Subscription */}
//       <div className="current-subscription">
//         <h2>Your Current Subscription</h2>
//         <p>
//           <strong>Plan:</strong> {currentSubscription.plan}
//         </p>
//         <p>
//           <strong>Status:</strong> {currentSubscription.status}
//         </p>
//         {currentSubscription.trialEndsOn ? (
//           <p className="free-trial">
//             You are currently on a <strong>Free Trial</strong>. Trial ends on:{" "}
//             <strong>{currentSubscription.trialEndsOn}</strong>.
//           </p>
//         ) : (
//           <p>
//             <strong>Expires On:</strong> {currentSubscription.expiresOn || "N/A"}
//           </p>
//         )}
//         <button className="cancel-btn" onClick={() => handleAction("cancel")}>
//           Cancel Subscription
//         </button>
//       </div>

//       {/* Available Plans */}
//       <div className="plans-grid">
//         {plans.map((plan, index) => (
//           <div key={index} className="plan-card">
//             <h3>{plan.name}</h3>
//             <p className="price">{plan.price}</p>
//             <p>{plan.duration}</p>
//             <ul>
//               {plan.features.map((feature, i) => (
//                 <li key={i}>{feature}</li>
//               ))}
//             </ul>
//             <button
//               className="subscribe-btn"
//               onClick={() => handleSubscribeClick(plan.name)}
//             >
//               Subscribe
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SubscriptionUI;

import React, { useState, useEffect } from "react";
import "./subscription.scss";
import { useNavigate } from "react-router-dom";

const SubscriptionUI = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  const userData = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const token = userData?.token;
  const userId = userData?.user?.id;
  const navigate = useNavigate();

  const plans = [
    { name: "Basic", price: "$10", duration: "1 Month", features: ["Feature 1", "Feature 2"] },
    { name: "Premium", price: "$25", duration: "1 Month", features: ["Feature 1", "Feature 2", "Feature 3"] },
    { name: "Pro", price: "$50", duration: "1 Month", features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"] },
  ];

  // Fetch subscription details
  const fetchSubscriptionDetails = async () => {
    if (!token || !userId) {
      console.warn("Token or User ID missing. Skipping fetch.");
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch("http://localhost:8800/api/subscriptions/sub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "fetch", userId }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSubscription(data.subscription);
      } else {
        console.warn("No subscription data found.");
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Subscribe to a plan
  const handleSubscribeClick = async (planName) => {
    if (!userId || isFetching) return;

    openPaymentModal(planName);

    try {
      const response = await fetch("http://localhost:8800/api/subscriptions/sub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "subscribe", userId, plan: planName }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || "Subscription successful!");
        setCurrentSubscription(data.subscription);
      } else {
        alert(data.message || "Subscription failed.");
      }
    } catch (err) {
      console.error("Error subscribing to plan:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!userId || isFetching) return;

    setIsFetching(true);
    try {
      const response = await fetch("http://localhost:8800/api/subscriptions/sub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "cancel", userId }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || "Subscription cancelled successfully.");
        setCurrentSubscription(null);
      } else {
        alert(data.message || "Cancellation failed.");
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const openPaymentModal = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [token, userId]);

  return (
    <div className="subscription-page">
      <h1 className="title">Subscription Plans</h1>

      {/* Current Subscription */}
      <div className="current-subscription">
        <h2>Your Current Subscription</h2>
        {currentSubscription ? (
          <>
            <p>
              <strong>Plan:</strong> {currentSubscription.plan}
            </p>
            <p>
              <strong>Status:</strong> {currentSubscription.status}
            </p>
            <button className="cancel-btn" onClick={handleCancelSubscription}>
              Cancel Subscription
            </button>
          </>
        ) : (
          <p>No active subscription. Please choose a plan below.</p>
        )}
      </div>

      {/* Available Plans */}
      <div className="plans-grid">
        {plans.map((plan, index) => (
          <div key={index} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="price">{plan.price}</p>
            <p>{plan.duration}</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button className="subscribe-btn" onClick={() => handleSubscribeClick(plan.name)}>
              Subscribe
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal">
          <div className="modal-content">
            <h2>Subscribe to {selectedPlan}</h2>
            <p>Complete your payment to activate this plan.</p>
            <button
              className="confirm-btn"
              onClick={() => {
                setShowPaymentModal(false);
                alert("Payment completed successfully.");
              }}
            >
              Confirm Payment
            </button>
            <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionUI;
