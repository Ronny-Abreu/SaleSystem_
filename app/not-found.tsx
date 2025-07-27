"use client";

export default function NotFound() {
  return (
    <div className="w-full h-screen bg-black text-white flex flex-col justify-center items-center">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-[80px] select-none font-bold">404</h1>
        <span style={{ fontFamily: 'Poppins, sans-serif' }}>Disculpa la herramienta a la que intentas acceder no se encuentra disponible...</span>
        <a href="/" className="py-1 px-2 bg-amber-200 hover:bg-amber-100 text-black rounded-2xl w-[15em] mt-6">Volver al inicio</a>
      </div>
    </div>
  );
} 