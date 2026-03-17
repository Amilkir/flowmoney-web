"use client";

import { useState } from "react";
import Image from "next/image";

const countries = [
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "México", flag: "🇲🇽" },
  { name: "Panamá", flag: "🇵🇦" },
  { name: "Perú", flag: "🇵🇪" },
  {
    name: "Venezuela", flag: "🇻�export default function Hero() {
  const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      firstName: "",
      isNewClient: null as boolean | null,
      serviceInterest: null as "efectivo" | "transferencia" | null,
      originCountry: null as string | null,
      destinationCountry: null as string | null,
    });

    const handleClear = () => {
      setFormData({
        firstName: "",
        isNewClient: null,
        serviceInterest: null,
        originCountry: null,
        destinationCountry: null,
      });
    };

    const handleNext = () => {
      if (step === 1) {
        if (formData.firstName && formData.isNewClient !== null) {
          setStep(2);
        } else {
          alert("Por favor, completa los datos antes de continuar.");
        }
      }
    };

    const handleBack = () => {
      if (step > 1) setStep(step - 1);
    };

    return(
    <section className = "relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden" >
        {/* Elementos decorativos de fondo (blur) */ }
        < div className = "absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none" >
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl" />
      </div >

  <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-white p-8 sm:p-10">

    {/* Encabezado */}
    <div className="flex flex-col items-center mb-10">
      <div className="relative w-28 h-28 mb-6 bg-white rounded-full shadow-sm flex items-center justify-center p-2 border border-gray-100">
        <Image
          src="/images/logo.png"
          alt="Logo Flow Money"
          fill
          className="object-contain p-2"
          priority
        />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">
        Bienvenido a Flow Money
      </h1>
      <p className="text-gray-500 text-center text-lg">
        {step === 1 && "Comencemos con algunos datos"}
        {step === 2 && "¿Qué servicio te interesa?"}
        {step === 3 && "¿Desde qué país envías?"}
        {step === 4 && "¿A qué país envías?"}
      </p>
    </div>

    {/* Formulario con Efecto de Fade */}
    <div key={step} className="space-y-6 animate-fade-in transition-all duration-500">
      {step === 1 && (
        <>
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
              ¿Eres cliente nuevo?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isNewClient: true })}
                className={`flex-1 flex justify-center items-center py-2 rounded-2xl font-bold transition-all duration-200 ${formData.isNewClient === true
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2"
                  : "bg-gray-50/80 border border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isNewClient: false })}
                className={`flex-1 flex justify-center items-center py-2 rounded-2xl font-bold transition-all duration-200 ${formData.isNewClient === false
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2"
                  : "bg-gray-50/80 border border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
              >
                No
              </button>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setFormData({ ...formData, serviceInterest: "efectivo" });
              setStep(3);
            }}
            className={`w-full flex justify-center items-center py-4 rounded-2xl font-bold transition-all duration-200 ${formData.serviceInterest === "efectivo"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2"
              : "bg-gray-50/80 border border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
          >
            Remesa Efectivo
          </button>
          <button
            type="button"
            onClick={() => {
              const newFormData = { ...formData, serviceInterest: "transferencia" as const };
              setFormData(newFormData);
              console.log("Datos finales (Transferencia):", newFormData);
            }}
            className={`w-full flex justify-center items-center py-4 rounded-2xl font-bold transition-all duration-200 ${formData.serviceInterest === "transferencia"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2"
              : "bg-gray-50/80 border border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
          >
            Remesa Transferencia
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {countries.map((country) => (
            <button
              key={country.name}
              type="button"
              onClick={() => {
                const newFormData = { ...formData, originCountry: country.name };
                setFormData(newFormData);
                setStep(4);
              }}
              className={`flex items-center justify-between px-6 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${formData.originCountry === country.name
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600"
                : "bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100"
                }`}
            >
              <span className="text-lg">{country.name}</span>
              <span className="text-2xl">{country.flag}</span>
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {countries.map((country) => (
            <button
              key={country.name}
              type="button"
              onClick={() => {
                const newFormData = { ...formData, destinationCountry: country.name };
                setFormData(newFormData);
                console.log("Datos finales:", newFormData);
              }}
              className={`flex items-center justify-between px-6 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${formData.destinationCountry === country.name
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600"
                : "bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100"
                }`}
            >
              <span className="text-lg">{country.name}</span>
              <span className="text-2xl">{country.flag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Botones de acción */}
      <div className="pt-6 flex gap-3">
        {step === 1 ? (
          <>
            <button
              type="button"
              onClick={handleClear}
              className="w-1/3 py-2.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-2/3 py-2.5 rounded-2xl font-bold text-white bg-gray-900 hover:bg-black shadow-xl shadow-black/10 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Siguiente
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={handleBack}
              className="w-1/3 py-2.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Volver
            </button>
          </div>
        )}
      </div>     </button>
  </div>
            )}
          </div >
        </div >

      </div >
  <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section >
  );
}
