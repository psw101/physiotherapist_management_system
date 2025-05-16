"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Specification {
  key: string;
  value: string;
}

interface SpecificationAdderProps {
  initialSpecs?: Specification[];
  onChange: (specs: Specification[]) => void;
  className?: string;
}

const SpecificationAdder = ({ 
  initialSpecs = [{ key: "weight", value: "15 kg" }],
  onChange,
  className = "" 
}: SpecificationAdderProps) => {
  const [specs, setSpecs] = useState<Specification[]>(initialSpecs);
  const [newSpec, setNewSpec] = useState<Specification>({ key: "", value: "" });

  const handleAddSpec = () => {
    if (!newSpec.key || !newSpec.value) return;
    
    const updatedSpecs = [...specs, newSpec];
    setSpecs(updatedSpecs);
    onChange(updatedSpecs);
    setNewSpec({ key: "", value: "" });
  };

  const handleRemoveSpec = (index: number) => {
    const updatedSpecs = specs.filter((_, i) => i !== index);
    setSpecs(updatedSpecs);
    onChange(updatedSpecs);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpec();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Add new specification */}
      <div className="grid grid-cols-5 gap-4 items-end">
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-medium text-gray-600">Attribute</label>
          <input 
            type="text" 
            placeholder="Height" 
            className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" 
            value={newSpec.key} 
            onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })} 
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-medium text-gray-600">Value</label>
          <input 
            type="text" 
            placeholder="16 inch" 
            className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" 
            value={newSpec.value} 
            onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })} 
            onKeyPress={handleKeyPress}
          />
        </div>
        <button 
          type="button" 
          onClick={handleAddSpec} 
          className="h-10 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!newSpec.key || !newSpec.value}
        >
          <Plus size={18} className="inline mr-1" />
          Add
        </button>
      </div>

      {/* Specifications list */}
      {specs.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-md p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Attribute</th>
                <th className="pb-2">Value</th>
                <th className="pb-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-2 capitalize">{spec.key}</td>
                  <td className="py-2">{spec.value}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                      aria-label={`Remove ${spec.key} specification`}
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpecificationAdder;