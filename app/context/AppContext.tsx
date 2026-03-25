"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AppState {
  nombreUsuario: string;
  esNuevo: boolean;
  servicio: "Recepción en Efectivo" | "Recepción por Transferencia" | "";
  paisOrigen: string;
  paisDestino: string;
  metodoPagoOrigen: string;
  metodoPago: string;
  montoOrigen: number;
  montoDestino: number;
}

interface AppContextType {
  state: AppState;
  updateField: <K extends keyof AppState>(field: K, value: AppState[K]) => void;
  calcularMontoDestino: (monto: number) => void;
  calcularMontoOrigen: (monto: number) => void;
  getRateValue: () => number;
  rates: { transferencia: Record<string, number>, efectivo: Record<string, number> };
}

const defaultState: AppState = {
  nombreUsuario: "",
  esNuevo: true,
  servicio: "",
  paisOrigen: "",
  paisDestino: "",
  metodoPagoOrigen: "",
  metodoPago: "",
  montoOrigen: 0,
  montoDestino: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Normaliza los códigos ISO seleccionados por el cliente (ej: ES, VE, US)
 * con la nomenclatura exacta que utiliza el área de tesorería en el Google Sheets (ej: EUR, VES, EEUU)
 * También maneja el sub-caso de Venezuela recibiendo Dólares o Pesos Colombianos físicos.
 */
const localizeCurrency = (iso: string, isEfectivoDestino?: boolean, metodoPago?: string): string[] => {
  if (isEfectivoDestino && iso === "VE") {
    if (metodoPago === "Pesos Colombianos (COP)") return ["COP"];
    if (metodoPago === "Dólar (USD)") return ["EEUU", "USD"];
  }
  const map: Record<string, string[]> = {
    "AR": ["AR", "ARS"],
    "CL": ["CLP"],
    "CO": ["COP"],
    "ES": ["EUR"],
    "US": ["EEUU"],
    "MX": ["MXN"],
    "PA": ["PAB"],
    "PE": ["PEN"],
    "VE": ["VES"]
  };
  return map[iso] || [iso];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [rates, setRates] = useState<{ transferencia: Record<string, number>, efectivo: Record<string, number> }>({ transferencia: {}, efectivo: {} });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.transferencia && data.efectivo) {
          setRates(data);
        }
      } catch (err) {
        console.error("Error fetching rates:", err);
      }
    };
    fetchRates();
  }, []);

  /**
   * Obtiene dinámicamente el multiplicador cruzando la moneda de origen y destino
   * buscando directamente en el diccionario del CSV parseado.
   */
  const getRateValue = () => {
    if (!state.paisOrigen || !state.paisDestino) return 0;

    const isEfectivo = state.servicio === "Recepción en Efectivo";
    const originCurrencies = localizeCurrency(state.paisOrigen);
    const destCurrencies = localizeCurrency(state.paisDestino, isEfectivo, state.metodoPago);

    const rateDict = isEfectivo ? rates.efectivo : rates.transferencia;

    for (const o of originCurrencies) {
      for (const d of destCurrencies) {
        if (rateDict[`${o}_${d}`] !== undefined) {
          return rateDict[`${o}_${d}`];
        }
      }
    }
    return 0;
  };

  const updateField = <K extends keyof AppState>(field: K, value: AppState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Dirección: Origen -> Destino
   * Multiplica el monto base por la tasa del Google Docs.
   * La comisión se infiere contenida en el propio Excel del cliente, optimizando el cálculo a su mínima expresión.
   */
  const calcularMontoDestino = (montoOrigen: number) => {
    const rate = getRateValue();
    if (rate === 0) {
      updateField("montoOrigen", montoOrigen);
      updateField("montoDestino", 0);
      return;
    }

    // Aplicar comisión adicional del 0.3% para Pago Movil en Venezuela
    const isPagoMovilVE = state.servicio === "Recepción por Transferencia" && state.paisDestino === "VE" && state.metodoPago === "Pago Movil";
    const effectiveRate = isPagoMovilVE ? rate * 0.997 : rate;

    const montoFinalDestino = montoOrigen * effectiveRate;
    updateField("montoOrigen", montoOrigen);
    updateField("montoDestino", parseFloat(montoFinalDestino.toFixed(2)));
  };

  /**
   * Dirección: Destino -> Origen (Calculadora inversa)
   * Divide de vuelta el monto deseado a enviar por la tasa en tabla para saber cuánto debito solicitarle en su moneda de origen.
   */
  const calcularMontoOrigen = (montoDestino: number) => {
    const rate = getRateValue();
    if (rate === 0) {
      updateField("montoDestino", montoDestino);
      updateField("montoOrigen", 0);
      return;
    }

    // Aplicar comisión adicional del 0.3% para Pago Movil en Venezuela
    const isPagoMovilVE = state.servicio === "Recepción por Transferencia" && state.paisDestino === "VE" && state.metodoPago === "Pago Movil";
    const effectiveRate = isPagoMovilVE ? rate * 0.997 : rate;

    const montoFinalOrigen = montoDestino / effectiveRate;
    updateField("montoDestino", montoDestino);
    updateField("montoOrigen", parseFloat(montoFinalOrigen.toFixed(2)));
  };

  // Recalcular automáticamente si cambian los parámetros principales y hay un monto previo
  useEffect(() => {
    if (state.montoOrigen > 0) {
      calcularMontoDestino(state.montoOrigen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.paisOrigen, state.paisDestino, state.metodoPago]);

  return (
    <AppContext.Provider value={{ state, updateField, calcularMontoDestino, calcularMontoOrigen, getRateValue, rates }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe ser usado dentro de un AppProvider");
  }
  return context;
};
