"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { useSession } from "next-auth/react";
import { IoIosArrowDown } from "react-icons/io";

// Define types for navigation items
interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  dropdown: NavSubItem[] | null;
}

const Navbar = () => {
  const { status, data: session } = useSession();
  const currentPath = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  if (status === "loading") return null;

  // Navigation items data
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', dropdown: null },
    {
      label: 'Products', 
      href: '#', 
      dropdown: [
        { label: 'Add Products', href: '/products/add-products' },
        { label: 'View Products', href: '/products/view-products' },
        { label: 'Product Categories', href: '/products/categories' },
      ]
    },
    {
      label: 'Appointments',
      href: '',
      dropdown: [
        { label: 'View All', href: '/appointments' },
        { label: 'Make Appointment', href: '/appointments/make-appointments' },
        { label: 'Calendar', href: '/appointments/calendar' },
      ]
    },
    { label: 'Reports', href: '/reports', dropdown: null },
    { label: 'Settings', href: '/settings', dropdown: null },
    { label: 'Cart', href: '/cart', dropdown: null },

  ];

  // Handle dropdown toggling
  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // Handle mouse events for desktop dropdowns
  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-white shadow-md w-full px-4 py-3 mb-6">
      {/* Navigation Bar Container */}
      <div className="flex justify-between items-center">
        {/* Brand Logo */}
        <div className="text-xl font-bold">Sethphysio Lanka</div>
        
        {/* Desktop Navigation */}
        <ul className="hidden xl:flex items-center space-x-6">
          {navItems.map((item) => (
            <li 
              key={item.label} 
              className="relative"
              onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              {item.dropdown ? (
                // Item with dropdown
                <div className="relative">
                  <button
                    onClick={() => handleDropdownToggle(item.label)}
                    className={classNames(
                      "px-2 py-1 flex items-center transition-colors",
                      {
                        'text-zinc-900 font-medium': activeDropdown === item.label,
                        'text-zinc-500 hover:text-zinc-800': activeDropdown !== item.label,
                      }
                    )}
                  >
                    {item.label}
                    <IoIosArrowDown className="ml-1" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {activeDropdown === item.label && (
                    <div className="absolute left-0 -mt-1 w-48 bg-white rounded-md shadow-lg z-20">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={classNames(
                            "block px-4 py-2 text-sm",
                            {
                              'bg-gray-100 text-zinc-900': subItem.href === currentPath,
                              'text-zinc-600 hover:bg-gray-100': subItem.href !== currentPath,
                            }
                          )}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular link item
                <Link 
                  href={item.href} 
                  className={classNames(
                    "px-2 py-1 transition-colors",
                    {
                      'text-zinc-900 font-medium': item.href === currentPath,
                      'text-zinc-500 hover:text-zinc-800': item.href !== currentPath,
                    }
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          
          {/* Authentication Section */}
          <div className="border-l pl-6 ml-2">
            {status === 'authenticated' && (
              <>
                <span className="mr-4 text-zinc-700">{session.user!.name}</span>
                <Link href="/api/auth/signout" className="text-red-600 hover:text-red-800">
                  Sign out
                </Link>
              </>
            )}
            {status === 'unauthenticated' && (
              <Link href="/api/auth/signin" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
            )}
          </div>
        </ul>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden text-gray-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <IoMdClose size={24} /> : <CiMenuBurger size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div 
        className={classNames(
          "xl:hidden absolute left-0 right-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out",
          {
            "max-h-screen opacity-100 mt-3": isMenuOpen,
            "max-h-0 opacity-0 overflow-hidden": !isMenuOpen
          }
        )}
      >
        <ul className="px-4 py-2">
          {navItems.map((item) => (
            <li key={item.label} className="py-2">
              {item.dropdown ? (
                <div>
                  <button
                    onClick={() => handleDropdownToggle(item.label)}
                    className="flex justify-between items-center w-full py-2 text-zinc-700 font-medium"
                  >
                    {item.label}
                    <IoIosArrowDown 
                      className={classNames("transition-transform", {
                        "transform rotate-180": activeDropdown === item.label
                      })}
                    />
                  </button>
                  
                  <div 
                    className={classNames("pl-4 space-y-2 overflow-hidden transition-all duration-300", {
                      "max-h-screen py-2": activeDropdown === item.label,
                      "max-h-0": activeDropdown !== item.label
                    })}
                  >
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={classNames("block py-1 text-sm", {
                          "text-blue-600 font-medium": subItem.href === currentPath,
                          "text-zinc-600": subItem.href !== currentPath
                        })}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  href={item.href}
                  className={classNames("block py-2", {
                    "text-blue-600 font-medium": item.href === currentPath,
                    "text-zinc-700": item.href !== currentPath
                  })}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          
          {/* Mobile Auth Links */}
          <li className="py-2 mt-2 pt-2 border-t border-gray-200">
            {status === 'authenticated' ? (
              <div className="flex flex-col space-y-2">
                <span className="text-zinc-700">{session.user!.name}</span>
                <Link 
                  href="/api/auth/signout" 
                  className="text-red-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign out
                </Link>
              </div>
            ) : (
              <Link 
                href="/api/auth/signin" 
                className="text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;