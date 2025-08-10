// src/components/dashboard/PaymentPanel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Info, Shield } from 'lucide-react';
import Sidebar from '../ui/Sidebar';

const PaymentPanel = ({ isOpen, onClose }) => {
const navigate = useNavigate();

return (
<Sidebar isOpen={isOpen} onClose={onClose} title="Make a Payment" position="right">
<div className="p-4 space-y-4 text-gray-900">
<div className="rounded-lg p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
<div className="flex items-start">
<Info className="w-5 h-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
<div className="text-sm">
<p className="font-semibold text-gray-900">Listing Policy</p>
<ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700">
<li>Your first pet listing is free.</li>
<li>After that: $5 for Adoption listings and $20 for Sale listings.</li>
<li>Payments are processed via a secure gateway.</li>
</ul>
</div>
</div>
</div>
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Adoption Listing</h3>
          <p className="text-sm mt-1 text-gray-600">
            Flat fee for each adoption post after your first free listing.
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-600">$5</div>
          <div className="text-xs text-gray-500">per listing</div>
        </div>
      </div>
      <button
        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        onClick={() => {
          onClose();
          navigate('/pets/create');
        }}
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Create Adoption Listing
      </button>
    </div>

    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Sale Listing</h3>
          <p className="text-sm mt-1 text-gray-600">
            Flat fee per sale listing after your first free listing.
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-600">$20</div>
          <div className="text-xs text-gray-500">per listing</div>
        </div>
      </div>
      <button
        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        onClick={() => {
          onClose();
          navigate('/pets/create');
        }}
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Create Sale Listing
      </button>
    </div>

    <div className="rounded-lg p-3 flex items-start bg-gray-50 border border-gray-200">
      <Shield className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
      <p className="text-xs text-gray-700">
        All payments are processed securely. You’ll be redirected to the payment gateway when required.
      </p>
    </div>
  </div>
</Sidebar>
);
};

export default PaymentPanel;