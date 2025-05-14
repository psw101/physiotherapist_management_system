"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { useSession } from "next-auth/react";
import { IoIosArrowDown } from "react-icons/io";

const Narbar = () => {
  const { status, data: session } = useSession();
  const currentPath = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveringDropdown, setHoveringDropdown] = useState<string | null>(null);

  if(status === "loading") return null

  // Two-dimensional array for navigation with dropdowns
  // Format: [label, href, [dropdown items]]
  const navItems = [
    {label: 'Dashboard', href: '/', dropdown: null},
    {label: 'Patients', href: '/patients', dropdown: null},
    {
      label: 'Products', 
      href: '#', 
      dropdown: [
        {label: 'Add Products', href: '/products/add-products'},
        {label: 'View Products', href: '/products/view-products'},
        {label: 'Product Categories', href: '/products/categories'},
      ]
    },
    {
      label: 'Appointments', 
      href: '#', 
      dropdown: [
        {label: 'View All', href: '/appointments'},
        {label: 'Make Appointment', href: '/appointments/make-appointments'},
        {label: 'Calendar', href: '/appointments/calendar'},
      ]
    },
    {label: 'Reports', href: '/reports', dropdown: null},
    {label: 'Settings', href: '/settings', dropdown: null},
  ];

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(label);
    }
  };
  
  // Determine if dropdown should be shown (either clicked open or currently hovering)
  const isDropdownVisible = (label: string) => {
    return openDropdown === label || hoveringDropdown === label;
  };
  
  return (
    <nav className="bg-white shadow-md w-full px-4 py-3 mb-6">
      {/* Desktop & Mobile Navigation Bar */}
      <div className="flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="text-xl font-bold">PhysioSystem</div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <ul className="hidden xl:flex items-center space-x-6">
          {navItems.map(item => (
            <li 
              key={item.label} 
              className="relative"
              onMouseEnter={() => item.dropdown && setHoveringDropdown(item.label)}
              onMouseLeave={() => setHoveringDropdown(null)}
            >
              {item.dropdown ? (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={classNames({
                      'text-zinc-900 font-medium': isDropdownVisible(item.label),
                      'text-zinc-500': !isDropdownVisible(item.label),
                      'hover:text-zinc-800 transition-colors': true,
                      'px-2 py-1 flex items-center': true,
                    })}
                  >
                    {item.label}
                    <IoIosArrowDown className="ml-1" />
                  </button>
                  
                  {isDropdownVisible(item.label) && (
                    <div 
                      className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20"
                    >
                      {item.dropdown.map(subItem => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={classNames({
                            'block px-4 py-2 text-sm': true,
                            'bg-gray-100 text-zinc-900': subItem.href === currentPath,
                            'text-zinc-600 hover:bg-gray-100': subItem.href !== currentPath,
                          })}
                          onClick={() => {
                            setOpenDropdown(null);
                            setHoveringDropdown(null);
                          }}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href={item.href} 
                  className={classNames({
                    'text-zinc-900 font-medium': item.href === currentPath,
                    'text-zinc-500': item.href !== currentPath,
                    'hover:text-zinc-800 transition-colors': true,
                    'px-2 py-1': true,
                  })}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          
          {/* Auth Section */}
          <div className="border-l pl-6 ml-2">
            {status === 'authenticated' && <div className="mr-4 text-zinc-700">{session.user!.name}</div>}
            {status === 'authenticated' && <Link href="/api/auth/signout" className="text-red-600 hover:text-red-800">Sign out</Link>}
            {status === 'unauthenticated' && <Link href="/api/auth/signin" className="text-blue-600 hover:text-blue-800">Login</Link>}
          </div>
        </ul>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden text-gray-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <IoMdClose size={24} />
          ) : (
            <CiMenuBurger size={24} />
          )}
        </button>
      </div>
      
      {/* Mobile Dropdown Menu - Keep original click behavior */}
      <div 
        className={classNames(
          "xl:hidden absolute left-0 right-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out",
          {
            "max-h-screen opacity-100 mt-3": isMenuOpen,
            "max-h-0 opacity-0 overflow-hidden": !isMenuOpen
          }
        )}
      >
        {/* Rest of your mobile menu code remains unchanged */}
      </div>
    </nav>
  );
};

export default Narbar;
