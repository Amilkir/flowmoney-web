/**
 * Analiza el texto de un CSV de Google Sheets.
 * Ignora las comas internas de los números europeos (por ej: "0,6707" -> 0.6707).
 * Retorna un diccionario estructurado como { "Origen_Destino": Tasa_Decimal }.
 */
export function parseCSV(csvText: string) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
  const data: Record<string, number> = {};
  
  // Omitimos la primera línea (cabecera)
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 3) {
      const origen = parts[0];
      const destino = parts[1];
      
      let tasaStr = parts.slice(2).join(',');
      tasaStr = tasaStr.replace(/"/g, '').trim();
      tasaStr = tasaStr.replace(',', '.'); // Convert ES comma to EN decimal
      
      const tasa = parseFloat(tasaStr);
      if (!isNaN(tasa)) {
        data[`${origen}_${destino}`] = tasa;
      }
    }
  }
  return data;
}

export async function fetchLiveRates() {
  const tfUrl = "https://docs.google.com/spreadsheets/d/1YBAJQjsSm8Kvfd-tfQ8Rjn3LimqR8VXoP6m1rkK1FKU/export?format=csv&gid=0";
  const efUrl = "https://docs.google.com/spreadsheets/d/1YBAJQjsSm8Kvfd-tfQ8Rjn3LimqR8VXoP6m1rkK1FKU/export?format=csv&gid=2072416046";

  const [tfRes, efRes] = await Promise.all([
    fetch(tfUrl, { cache: 'no-store' }),
    fetch(efUrl, { cache: 'no-store' })
  ]);

  if (!tfRes.ok || !efRes.ok) {
    throw new Error("No se pudieron obtener las tasas desde Google Sheets");
  }

  const [tfCsv, efCsv] = await Promise.all([
    tfRes.text(),
    efRes.text()
  ]);

  return {
    transferencia: parseCSV(tfCsv),
    efectivo: parseCSV(efCsv)
  };
}
