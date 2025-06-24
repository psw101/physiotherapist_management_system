import React from 'react';
import { Patient, TableProps } from '@/types/models';

 const PatientTable: React.FC<TableProps> = ({ patients, handleEdit, handleDelete }) => {
  // Assign sequential IDs if not present
  patients.forEach((patient, i) => {
    if (!patient.id) {
      patient.id = i + 1;
    }
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full max-w-full border-collapse border-spacing-0">
        <thead>
          <tr>
            <th className="text-left p-2 border-b-2 border-gray-300">No.</th>
            <th className="text-left p-2 border-b-2 border-gray-300">Name</th>
            <th className="text-left p-2 border-b-2 border-gray-300">Username</th>
            <th className="text-left p-2 border-b-2 border-gray-300">Age</th>
            <th className="text-left p-2 border-b-2 border-gray-300">Email</th>
            <th className="text-left p-2 border-b-2 border-gray-300">Contact</th>
            <th className="text-left p-2 border-b-2 border-gray-300">Area</th>
            <th colSpan={2} className="text-center p-2 border-b-2 border-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((patient, i) => (
              <tr key={patient.id} className={i % 2 === 1 ? "bg-gray-100" : ""}>
                <td className="p-2 border-b border-gray-300">{i + 1}</td>
                <td className="p-2 border-b border-gray-300">{patient.name}</td>
                <td className="p-2 border-b border-gray-300">{patient.username}</td>
                <td className="p-2 border-b border-gray-300">{patient.age}</td>
                <td className="p-2 border-b border-gray-300">{patient.email}</td>
                <td className="p-2 border-b border-gray-300">{patient.contactNumber}</td>
                <td className="p-2 border-b border-gray-300">{patient.area}</td>
                <td className="text-right p-2 border-b border-gray-300">
                  <button
                    onClick={() => handleEdit(patient.id!)}
                    className="inline-block border border-gray-300 bg-transparent text-gray-600 font-semibold py-1 px-3 rounded hover:border-gray-500 mr-1"
                  >
                    Edit
                  </button>
                </td>
                <td className="text-left p-2 border-b border-gray-300">
                  <button
                    onClick={() => handleDelete(patient.id!)}
                    className="inline-block border border-gray-300 bg-transparent text-gray-600 font-semibold py-1 px-3 rounded hover:border-gray-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="p-2 text-center">No Patients</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;