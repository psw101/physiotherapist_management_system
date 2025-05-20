"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Order {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  totalPrice: number;
  customizations: Record<string, string>;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

const AdminOrdersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // For order update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Check for admin access
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/orders");
      return;
    }
    
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      toast.error("Admin access required");
      return;
    }
  }, [status, session, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
      
      try {
        setLoading(true);
        const statusParam = activeTab !== "all" ? `status=${activeTab}&` : "";
        const response = await axios.get(`/api/admin/orders?${statusParam}page=${currentPage}&limit=10`);
        
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.pages);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, session, activeTab, currentPage]);

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.adminNotes || "");
    setShowUpdateModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setSubmitting(true);
      
      await axios.put(`/api/admin/orders/${selectedOrder.id}`, {
        status: newStatus,
        adminNotes: adminNotes.trim() || null
      });
      
      toast.success("Order updated successfully!");
      setShowUpdateModal(false);
      
      // Refresh orders
      const statusParam = activeTab !== "all" ? `status=${activeTab}&` : "";
      const response = await axios.get(`/api/admin/orders?${statusParam}page=${currentPage}&limit=10`);
      setOrders(response.data.orders);
      
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
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

  if (!session || session.user.role !== "ADMIN") {
    return null; // Already redirected in useEffect
  }

  return (
    <div className="p-6">
      <ToastContainer />
      
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      {/* Status Tabs */}
      <div className="flex flex-wrap mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "all" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
        >
          All Orders
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "approved" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => { setActiveTab("approved"); setCurrentPage(1); }}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "completed" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => { setActiveTab("completed"); setCurrentPage(1); }}
        >
          Completed
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === "rejected" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => { setActiveTab("rejected"); setCurrentPage(1); }}
        >
          Rejected
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                    <div className="text-sm text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          src={order.product.imageUrl || "https://via.placeholder.com/40"} 
                          alt="" 
                          className="h-10 w-10 rounded-full object-cover" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{order.product.name}</div>
                        <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rs. {order.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openUpdateModal(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-md ${
              currentPage === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-md ${
              currentPage === totalPages 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Order ID: {selectedOrder.id}</p>
              <p className="text-sm text-gray-600 mb-1">Product: {selectedOrder.product.name}</p>
              <p className="text-sm text-gray-600">Customer: {selectedOrder.user.name}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Status</label>
              <select
                className="w-full p-2 border rounded-md"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Admin Notes</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes for the customer (optional)"
              ></textarea>
            </div>
            
            {/* Order Details */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium mb-2">Order Details:</h3>
              
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Quantity:</span> {selectedOrder.quantity}</p>
                <p><span className="font-medium">Total:</span> Rs. {selectedOrder.totalPrice.toLocaleString()}</p>
                
                {selectedOrder.customizations && Object.keys(selectedOrder.customizations).length > 0 && (
                  <div>
                    <p className="font-medium mt-2">Customizations:</p>
                    <ul className="list-disc list-inside pl-2">
                      {Object.entries(selectedOrder.customizations).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Explanatory Text */}
            <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
              <p>Please review this order and decide whether to approve or reject it.</p>
              <p className="mt-1">
                <strong>Note:</strong> Once an order is approved or rejected, you cannot change it back to pending.
              </p>
            </div>
            
            {/* Pending Order Notice */}
            {selectedOrder && selectedOrder.status === "pending" && (
              <div className="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  This order is currently pending approval.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              
              {/* Show different colored button based on selection */}
              <button
                onClick={handleUpdateOrder}
                className={`px-4 py-2 rounded-md text-white font-medium
                  ${newStatus === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                disabled={submitting}
              >
                {submitting 
                  ? "Processing..." 
                  : `${newStatus === "approved" ? "Approve" : "Reject"} Order`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;