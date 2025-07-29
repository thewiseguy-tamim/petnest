// src/pages/Terms.jsx
import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using PetNest, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily use PetNest for personal, non-commercial transitory viewing only.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Treat all pets and users with respect</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Pet Listings</h2>
          <p className="mb-4">
            Users are responsible for the accuracy of their pet listings. PetNest reserves the right to remove any listing that violates our policies.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Privacy</h2>
          <p className="mb-4">
            Your use of PetNest is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            Email: legal@petnest.com
            <br />
            Phone: +1 (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;