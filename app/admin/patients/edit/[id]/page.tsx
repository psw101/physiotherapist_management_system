"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import EditPatient from '@/app/components/EditPatient';

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

const PatientEditPage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  useEffect(() => {
    // Fetch the specific patient
    const fetchPatient = async () => {
      try {
        setLoading(true);
        // Add the leading slash to make it an absolute path
        const response = await axios.get(`/api/patients/${id}`);
        setPatient(response.data);
        
        // Also fetch all patients for the update function
        const allPatientsResponse = await axios.get('/api/patients');
        setPatients(allPatientsResponse.data);
      } catch (error) {
        console.error('Error fetching patient:', error);
        router.push('/admin/patients/view-patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  // If editing is done, redirect back to the patients list
  useEffect(() => {
    if (!isEditing && !loading) {
      router.push('/admin/patients/view-patients');
    }
  }, [isEditing, loading, router]);

  if (loading) {
    return <div className="flex justify-center p-6">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center p-6">Patient not found.</div>;
  }

  return (
    <div className="p-6">
      <EditPatient
        patients={patients}
        selectedPatient={patient}
        setPatients={setPatients}
        setIsEditing={setIsEditing}
      />
    </div>
  );
};

export default PatientEditPage;