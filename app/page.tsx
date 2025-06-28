import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  return (
    <div 
      className="absolute inset-0 top-16 bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center overflow-hidden h-screen -mt-3"
      style={{
        backgroundSize: '100% 100%' /* Force stretch to fill exactly */
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      {/* Content with higher z-index */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto text-white">
        {session && (
          <h2 className="text-2xl font-light mb-4">
            Welcome back, <span className="font-medium">{session.user?.name}</span>
          </h2>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Empowering Your Recovery with Personalized Physiotherapy
        </h1>
        
        <p className="text-xl md:text-2xl mb-8">
          Your journey to wellness begins with expert care and proven techniques.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/appointments/book-appointments" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Book an Appointment
          </Link>
          
          <Link href="/user/products" 
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg backdrop-blur-sm transition-colors">
            Explore Products
          </Link>
        </div>
      </div>
    </div>
  );
}
