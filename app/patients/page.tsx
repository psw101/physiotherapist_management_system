"use client";
import React from "react";

const Patients = () => {
  return (
    <div>
      <form className="w-full max-w-sm mx-auto space-y-6">
        <div className="border rounded-lg p-6 bg-gray-50 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Patient Details</h3>

          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-600">
              Name
            </label>
            <input id="name" name="name" placeholder="Ex: John Liam" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Username */}
          <div className="space-y-1 mt-4">
            <label htmlFor="username" className="text-sm font-medium text-gray-600 capitalize">
              user name
            </label>
            <input id="username" name="username" placeholder="Ex: John Liam" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Password */}
          <div className="space-y-1 mt-4">
            <label htmlFor="password" className="text-sm font-medium text-gray-600 capitalize">
              password
            </label>
            <input id="password" name="password" type="password" placeholder="****************" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Age */}
          <div className="space-y-1 mt-4">
            <label htmlFor="age" className="text-sm font-medium text-gray-600">
              Age
            </label>
            <input id="age" name="age" type="number" placeholder="24" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Contact Number */}
          <div className="space-y-1 mt-4">
            <label htmlFor="contact" className="text-sm font-medium text-gray-600">
              Contact Number
            </label>
            <input id="contact" name="contact" placeholder="07xxxxxxxx" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Email */}
          <div className="space-y-1 mt-4">
            <label htmlFor="email" className="text-sm font-medium text-gray-600">
              Email
            </label>
            <input id="email" name="email" type="email" placeholder="Ex: abc@abc.com" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Area */}
          <div className="space-y-1 mt-4">
            <label htmlFor="area" className="text-sm font-medium text-gray-600">
              Area
            </label>
            <input id="area" name="area" placeholder="Western Province" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* NIC / Passport */}
          <div className="space-y-1 mt-4">
            <label htmlFor="nic" className="text-sm font-medium text-gray-600">
              NIC / Passport
            </label>
            <input id="nic" name="nic" placeholder="222222222222222" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>

          {/* Address */}
          <div className="space-y-1 mt-4">
            <label htmlFor="address" className="text-sm font-medium text-gray-600">
              Address
            </label>
            <input id="address" name="address" placeholder="22b backer street" className="w-full rounded-md border-gray-300 bg-gray-200 text-sm px-3 py-2 focus:ring-0 focus:border-indigo-500" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button type="submit" className="flex-1 h-10 rounded-md bg-indigo-600 text-white text-sm font-medium tracking-wider hover:bg-indigo-700">
            confirm
          </button>
          <button type="button" className="flex-1 h-10 rounded-md bg-indigo-600 text-white text-sm font-medium tracking-wider hover:bg-indigo-700">
            cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Patients;
