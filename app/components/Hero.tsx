"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Flag from "react-world-flags";
import { useAppContext } from "../context/AppContext";

// --- List of Countries ---
const countries = [
  { name: "Argentina", iso: "AR" },
  { name: "Chile", iso: "CL" },
  { name: "Colombia", iso: "CO" },
  { name: "España", iso: "ES" },
  { name: "Estados Unidos", iso: "US" },
  { name: "México", iso: "MX" },
  { name: "Panamá", iso: "PA" },
  { name: "Perú", iso: "PE" },
  { name: "Venezuela", iso: "VE" }
];

const originPaymentMethods: Record<string, string[]> = {
  CL: ["Banco Estado", "Banco de Chile"],
  PE: ["Interbank", "Plin"],
  CO: ["Bancolombia"],
  VE: ["Banco de Venezuela", "Banesco"],
  PA: ["Banesco Panama"],
  MX: ["Bancomer", "Depósito por Oxxo"],
  ES: ["Revolut Bank"],
  AR: ["MercadoPago"]
};

const destinationPaymentMethods: Record<string, string[]> = {
  CL: ["Banco Estado", "Banco de Chile"],
  PE: ["Interbank", "Plin"],
  CO: ["Bancolombia"],
  VE: ["Banco de Venezuela", "Banesco", "Pago Movil"],
  PA: ["Banesco Panama"],
  MX: ["Bancomer", "Depósito por Oxxo"],
  ES: ["Revolut Bank"],
  AR: ["MercadoPago"]
};

// --- Formaters (Defined outside to prevent React recreating them every keystroke input) ---
const currencyFormatter = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rateFormatter = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 5 });

const formatValue = (val: number) => {
  if (!val) return "";
  return currencyFormatter.format(val);
};

