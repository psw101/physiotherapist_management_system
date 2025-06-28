"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Order } from "@/types/models";

const MyOrdersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // For feedback form
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackProductId, setFeedbackProductId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // For cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/my-orders");
    }
  }, [status, router]);

  // Fetch orders when authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);
        const queryParam = activeTab !== "all" ? `?status=${activeTab}` : "";
        const response = await axios.get(`/api/orders${queryParam}`);
        setOrders(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, activeTab]);

  const openFeedbackForm = (productId: number) => {
    setFeedbackProductId(productId);
    setRating(0);
    setComment("");
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackProductId) return;

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setSubmittingFeedback(true);

      await axios.post(`/api/products/${feedbackProductId}/feedback`, {
        rating,
        comment
      });

      toast.success("Thank you for your feedback!");
      setShowFeedbackForm(false);

      // Refresh the orders to update UI if needed
      const response = await axios.get("/api/orders");
      setOrders(response.data);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const openCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;

    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setSubmittingCancel(true);

      // Find the order to get the product ID
      const orderResponse = await axios.get(`/api/orders/${cancelOrderId}`);
      const order = orderResponse.data;
      const productId = order.product?.id;

      // Cancel the order
      await axios.put(`/api/orders/${cancelOrderId}`, {
        status: "cancelled",
        adminNotes: `Cancelled by customer. Reason: ${cancelReason}`
      });

      toast.success("Order cancelled successfully");
      setShowCancelModal(false);

      // Refresh the orders to update UI
      const queryParam = activeTab !== "all" ? `?status=${activeTab}` : "";
      const response = await axios.get(`/api/orders${queryParam}`);
      setOrders(response.data);

      // No feedback prompt after cancellation

    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <ToastContainer />

      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {/* Status Tabs */}
      <div className="flex flex-wrap mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "all" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("all")}
        >
          All Orders
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "approved" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "completed" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "rejected" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
        

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-lg text-gray-600">You don't have any orders yet.</p>
          <button
            onClick={() => router.push("/user/products")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Order ID: {order.id}</span>
                    <div className="text-gray-500 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start border-t pt-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={order.product.imageUrl || "https://via.placeholder.com/100"}
                      alt={order.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 ml-0 sm:ml-4 mt-4 sm:mt-0">
                    <h3 className="text-lg font-medium text-gray-900">{order.product.name}</h3>
                    <p className="text-gray-600">Quantity: {order.quantity}</p>
                    <p className="text-gray-600">Price: Rs. {order.totalPrice.toLocaleString()}</p>

                    {/* Customizations */}
                    {order.customizations && Object.keys(order.customizations).length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900">Customizations:</h4>
                        <div className="mt-1 text-sm text-gray-600">
                          {Object.entries(order.customizations).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {order.adminNotes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900">Admin Notes:</h4>
                        <p className="text-sm text-gray-600">{order.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 border-t pt-4 flex justify-end space-x-2">
                  {/* Cancel button - only for pending or approved orders */}
                  {(order.status === "pending" || order.status === "approved") && (
                    <button
                      onClick={() => openCancelModal(order.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* Feedback button - only for completed orders */}
                  {order.status === "completed" && (
                    <button
                      onClick={() => openFeedbackForm(order.product.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Leave Feedback</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 font-medium"
                disabled={submittingFeedback}
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium"
                disabled={submittingFeedback || rating === 0}
              >
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? Please provide a reason for cancellation.
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Reason for Cancellation</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please explain why you're cancelling this order..."
                required
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 font-medium"
                disabled={submittingCancel}
              >
                Back
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium"
                disabled={submittingCancel || !cancelReason.trim()}
              >
                {submittingCancel ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;