'use client';

import React, { useState } from 'react';
import { 
  User, 
  Car, 
  Building2,  
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Save,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/Component/Navbar';

// Import your Navbar component
// import Navbar from '@/Component/Navbar';

export default function ModernInvoiceForm() {
  const [formData, setFormData] = useState({
    dealerId: '',
    vehicleId: '',
    customerName: '',
    vehiclePrice: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'

  // Handle input changes
// Correctly typed
type FormKeys = "dealerId" | "vehicleId" | "customerName" | "vehiclePrice";

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name as FormKeys]: value,
  }));
};


  // Clear form
  const clearForm = () => {
    setFormData({
      dealerId: '',
      vehicleId: '',
      customerName: '',
      vehiclePrice: '',
    });
    setMessage(null);
    setMessageType('');
  };

  // Submit Invoice
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setMessageType('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch('http://159.65.151.218:8080/invoices/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          dealerId: Number(formData.dealerId),
          vehicleId: Number(formData.vehicleId),
          customerName: formData.customerName,
          vehiclePrice: Number(formData.vehiclePrice),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Invoice created successfully! Invoice Number: ${result.invoiceNumber}`);
        setMessageType('success');
        setFormData({ dealerId: '', vehicleId: '', customerName: '', vehiclePrice: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || 'Failed to create invoice. Please check your details and try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Unable to connect to the server. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const MessageAlert: React.FC<{ message: string | null, type: string }> = ({ message, type }) => {
    if (!message) return null;

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="w-5 h-5" />;
        case 'error':
          return <AlertCircle className="w-5 h-5" />;
        default:
          return <AlertCircle className="w-5 h-5" />;
      }
    };

    const getStyles = () => {
      switch (type) {
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800';
        case 'error':
          return 'bg-red-50 border-red-200 text-red-800';
        default:
          return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    };

    return (
      <div className={`flex items-center space-x-3 p-4 border rounded-xl ${getStyles()}`}>
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  };

  return (
    <div>
      {/* Uncomment when using actual Navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-left mb-8">
           
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Invoice</h1>
            <p className="text-gray-600">Fill in the details below to generate a new invoice</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Invoice Details
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Message Alert */}
              <MessageAlert message={message} type={messageType} />

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dealer ID */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                    Dealer ID
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="dealerId"
                      value={formData.dealerId}
                      onChange={handleChange}
                      required
                      placeholder="Enter dealer ID"
                      className="w-full px-4 py-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>

                {/* Vehicle ID */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Car className="w-4 h-4 mr-2 text-blue-600" />
                    Vehicle ID
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      required
                      placeholder="Enter vehicle ID"
                      className="w-full px-4 py-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Name - Full Width */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Customer Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    placeholder="Enter customer full name"
                    className="w-full px-4 py-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              {/* Vehicle Price */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                 
                  Vehicle Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    name="vehiclePrice"
                    value={formData.vehiclePrice}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Invoice...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Ensure all IDs are valid and exist in the system</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Vehicle price should be the base amount before tax</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Customer name should match official documents</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Tax will be calculated automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}