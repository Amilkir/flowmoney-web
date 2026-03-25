import { NextResponse } from 'next/server';

/**
 * Importa y analiza el texto de un CSV de Google Sheets.
 * Ignora las comas internas de los números europeos (por ej: "0,6707" -> 0.6707).
 * Retorna un diccionario estructurado como { "Origen_Destino": Tasa_Decimal }.
 */
function parseCSV(csvText: string) {
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

/**
 * Endpoint principal GET /api/rates
 * Descarga en el servidor las dos hojas publicadas del Google Sheets.
 * Usa un revalidatetion de 60s para funcionar como caché dinámico evitando saturar a Google Docs.
 */
export async function GET() {
  try {
    const tfRes = await fetch("https://docs.google.com/spreadsheets/d/1YBAJQjsSm8Kvfd-tfQ8Rjn3LimqR8VXoP6m1rkK1FKU/export?format=csv&gid=0", { next: { revalidate: 60 } });
    const efRes = await fetch("https://docs.google.com/spreadsheets/d/1YBAJQjsSm8Kvfd-tfQ8Rjn3LimqR8VXoP6m1rkK1FKU/export?format=csv&gid=2072416046", { next: { revalidate: 60 } });
    
    if (!tfRes.ok || !efRes.ok) {
      throw new Error("Bad response from Google Sheets");
    }

    const tfCsv = await tfRes.text();
    const efCsv = await efRes.text();

    const transferencia = parseCSV(tfCsv);
    const efectivo = parseCSV(efCsv);

    return NextResponse.json({ transferencia, efectivo });
  } catch (err) {
    return NextResponse.json({ error: "No se pudieron obtener las tasas" }, { status: 500 });
  }
}
