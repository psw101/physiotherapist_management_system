"use client";
import React, { useState, useEffect } from 'react';
import PatientTable from '@/components/PatientTable';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Patient } from '@/types/models';

const PatientViewPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch patients data when component mounts
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/api/patients'); // Add leading slash here
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/admin/patients/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`/api/patients/${id}`);
        // Remove the deleted patient from the state
        setPatients(patients.filter(patient => patient.id !== id));
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading patients...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patient List</h1>
      <PatientTable
        patients={patients}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default PatientViewPage;