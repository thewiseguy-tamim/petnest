// src/pages/EditPet.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EditPetForm from '../components/pets/EditPetForm';

const EditPet = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-33">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/dashboard/client/posts"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Posts
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6 ">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {id && id !== 'undefined' ? 'Edit Pet Listing' : 'Invalid Pet'}
          </h1>
          <EditPetForm />
        </div>
      </div>
    </div>
  );
};

export default EditPet;