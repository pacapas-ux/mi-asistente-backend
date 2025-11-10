// apis.js
import fetch from "node-fetch";
import cheerio from "cheerio";

/**
 * Extrae la información de contacto de megafincas.io (intenta varios selectores y búsquedas)
 * Devuelve { address, phone, email, contactoUrl }
 */
export async function fetchMegafincasContact() {
  try {
    const url = "https://www.megafincas.io/";
    const res = await fetch(url, { timeout: 10000 });
    const text = await res.text();
    const $ = cheerio.load(text);

    // Intenta sacar el bloque de contacto heurísticamente
    let contactText = $("section#contacto, #contacto, .contacto, section:contains('CONTACTO')").first().text().trim();
    if (!contactText) {
      // fallback: buscar bloques con palabras clave
      contactText = $("body").text();
    }

    // Regex heurísticas
    const phoneMatch = contactText.match(/(?:Tel[:.]?\s*|TEL[:.]?\s*|\+34\s*)?(\+?\d{2,3}[\s\-]?\d{2,3}[\s\-]?\d{2,3}[\s\-]?\d{2,3})/);
    const emailMatch = contactText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const addressMatch = contactText.match(/(UBICACI[ÓO]N|DIRECCI[ÓO]N|Calle|Avda|Avenida|Plaza)[^\n]{10,120}/i);

    return {
      address: addressMatch ? addressMatch[0].replace(/UBICACI[ÓO]N[:\s-]*/i, "").trim() : "San Bartolomé 174, El Campello, Alicante (03560)",
      phone: phoneMatch ? phoneMatch[1].trim() : "+34 965 63 70 05",
      email: emailMatch ? emailMatch[0].trim() : "alc@megafincas.io",
      contactoUrl: url + "#contacto",
      raw: contactText.slice(0, 1000)
    };
  } catch (e) {
    // fallback por si la web no responde
    return {
      address: "San Bartolomé 174, El Campello, Alicante (03560)",
      phone: "+34 965 63 70 05",
      email: "alc@megafincas.io",
      contactoUrl: "https://www.megafincas.io/#contacto",
      raw: ""
    };
  }
}

/**
 * Extrae una breve biografía / info de pepegutierrez.guru
 */
export async function fetchPepeInfo() {
  try {
    const url = "https://www.pepegutierrez.guru/";
    const res = await fetch(url, { timeout: 10000 });
    const text = await res.text();
    const $ = cheerio.load(text);

    // Busca título, descripcion meta o primer párrafo
    let title = $("h1").first().text().trim() || $("title").text().trim();
    let p = $("p").first().text().trim();

    if (!p) {
      p = $("meta[name='description']").attr("content") || "";
    }

    return {
      title: title || "Pepe Gutiérrez",
      description: p || "Consultor y formador en administración de fincas y gestión de comunidades."
    };
  } catch (e) {
    return {
      title: "Pepe Gutiérrez",
      description: "Consultor y formador en administración de fincas y gestión de comunidades. Más en https://www.pepegutierrez.guru/"
    };
  }
}