// --- Custom Country Select Component ---
const CountrySelect = ({ label, value, onChange, placeholder, options = countries }: { label: string, value: string, onChange: (val: string) => void, placeholder: string, options?: typeof countries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = options.find(c => c.iso === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full mb-4" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3.5 cursor-pointer rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-gray-900 shadow-sm"
      >
        <div className="flex items-center gap-3">
          {selectedCountry ? (
            <>
              <Flag code={selectedCountry.iso} className="w-6 h-4 object-cover rounded-sm border border-gray-200" />
              <span className="font-medium">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="text-gray-400 text-xs transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar">
          {options.map(country => (
            <div
              key={country.iso}
              onClick={() => {
                onChange(country.iso);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <Flag code={country.iso} className="w-6 h-4 object-cover rounded-sm border border-gray-200" />
              <span className="font-medium text-gray-800">{country.name} <span className="text-gray-400 text-sm ml-1">({country.iso})</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Hero() {
  const { state, updateField, calcularMontoDestino, calcularMontoOrigen, getRateValue } = useAppContext();
  const [step, setStep] = useState(1);
  const [activeInput, setActiveInput] = useState<'origen' | 'destino' | null>(null);
  const [inputValue, setInputValue] = useState("");

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const resetForm = () => {
    updateField("nombreUsuario", "");
    updateField("esNuevo", false);
    updateField("servicio", "");
    updateField("paisOrigen", "");
    updateField("paisDestino", "");
    updateField("metodoPagoOrigen", "");
    updateField("metodoPago", "");
    updateField("montoOrigen", 0);
    updateField("montoDestino", 0);
    setStep(1);
  };

  const handleNextStep1 = () => {
    if (state.nombreUsuario.trim().length === 0) {
      alert("Por favor, ingresa tu nombre.");
      return;
    }
    nextStep();
  };

  const handleNextStep2 = () => {
    if (!state.servicio) {
      alert("Por favor, selecciona un servicio.");
      return;
    }
    if (state.servicio === "Recepción en Efectivo") {
      updateField("paisDestino", "VE");
    }
    nextStep();
  };

  const handleNextStep3 = () => {
    if (!state.paisOrigen || !state.paisDestino) {
      alert("Por favor, selecciona ambos países.");
      return;
    }
    nextStep();
  };

  const handleNextStep4 = () => {
    if (state.montoOrigen <= 0) {
      alert("Por favor, ingresa un monto válido a enviar.");
      return;
    }
    if (originPaymentMethods[state.paisOrigen] && originPaymentMethods[state.paisOrigen].length > 0 && !state.metodoPagoOrigen) {
      alert("Por favor, selecciona un método de pago en origen.");
      return;
    }
    if (state.servicio === "Recepción en Efectivo" && !state.metodoPago) {
      alert("Por favor, selecciona una moneda para recibir el efectivo.");
      return;
    }
    if (state.servicio === "Recepción por Transferencia" && destinationPaymentMethods[state.paisDestino] && destinationPaymentMethods[state.paisDestino].length > 0 && !state.metodoPago) {
      alert("Por favor, selecciona un método de entrega en destino.");
      return;
    }
    nextStep();
  };

  /**
   * Formatea todos los estados del componente formados hasta ahora para armar el String 
   * que se mandará embebido a WhatsApp. Contempla inyecciones de Divisa según opciones.
   */
  const handleFinish = () => {
    const { nombreUsuario, esNuevo, servicio, paisOrigen, paisDestino, metodoPagoOrigen, metodoPago, montoOrigen, montoDestino } = state;
    const tipoCliente = esNuevo ? "Cliente Nuevo" : "Cliente Recurrente";

    // Preparo el string del Medio de Entrega (ej. "Recepción por Transferencia" o "Recepción en Efectivo (Dólar)")
    let medio: string = servicio;
    if (metodoPago) {
      if (servicio === "Recepción en Efectivo") {
        medio = `${servicio} (${metodoPago})`;
      } else {
        medio = metodoPago;
      }
    }
    const paisNombre = countries.find(c => c.iso === paisDestino)?.name || paisDestino;
    const origenInfo = metodoPagoOrigen ? ` desde ${metodoPagoOrigen}` : "";

    let destCurrencyDisplay = paisDestino;
    if (servicio === "Recepción en Efectivo" && paisDestino === "VE") {
      if (metodoPago === "Pesos Colombianos (COP)") destCurrencyDisplay = "COP";
      if (metodoPago === "Dólar (USD)") destCurrencyDisplay = "USD";
    }

    const mensaje = `Hola, soy ${nombreUsuario}. ${tipoCliente}. Quiero hacer una remesa de ${formatValue(montoOrigen)} ${paisOrigen}${origenInfo} vía ${medio} para recibir ${formatValue(montoDestino)} ${destCurrencyDisplay} en ${paisNombre}.`;

    const url = `https://wa.me/51991884537?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  // Utility to format rate conversion
  const getRateConversionText = () => {
    const rate = getRateValue();
    if (rate === 0) {
      if (!state.paisOrigen || !state.paisDestino) return "";

      const paisOrigenNombre = countries.find(c => c.iso === state.paisOrigen)?.name || state.paisOrigen;
      const paisDestinoNombre = countries.find(c => c.iso === state.paisDestino)?.name || state.paisDestino;
      const tipoCliente = state.esNuevo ? "Cliente Nuevo" : "Cliente Recurrente";
      const nombreText = state.nombreUsuario ? state.nombreUsuario : "un usuario";

      const mensaje = `Hola, soy ${nombreText}, ${tipoCliente}. Quiero consultar por envío de dinero desde ${paisOrigenNombre} hasta ${paisDestinoNombre} y veo que no hay una tasa disponible.`;
      const url = `https://wa.me/51991884537?text=${encodeURIComponent(mensaje)}`;

      return (
        <>
          Tasa no disponible para esta ruta. Consulte{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-900 hover:text-blue-700 transition-colors">
            aquí
          </a>
        </>
      );
    }

    let destString = state.paisDestino;
    if (state.servicio === "Recepción en Efectivo" && state.paisDestino === "VE") {
      if (state.metodoPago === "Pesos Colombianos (COP)") destString = "COP";
      if (state.metodoPago === "Dólar (USD)") destString = "USD";
    }

    return `Tasa: 1 ${state.paisOrigen} = ${rateFormatter.format(rate)} ${destString}`;
  };

  let destCurrencyDisplay = state.paisDestino;
  if (state.servicio === "Recepción en Efectivo" && state.paisDestino === "VE") {
    if (state.metodoPago === "Pesos Colombianos (COP)") destCurrencyDisplay = "COP";
    if (state.metodoPago === "Dólar (USD)") destCurrencyDisplay = "USD";
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-8 sm:p-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-4 bg-white rounded-full shadow-sm flex items-center justify-center p-2 border border-blue-50">
            <Image
              src="/images/logo.png"
              alt="Flow Money"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-1 tracking-tight">
            Envía Dinero Fácil
          </h1>
          <p className="text-gray-500 text-center text-[14px] h-6">
            {step === 1 && "Ingresa tus datos para comenzar"}
            {step === 2 && "¿Cómo deseas enviar el dinero?"}
            {step === 3 && "Selecciona los países"}
            {step === 4 && "Calculadora bidireccional"}
            {step === 5 && "Revisa y envía tu solicitud"}
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex justify-center items-center gap-1.5 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                {s}
              </div>
              {s < 5 && (
                <div className={`h-1 w-6 rounded-full transition-all duration-300 ${step > s ? 'bg-blue-600' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="min-h-[220px] flex flex-col justify-center transition-all duration-500">

          {/* STEP 1: Name and New Client */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label htmlFor="nombreUsuario" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombreUsuario"
                  value={state.nombreUsuario}
                  onChange={(e) => updateField("nombreUsuario", e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 bg-blue-50/50 hover:bg-blue-50/80 transition-colors p-4 rounded-2xl border border-blue-100 shadow-sm">
                <input
                  type="checkbox"
                  id="esNuevo"
                  checked={state.esNuevo}
                  onChange={(e) => updateField("esNuevo", e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="esNuevo" className="text-sm font-medium text-gray-800 cursor-pointer select-none flex-1">
                  Soy cliente nuevo
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Service Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => updateField("servicio", "Recepción en Efectivo")}
                className={`w-full flex justify-center items-center py-4 rounded-2xl font-bold transition-all duration-200 ${state.servicio === "Recepción en Efectivo"
                  ? "bg-blue-600 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] ring-2 ring-blue-600 ring-offset-2"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                Recepción en Efectivo
              </button>
              <button
                type="button"
                onClick={() => updateField("servicio", "Recepción por Transferencia")}
                className={`w-full flex justify-center items-center py-4 rounded-2xl font-bold transition-all duration-200 ${state.servicio === "Recepción por Transferencia"
                  ? "bg-blue-600 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] ring-2 ring-blue-600 ring-offset-2"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                Recepción por Transferencia
              </button>
              <p className="text-sm text-gray-500 text-center mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <span className="font-semibold text-blue-700">Nota:</span> La recepción de efectivo es una opción exclusiva para San Juan de Colón, Táchira. Se entrega en Pesos Colombianos.
              </p>
            </div>
          )}

          {/* STEP 3: Origin and Destination Countries */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <CountrySelect
                label="País de Origen"
                placeholder="Seleccione país de envío"
                value={state.paisOrigen}
                onChange={(val) => updateField("paisOrigen", val)}
              />
              <CountrySelect
                label="País de Destino"
                placeholder="Seleccione país de recepción"
                value={state.paisDestino}
                onChange={(val) => updateField("paisDestino", val)}
                options={state.servicio === "Recepción en Efectivo" ? countries.filter(c => c.iso === "VE") : countries}
              />
            </div>
          )}

          {/* STEP 4: Bidirectional Calculator */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[13px] text-blue-800 font-medium text-center">{getRateConversionText()}</p>
              </div>

              {originPaymentMethods[state.paisOrigen] && originPaymentMethods[state.paisOrigen].length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Método de Pago en Origen
                  </label>
                  <select
                    value={state.metodoPagoOrigen || ""}
                    onChange={(e) => updateField("metodoPagoOrigen", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 appearance-none font-medium cursor-pointer"
                  >
                    <option value="">Selecciona método de pago</option>
                    {originPaymentMethods[state.paisOrigen].map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  {state.paisOrigen === "CL" && state.metodoPagoOrigen === "Banco Estado" && (
                    <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 mt-1 font-semibold">
                      SOLO DISPONIBLE PARA DEPÓSITOS EN EFECTIVO.
                    </p>
                  )}
                  {state.paisOrigen === "CL" && state.metodoPagoOrigen === "Banco de Chile" && (
                    <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 mt-1 font-semibold">
                      SOLO DISPONIBLE PARA TRANSFERENCIAS.
                    </p>
                  )}
                </div>
              )}

              {((state.servicio === "Recepción en Efectivo") || (destinationPaymentMethods[state.paisDestino] && destinationPaymentMethods[state.paisDestino].length > 0)) && (
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    {state.servicio === "Recepción en Efectivo" ? "Moneda a Recibir en Venezuela" : `Método de Entrega en ${countries.find(c => c.iso === state.paisDestino)?.name || "Destino"}`}
                  </label>
                  <select
                    value={state.metodoPago}
                    onChange={(e) => updateField("metodoPago", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 appearance-none font-medium cursor-pointer"
                  >
                    <option value="">{state.servicio === "Recepción en Efectivo" ? "Selecciona moneda" : "Selecciona método"}</option>
                    {state.servicio === "Recepción en Efectivo" ? (
                      <>
                        <option value="Pesos Colombianos (COP)">Pesos Colombianos (COP)</option>
                        <option value="Dólar (USD)">Dólar (USD)</option>
                      </>
                    ) : (
                      destinationPaymentMethods[state.paisDestino]?.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Monto a Enviar ({state.paisOrigen})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 z-10">
                      <Flag code={state.paisOrigen} className="w-5 h-3 object-cover rounded-sm border border-gray-200 shadow-sm" />
                    </span>
                    <input
                      type="text"
                      value={activeInput === 'origen' ? inputValue : formatValue(state.montoOrigen)}
                      onFocus={() => {
                        setActiveInput('origen');
                        setInputValue(state.montoOrigen === 0 ? "" : state.montoOrigen.toString().replace('.', ','));
                      }}
                      onBlur={() => {
                        setActiveInput(null);
                        setInputValue("");
                      }}
                      onChange={(e) => {
                        const valStr = e.target.value.replace(/[^\d.,]/g, '');
                        setInputValue(valStr);
                        const cleanStr = valStr.replace(/\./g, '').replace(/,/g, '.');
                        const val = parseFloat(cleanStr) || 0;
                        updateField("montoOrigen", val);
                        calcularMontoDestino(val);
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold text-lg shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-center -my-2 relative z-10 pointer-events-none">
                  <div className="bg-white rounded-full p-1.5 border border-gray-100 shadow-sm text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" /></svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1.5 ml-1">
                    Monto que Reciben ({destCurrencyDisplay})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-600 z-10">
                      <Flag code={state.paisDestino} className="w-5 h-3 object-cover rounded-sm border border-green-200 shadow-sm" />
                    </span>
                    <input
                      type="text"
                      value={activeInput === 'destino' ? inputValue : formatValue(state.montoDestino)}
                      onFocus={() => {
                        setActiveInput('destino');
                        setInputValue(state.montoDestino === 0 ? "" : state.montoDestino.toString().replace('.', ','));
                      }}
                      onBlur={() => {
                        setActiveInput(null);
                        setInputValue("");
                      }}
                      onChange={(e) => {
                        const valStr = e.target.value.replace(/[^\d.,]/g, '');
                        setInputValue(valStr);
                        const cleanStr = valStr.replace(/\./g, '').replace(/,/g, '.');
                        const val = parseFloat(cleanStr) || 0;
                        updateField("montoDestino", val);
                        calcularMontoOrigen(val);
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-green-200 bg-green-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-green-800 font-bold text-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Resumen */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="p-4 bg-white/50 rounded-2xl border border-gray-100 shadow-sm text-left space-y-3">
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">Resumen de tu remesa</h3>
                <p className="text-sm text-gray-600 flex justify-between"><strong>Nombre:</strong> <span>{state.nombreUsuario} ({state.esNuevo ? "Nuevo" : "Recurrente"})</span></p>
                <p className="text-sm text-gray-600 flex justify-between"><strong>Envías:</strong> <span>{formatValue(state.montoOrigen)} {state.paisOrigen}</span></p>
                {state.metodoPagoOrigen && (
                  <p className="text-sm text-gray-600 flex justify-between"><strong>Desde:</strong> <span>{state.metodoPagoOrigen}</span></p>
                )}
                <p className="text-sm text-gray-600 flex justify-between"><strong>Reciben:</strong> <span>{formatValue(state.montoDestino)} {destCurrencyDisplay}</span></p>
                <p className="text-sm text-gray-600 flex justify-between"><strong>Vía:</strong> <span className="capitalize">{state.metodoPago ? (state.servicio === "Recepción en Efectivo" ? `Efectivo (${state.metodoPago})` : state.metodoPago) : state.servicio}</span></p>
                <p className="text-sm text-gray-600 flex justify-between"><strong>País Destino:</strong> <span>{countries.find(c => c.iso === state.paisDestino)?.name || state.paisDestino}</span></p>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[13px] text-blue-700 font-medium bg-blue-50/70 p-2.5 rounded-xl border border-blue-100/50 leading-snug">
                    <span className="font-bold">Nota:</span> Esta tasa es válida en horario <span className="font-bold underline text-blue-900">de Lunes a Sábados de 11:00am a 7:00pm (Hora Venezuela)</span>. Puede variar una vez enviada la orden si se encuentra fuera de ese horario.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Al finalizar, te redirigiremos a WhatsApp con un mensaje pre-armado con todos estos detalles.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-8 flex gap-3">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={resetForm}
                className="w-1/3 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleNextStep1}
                className="w-2/3 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.98]"
              >
                Siguiente
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="w-2/3 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.98]"
              >
                Siguiente
              </button>
            </>
          ) : step === 3 ? (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleNextStep3}
                className="w-2/3 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.98]"
              >
                Siguiente
              </button>
            </>
          ) : step === 4 ? (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleNextStep4}
                className="w-2/3 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.98]"
              >
                Siguiente
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-2/3 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-green-500/30 transition-transform active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                Finalizar
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 12px;
          margin-block: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
}
