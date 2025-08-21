'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function InvoiceForm() {
  const [formData, setFormData] = useState({
    dealerId: '',
    vehicleId: '',
    customerName: '',
    vehiclePrice: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Submit Invoice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8082/invoices/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔑 if using JWT
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
        setMessage(`✅ Invoice Created! ID: ${result.invoiceNumber}`);
        setFormData({ dealerId: '', vehicleId: '', customerName: '', vehiclePrice: '' });
      } else {
        setMessage('❌ Failed to create invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('⚠️ Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-gray-50 text-gray-800 p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">
            🧾 Create New Invoice
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dealer ID */}
            <div>
              <label className="block text-sm font-medium mb-1">Dealer ID</label>
              <input
                type="number"
                name="dealerId"
                value={formData.dealerId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>

            {/* Vehicle ID */}
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle ID</label>
              <input
                type="number"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>

            {/* Vehicle Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Price ($)</label>
              <input
                type="number"
                name="vehiclePrice"
                value={formData.vehiclePrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 mt-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:bg-gray-400"
            >
              {isSubmitting ? 'Submitting...' : 'Create Invoice'}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-sm font-medium text-gray-700">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
