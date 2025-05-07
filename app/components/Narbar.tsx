"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Narbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div>
      <nav>
        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-emerald-400">
          <header className="flex justify-between items-center text-black py-6 px-8 md:px-32 bg-white drop-shadow-md">
            <ul className=" xl:flex hidden items-center gap-16 font-semibold text-base">
              <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link href="/">Home</Link></li>
              <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link href="/patients">Patients</Link></li>
              <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link href="/products">Products</Link></li>
              <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link href="/appointments">Appointments</Link></li>
              <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link href="/reports">Reports</Link></li>
              <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link href="/settings">Settings</Link></li>
            </ul>
            <div>
              <Image className="xl:hidden " src="images/menu.svg" width={20} height={20} alt="Menu icon" onClick={() => setIsMenuOpen(!isMenuOpen)} />
              <div className={`absolute xl:hidden left-0 w-full bg-white flex flex-col items-center gap-6 font-semibold text-lg transform transition-transform ${isMenuOpen ? "opacity-100" : "opacity-0"}`} style={{ transition: "trasnform 0.3s ease, opacity 0.03s ease" }}>
                <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer text-center"><Link href="/">Home</Link></li>
                <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer text-center"><Link href="/patients">Patients</Link></li>
                <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer text-center"><Link href="/products">Products</Link></li>
                <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer text-center"><Link href="/appointments">Appointments</Link></li>
                <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer text-center"><Link href="/reports">Reports</Link></li>
                <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer text-center"><Link href="/settings">Settings</Link></li>
              </div>
            </div>
          </header>
        </div>
      </nav>
    </div>
  );
};

export default Narbar;
