'use client';
import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, TrendingUp, IndianRupee } from 'lucide-react';
import Navbar from '@/Component/Navbar';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

// ✅ Define interface matching your backend response
interface Invoice {
  id: number;
  dealerId: number;
  vehicleId: number;
  customerName: string;
  vehiclePrice: number;
  tax: number;
  totalPrice: number;
  invoiceNumber: string;
  createdAt: string;
  transactionId: string;
}

const InvoiceDashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

 useEffect(() => {
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token"); // 👈 get token from storage

      const response = await fetch("http://159.65.151.218:8080/invoices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 send token
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Invoice[] = await response.json();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false); // 👈 always stop loader
    }
  };

  fetchInvoices();
}, []);


  useEffect(() => {
    const filtered = invoices.filter(invoice =>
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
const handleDownload = async (invoice: Invoice) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Invoice Report", 14, 20);

  // Generate QR code (with transaction ID)
  const qrDataUrl = await QRCode.toDataURL(invoice.transactionId, {
    errorCorrectionLevel: "H", // better quality
    width: 100,
  });

  // Add QR code to PDF (top-right corner)
  doc.addImage(qrDataUrl, "PNG", 150, 10, 40, 40);

  // Invoice metadata
  autoTable(doc, {
    startY: 60,
    theme: "grid",
    styles: { fontSize: 12, cellPadding: 4 },
    body: [
      ["Invoice Number:", invoice.invoiceNumber || "-"],
      ["Customer Name:", invoice.customerName || "-"],
      ["Vehicle ID:", invoice.vehicleId?.toString() || "-"],
      ["Vehicle Price:", `INR ${Number(invoice.vehiclePrice).toLocaleString("en-IN")}`],
      ["Tax:", `INR ${Number(invoice.tax).toLocaleString("en-IN")}`],
      ["Total Price:", `INR ${Number(invoice.totalPrice).toLocaleString("en-IN")}`],
      ["Transaction ID:", invoice.transactionId || "-"],
      ["Date:", formatDate(invoice.createdAt)],
    ],
  });

  // Save PDF
  doc.save(`invoice_${invoice.invoiceNumber}.pdf`);
};


  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalPrice, 0);
  const totalInvoices = invoices.length;
  const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  // ✅ Fixed: no more `any` for icon
  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color = "blue"
  }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    change?: string;
    color?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) => {
    if (!invoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle ID:</span>
              <span className="font-medium">{invoice.vehicleId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle Price:</span>
              <span className="font-medium">{formatCurrency(invoice.vehiclePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-900 font-semibold">Total:</span>
              <span className="font-bold text-green-600">{formatCurrency(invoice.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(invoice.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-800">{invoice.transactionId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1>
            <p className="text-gray-600">Track and manage your vehicle sales invoices</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={IndianRupee}
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              change="+12.5%"
              color="green"
            />
            <StatCard
              icon={FileText}
              title="Total Invoices"
              value={totalInvoices}
              change="+3.2%"
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              title="Average Invoice"
              value={formatCurrency(averageInvoiceValue)}
              change="+8.1%"
              color="purple"
            />
          </div>

          {/* Search + Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {invoice.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.vehicleId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(invoice.totalPrice)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tax: {formatCurrency(invoice.tax)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 ">
  <div className="flex items-center ">
    <button
      onClick={() => handleDownload(invoice)}
      className="text-green-600 hover:text-green-800 transition-colors"
      title="Download"
    >
      <Download className="w-4 h-4" />
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No invoices found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Detail Modal */}
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      </div>
    </div>
  );
};

export default InvoiceDashboard;
