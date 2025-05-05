"use client";

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              {/* Replace with your logo */}
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                PM
              </div>
              <span className="text-xl font-semibold text-gray-900">PhysioManage</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              href="/" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
            >
              Home
            </Link>
            <Link 
              href="/appointments" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
            >
              Appointments
            </Link>
            <Link 
              href="/patients" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
            >
              Patients
            </Link>
            <Link 
              href="/exercises" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
            >
              Exercises
            </Link>
            <Link 
              href="/reports" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
            >
              Reports
            </Link>
          </div>

          <div className="hidden md:ml-4 md:flex md:items-center">
            <button className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
          >
            Home
          </Link>
          <Link
            href="/appointments"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
          >
            Appointments
          </Link>
          <Link
            href="/patients"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
          >
            Patients
          </Link>
          <Link
            href="/exercises"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
          >
            Exercises
          </Link>
          <Link
            href="/reports"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
          >
            Reports
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-2 space-y-1">
            <button className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;