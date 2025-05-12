"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { useSession } from "next-auth/react";

const Narbar = () => {
  const { status, data: session } = useSession();
  const currentPath = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if(status === "loading") return null

  const links = [
    {label:'Dashboard', href: '/'},
    {label:'Patients', href: '/patients'},
    {label:'Products', href: '/products/test2'},
    {label:'Appointments', href: '/appointments'},
    {label:'Reports', href: '/reports'},
    {label:'Settings', href: '/settings'},
    {label:'Make Appointments', href: '/appointments/make-appointments'},

  ];


  
  return (
    <nav className="bg-white shadow-md w-full px-4 py-3 mb-6">
      {/* Desktop & Mobile Navigation Bar */}
      <div className="flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="text-xl font-bold">PhysioSystem</div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <ul className="hidden xl:flex items-center space-x-6">
          {links.map(link => (
            <Link 
              key={link.href} 
              className={classNames({
                'text-zinc-900 font-medium': link.href === currentPath,
                'text-zinc-500': link.href !== currentPath,
                'hover:text-zinc-800 transition-colors': true,
                'px-2 py-1': true,
              })}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          {status === 'authenticated' && <div>{session.user!.name}</div>}
          {status === 'authenticated' && <Link href="/api/auth/signout">Sign out</Link>}
          {status === 'unauthenticated' && <Link href="/api/auth/signin">Login</Link>}
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
      
      {/* Mobile Dropdown Menu */}
      <div 
        className={classNames(
          "xl:hidden absolute left-0 right-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out",
          {
            "max-h-[400px] opacity-100 mt-3": isMenuOpen,
            "max-h-0 opacity-0 overflow-hidden": !isMenuOpen
          }
        )}
      >
        <div className="py-2 px-4">
          {links.map(link => (
            <Link 
              key={link.href}
              href={link.href}
              className={classNames(
                "block py-3 border-b border-gray-100 w-full",
                {
                  'text-zinc-900 font-medium': link.href === currentPath,
                  'text-zinc-500': link.href !== currentPath,
                  'hover:bg-gray-50': true
                }
              )}
              onClick={() => setIsMenuOpen(false)} // Close menu when link is clicked
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Narbar;
