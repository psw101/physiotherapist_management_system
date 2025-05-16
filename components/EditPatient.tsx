"use client";
import React, { useState } from 'react';
import axios from 'axios';

interface Patient {
  id: number;
  name: string;
  username: string;
  age: number;
  contactNumber: string;
  email: string;
  area: string;
  nic: string;
  address: string;
}

interface EditPatientProps {
  patients: Patient[];
  selectedPatient: Patient;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditPatient: React.FC<EditPatientProps> = ({ patients, selectedPatient, setPatients, setIsEditing }) => {
  const id = selectedPatient.id;

  const [name, setName] = useState(selectedPatient.name);
  const [username, setUsername] = useState(selectedPatient.username);
  const [age, setAge] = useState(selectedPatient.age);
  const [contactNumber, setContactNumber] = useState(selectedPatient.contactNumber);
  const [email, setEmail] = useState(selectedPatient.email);
  const [area, setArea] = useState(selectedPatient.area);
  const [nic, setNic] = useState(selectedPatient.nic);
  const [address, setAddress] = useState(selectedPatient.address);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !username || !age || !contactNumber || !email || !area || !nic || !address) {
      setError('All fields are required.');
      return;
    }

    const updatedPatient = {
      id,
      name,
      username,
      age,
      contactNumber,
      email,
      area,
      nic,
      address,
    };

    try {
      // Update patient via API
      await axios.put(`/api/patients/${id}`, updatedPatient);

      // Update local state
      const updatedPatients = patients.map(patient => 
        patient.id === id ? updatedPatient : patient
      );

      setPatients(updatedPatients);
      setSuccess(`${updatedPatient.name}'s data has been updated successfully.`);
      
      // Close the edit form after a short delay
      setTimeout(() => {
        setIsEditing(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating patient:', error);
      setError(error.response?.data?.error || 'Failed to update patient.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <form onSubmit={handleUpdate}>
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Patient</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-1">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-1">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 mb-1">Age</label>
          <input
            id="age"
            type="number"
            name="age"
            value={age}
            onChange={e => setAge(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="contactNumber" className="block text-gray-700 mb-1">Contact Number</label>
          <input
            id="contactNumber"
            type="text"
            name="contactNumber"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="area" className="block text-gray-700 mb-1">Area</label>
          <input
            id="area"
            type="text"
            name="area"
            value={area}
            onChange={e => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="nic" className="block text-gray-700 mb-1">NIC</label>
          <input
            id="nic"
            type="text"
            name="nic"
            value={nic}
            onChange={e => setNic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block text-gray-700 mb-1">Address</label>
          <textarea
            id="address"
            name="address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPatient;