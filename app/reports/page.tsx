"use client";

import Navbar from "@/Component/Navbar";
import { Send } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ResourceCenterData {
  id: number;
  technology: { id: number; techName: string };
  resources: string;
  course: { id: number; courseName: string };
  packageId: string;
  studentCount: number;
  verifiedCount?: number;
  pdfFileName: string;
  status: "ENTERED" | "VERIFIED" | "FINANCE" | "PAYMENT";
  paymentDate?: string;
  resourcecenter: {
    id: number;
    name: string;
    technology: string;
    type: string;
  };
}

const ReportsPage = () => {
  const [data, setData] = useState<ResourceCenterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verifiedCounts, setVerifiedCounts] = useState<{ [key: number]: number }>({});
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" | "" }>({ message: "", type: "" });

  const [paymentPopup, setPaymentPopup] = useState<{ open: boolean; file?: ResourceCenterData }>({ open: false });
  const [paymentDate, setPaymentDate] = useState<string>("");

  const showPopup = (message: string, type: "success" | "error" = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 2000);
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://10.226.39.57:8082/api/viewfile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch resource centers");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching resources:", error);
        showPopup("Error fetching resources", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleSubmitStatus = async (file: ResourceCenterData) => {
    try {
      const token = localStorage.getItem("token");

      let newStatus: ResourceCenterData["status"] = file.status;
      let verifiedCount: number | undefined;

      if (file.status === "ENTERED") {
        if (!verifiedCounts[file.id]) {
          showPopup("Please enter verified student count", "error");
          return;
        }
        newStatus = "VERIFIED";
        verifiedCount = verifiedCounts[file.id];
      } else if (file.status === "VERIFIED") {
        newStatus = "FINANCE";
      } else if (file.status === "FINANCE") {
        setPaymentPopup({ open: true, file });
        return;
      } else {
        showPopup("No further status change possible", "error");
        return;
      }

      const params = new URLSearchParams({ newStatus });
      if (verifiedCount !== undefined) {
        params.append("verifiedCount", String(verifiedCount));
      }

      const response = await fetch(
        `http://10.226.39.57:8082/api/update-status/${file.id}?${params}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const updatedFile = await response.json();

      setData(prev =>
        prev.map(d => (d.id === updatedFile.id ? updatedFile : d))
      );

      showPopup(`Status updated to ${updatedFile.status}`, "success");
    } catch (error) {
      console.error(error);
      showPopup("Error updating status", "error");
    }
  };

 const confirmPayment = async () => {
  if (!paymentDate || !paymentPopup.file) {
    showPopup("Please select a payment date", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // Convert to LocalDateTime string (ISO format)
    const isoDateTime = new Date(paymentDate).toISOString(); 
    // e.g., "2025-08-12T00:00:00.000Z"

    const params = new URLSearchParams({
      newStatus: "PAYMENT",
      paymentDate: isoDateTime,
    });

    const response = await fetch(
      `http://10.226.39.57:8082/api/update-status/${paymentPopup.file.id}?${params}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to update status");

    const updatedFile = await response.json();
    setData(prev => prev.map(d => (d.id === updatedFile.id ? updatedFile : d)));

    showPopup("Payment date saved and status updated", "success");
    setPaymentPopup({ open: false });
    setPaymentDate("");
  } catch (error) {
    console.error(error);
    showPopup("Error saving payment date", "error");
  }
};


  const filteredData = data.filter(res => {
    const matchesSearch =
      res.technology?.techName?.toLowerCase().includes(search.toLowerCase()) ||
      res.course?.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      res.resourcecenter?.name?.toLowerCase().includes(search.toLowerCase()) ||
      res.resources?.toLowerCase().includes(search.toLowerCase()) ||
      res.packageId?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Navbar />

      {/* Popup Notification */}
      {popup.message && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50 transition-opacity duration-500 ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {popup.message}
        </div>
      )}

      {/* Payment Date Popup */}
      {paymentPopup.open && (
       <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
  <div className="bg-gray-50 p-6 rounded-2xl shadow-xl w-96 border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Payment Date</h2>

    <input
      type="date"
      value={paymentDate}
      onChange={e => setPaymentDate(e.target.value)}
      max={new Date().toISOString().split("T")[0]} // ✅ Disable future dates
      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 bg-white"
    />

    <div className="flex justify-end gap-3">
      <button
        onClick={() => setPaymentPopup({ open: false })}
        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
      >
        Cancel
      </button>
      <button
        onClick={confirmPayment}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Confirm
      </button>
    </div>
  </div>
</div>

      )}

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by technology, course, center, type or package ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ENTERED">Entered</option>
              <option value="VERIFIED">Verified</option>
              <option value="FINANCE">Finance</option>
              <option value="PAYMENT">Payment</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700 border border-gray-200">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3">S.No.</th>
                      <th className="px-4 py-3">Technology</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Resource Center</th>
                      <th className="px-4 py-3">Resource Type</th>
                      <th className="px-4 py-3">Package ID</th>
                      <th className="px-4 py-3">Students</th>
                      <th className="px-4 py-3">PDF</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Verified Count</th>
                      <th className="px-4 py-3">Payment Date</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((res, index) => (
                        <tr key={res.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{res.technology?.techName ?? "—"}</td>
                          <td className="px-4 py-2">{res.course?.courseName ?? "—"}</td>
                          <td className="px-4 py-2">{res.resourcecenter?.name ?? "—"}</td>
                          <td className="px-4 py-2">{res.resources ?? "—"}</td>
                          <td className="px-4 py-2">{res.packageId ?? "—"}</td>
                          <td className="px-4 py-2">{res.studentCount ?? 0}</td>
                          <td className="px-4 py-2">
                            {res.pdfFileName ? (
                              <a
                                href={`http://10.226.39.57:8082/uploads/${res.pdfFileName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View PDF
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200">
                              {res.status ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {res.status === "ENTERED" ? (
                              <input
                                type="number"
                                value={verifiedCounts[res.id] || ""}
                                onChange={e =>
                                  setVerifiedCounts(prev => ({
                                    ...prev,
                                    [res.id]: parseInt(e.target.value) || 0,
                                  }))
                                }
                                placeholder="Enter No."
                                className="w-[60%] px-2 py-1 border border-gray-300 rounded-md text-sm"
                              />
                            ) : (
                              res.verifiedCount ?? "—"
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {res.status === "PAYMENT" ? res.paymentDate || "—" : "—"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSubmitStatus(res)}
                                disabled={res.status === "PAYMENT"}
                                className={`group relative p-2.5 rounded-lg shadow-md transition-all duration-200 cursor-pointer
                                  ${res.status === "PAYMENT"
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"}`}
                              >
                                <Send
                                  size={14}
                                  className={`${res.status === "PAYMENT" ? "" : "group-hover:rotate-12 transition-transform duration-200"}`}
                                />
                                {res.status !== "PAYMENT" && (
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    Submit
                                  </div>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="px-4 py-4 text-center text-gray-500">
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-gray-600">
                Showing <strong>{filteredData.length}</strong> of{" "}
                <strong>{data.length}</strong> total record(s).
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
