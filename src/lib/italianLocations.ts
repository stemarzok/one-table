// Province italiane con prefisso
export const ITALIAN_PROVINCES = [
  { code: "AG", name: "Agrigento" },
  { code: "AL", name: "Alessandria" },
  { code: "AN", name: "Ancona" },
  { code: "AO", name: "Aosta" },
  { code: "AR", name: "Arezzo" },
  { code: "AP", name: "Ascoli Piceno" },
  { code: "AT", name: "Asti" },
  { code: "AV", name: "Avellino" },
  { code: "BA", name: "Bari" },
  { code: "BT", name: "Barletta-Andria-Trani" },
  { code: "BL", name: "Belluno" },
  { code: "BN", name: "Benevento" },
  { code: "BG", name: "Bergamo" },
  { code: "BI", name: "Biella" },
  { code: "BO", name: "Bologna" },
  { code: "BZ", name: "Bolzano" },
  { code: "BS", name: "Brescia" },
  { code: "BR", name: "Brindisi" },
  { code: "CA", name: "Cagliari" },
  { code: "CL", name: "Caltanissetta" },
  { code: "CB", name: "Campobasso" },
  { code: "CE", name: "Caserta" },
  { code: "CT", name: "Catania" },
  { code: "CZ", name: "Catanzaro" },
  { code: "CH", name: "Chieti" },
  { code: "CO", name: "Como" },
  { code: "CS", name: "Cosenza" },
  { code: "CR", name: "Cremona" },
  { code: "KR", name: "Crotone" },
  { code: "CN", name: "Cuneo" },
  { code: "EN", name: "Enna" },
  { code: "FM", name: "Fermo" },
  { code: "FE", name: "Ferrara" },
  { code: "FI", name: "Firenze" },
  { code: "FG", name: "Foggia" },
  { code: "FC", name: "Forlì-Cesena" },
  { code: "FR", name: "Frosinone" },
  { code: "GE", name: "Genova" },
  { code: "GO", name: "Gorizia" },
  { code: "GR", name: "Grosseto" },
  { code: "IM", name: "Imperia" },
  { code: "IS", name: "Isernia" },
  { code: "SP", name: "La Spezia" },
  { code: "AQ", name: "L'Aquila" },
  { code: "LT", name: "Latina" },
  { code: "LE", name: "Lecce" },
  { code: "LC", name: "Lecco" },
  { code: "LI", name: "Livorno" },
  { code: "LO", name: "Lodi" },
  { code: "LU", name: "Lucca" },
  { code: "MC", name: "Macerata" },
  { code: "MN", name: "Mantova" },
  { code: "MS", name: "Massa-Carrara" },
  { code: "MT", name: "Matera" },
  { code: "ME", name: "Messina" },
  { code: "MI", name: "Milano" },
  { code: "MO", name: "Modena" },
  { code: "MB", name: "Monza e Brianza" },
  { code: "NA", name: "Napoli" },
  { code: "NO", name: "Novara" },
  { code: "NU", name: "Nuoro" },
  { code: "OR", name: "Oristano" },
  { code: "PD", name: "Padova" },
  { code: "PA", name: "Palermo" },
  { code: "PR", name: "Parma" },
  { code: "PV", name: "Pavia" },
  { code: "PG", name: "Perugia" },
  { code: "PU", name: "Pesaro e Urbino" },
  { code: "PE", name: "Pescara" },
  { code: "PC", name: "Piacenza" },
  { code: "PI", name: "Pisa" },
  { code: "PT", name: "Pistoia" },
  { code: "PN", name: "Pordenone" },
  { code: "PZ", name: "Potenza" },
  { code: "PO", name: "Prato" },
  { code: "RG", name: "Ragusa" },
  { code: "RA", name: "Ravenna" },
  { code: "RC", name: "Reggio Calabria" },
  { code: "RE", name: "Reggio Emilia" },
  { code: "RI", name: "Rieti" },
  { code: "RN", name: "Rimini" },
  { code: "RM", name: "Roma" },
  { code: "RO", name: "Rovigo" },
  { code: "SA", name: "Salerno" },
  { code: "SS", name: "Sassari" },
  { code: "SV", name: "Savona" },
  { code: "SI", name: "Siena" },
  { code: "SR", name: "Siracusa" },
  { code: "SO", name: "Sondrio" },
  { code: "SU", name: "Sud Sardegna" },
  { code: "TA", name: "Taranto" },
  { code: "TE", name: "Teramo" },
  { code: "TR", name: "Terni" },
  { code: "TO", name: "Torino" },
  { code: "TP", name: "Trapani" },
  { code: "TN", name: "Trento" },
  { code: "TV", name: "Treviso" },
  { code: "TS", name: "Trieste" },
  { code: "UD", name: "Udine" },
  { code: "VA", name: "Varese" },
  { code: "VE", name: "Venezia" },
  { code: "VB", name: "Verbano-Cusio-Ossola" },
  { code: "VC", name: "Vercelli" },
  { code: "VR", name: "Verona" },
  { code: "VV", name: "Vibo Valentia" },
  { code: "VI", name: "Vicenza" },
  { code: "VT", name: "Viterbo" },
];

// Ruoli aziendali disponibili
export const BUSINESS_ROLES = [
  { value: "owner", label: "Titolare / Proprietario" },
  { value: "legal_representative", label: "Rappresentante Legale" },
  { value: "general_manager", label: "Direttore Generale" },
  { value: "restaurant_manager", label: "Restaurant Manager" },
  { value: "operations_manager", label: "Responsabile Operativo" },
  { value: "franchise_owner", label: "Proprietario Franchise" },
  { value: "ceo", label: "CEO / Amministratore Delegato" },
  { value: "cfo", label: "CFO / Direttore Finanziario" },
  { value: "partner", label: "Socio" },
];

// Validazione P.IVA italiana (11 cifre, checksum Luhn modificato)
export function validateItalianVAT(vat: string): boolean {
  // Rimuovi spazi e converti in uppercase
  const cleanVat = vat.replace(/\s/g, '').toUpperCase();
  
  // Rimuovi eventuale prefisso IT
  const vatNumber = cleanVat.startsWith('IT') ? cleanVat.slice(2) : cleanVat;
  
  // Deve essere esattamente 11 cifre
  if (!/^\d{11}$/.test(vatNumber)) {
    return false;
  }
  
  // Algoritmo di controllo P.IVA italiana
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(vatNumber[i], 10);
    if (i % 2 === 0) {
      sum += digit;
    } else {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  
  return sum % 10 === 0;
}

// Validazione CAP italiano (5 cifre)
export function validateItalianPostalCode(postalCode: string, provinceCode?: string): boolean {
  const cleanCode = postalCode.replace(/\s/g, '');
  
  // Deve essere esattamente 5 cifre
  if (!/^\d{5}$/.test(cleanCode)) {
    return false;
  }
  
  // Range validi per CAP italiani: 00010 - 98168
  const numCode = parseInt(cleanCode, 10);
  if (numCode < 10 || numCode > 98168) {
    return false;
  }
  
  return true;
}

// Validazione telefono italiano
export function validateItalianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Formato italiano: +39 o 0039 seguito da 9-10 cifre, oppure 0 seguito da 9-10 cifre
  const patterns = [
    /^\+39\d{9,10}$/,
    /^0039\d{9,10}$/,
    /^0\d{9,10}$/,
    /^3\d{8,9}$/,  // Cellulari senza prefisso internazionale
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
}

// Città principali per provincia (campione rappresentativo)
export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  "RM": ["Roma", "Fiumicino", "Guidonia Montecelio", "Tivoli", "Civitavecchia", "Velletri", "Anzio", "Nettuno", "Ardea", "Pomezia", "Aprilia", "Albano Laziale", "Frascati", "Ciampino", "Marino", "Genzano di Roma", "Monterotondo", "Mentana", "Fonte Nuova", "Ladispoli"],
  "MI": ["Milano", "Sesto San Giovanni", "Cinisello Balsamo", "Legnano", "Rho", "Paderno Dugnano", "Cologno Monzese", "Corsico", "Rozzano", "San Donato Milanese", "Segrate", "Pioltello", "Bollate", "Cernusco sul Naviglio", "San Giuliano Milanese", "Abbiategrasso", "Magenta", "Melzo", "Opera", "Buccinasco"],
  "NA": ["Napoli", "Giugliano in Campania", "Torre del Greco", "Pozzuoli", "Casoria", "Castellammare di Stabia", "Afragola", "Marano di Napoli", "Portici", "Ercolano", "Acerra", "Casalnuovo di Napoli", "Torre Annunziata", "Nola", "Somma Vesuviana", "Frattamaggiore", "Qualiano", "Melito di Napoli", "Mugnano di Napoli", "Villaricca"],
  "TO": ["Torino", "Moncalieri", "Collegno", "Rivoli", "Nichelino", "Settimo Torinese", "Grugliasco", "Chieri", "Pinerolo", "Venaria Reale", "Carmagnola", "Chivasso", "Ivrea", "Orbassano", "Beinasco", "San Mauro Torinese", "Leini", "Caselle Torinese", "Alpignano", "Volpiano"],
  "PA": ["Palermo", "Bagheria", "Carini", "Monreale", "Partinico", "Termini Imerese", "Villabate", "Misilmeri", "Ficarazzi", "Capaci", "Altofonte", "Casteldaccia", "Isola delle Femmine", "Torretta", "Balestrate", "Trappeto", "Cinisi", "Terrasini", "Cefalù", "Lercara Friddi"],
  "BA": ["Bari", "Altamura", "Molfetta", "Bitonto", "Monopoli", "Corato", "Barletta", "Andria", "Trani", "Modugno", "Gravina in Puglia", "Conversano", "Ruvo di Puglia", "Triggiano", "Mola di Bari", "Noicattaro", "Gioia del Colle", "Acquaviva delle Fonti", "Putignano", "Polignano a Mare"],
  "BO": ["Bologna", "Imola", "Casalecchio di Reno", "San Lazzaro di Savena", "Castel Maggiore", "Zola Predosa", "Pianoro", "Budrio", "Medicina", "San Giovanni in Persiceto", "Crevalcore", "Anzola dell'Emilia", "Castel San Pietro Terme", "Valsamoggia", "Granarolo dell'Emilia", "Calderara di Reno", "Argelato", "Ozzano dell'Emilia", "Bentivoglio", "Molinella"],
  "FI": ["Firenze", "Sesto Fiorentino", "Scandicci", "Campi Bisenzio", "Empoli", "Bagno a Ripoli", "Signa", "Fucecchio", "Pontassieve", "Lastra a Signa", "Calenzano", "Figline e Incisa Valdarno", "Castelfiorentino", "Certaldo", "San Casciano in Val di Pesa", "Borgo San Lorenzo", "Fiesole", "Impruneta", "Reggello", "Montelupo Fiorentino"],
  "GE": ["Genova", "Rapallo", "Chiavari", "Sestri Levante", "Lavagna", "Santa Margherita Ligure", "Recco", "Arenzano", "Cogoleto", "Bogliasco", "Sori", "Camogli", "Portofino", "Zoagli", "Leivi", "Ne", "Casarza Ligure", "Moneglia", "Deiva Marina", "Framura"],
  "VE": ["Venezia", "Chioggia", "Mira", "San Donà di Piave", "Jesolo", "Spinea", "Mirano", "Martellago", "Portogruaro", "Cavallino-Treporti", "Marcon", "Noale", "Dolo", "Salzano", "Scorzè", "Eraclea", "Caorle", "Quarto d'Altino", "Fossalta di Piave", "Musile di Piave"],
  "VR": ["Verona", "Villafranca di Verona", "Legnago", "San Giovanni Lupatoto", "San Bonifacio", "Bussolengo", "Negrar di Valpolicella", "Pescantina", "Bovolone", "Isola della Scala", "San Martino Buon Albergo", "Castel d'Azzano", "Sona", "Sommacampagna", "Cerea", "Grezzana", "Lavagno", "Valeggio sul Mincio", "Oppeano", "Nogara"],
};

// Funzione per ottenere le città di una provincia
export function getCitiesByProvince(provinceCode: string): string[] {
  return CITIES_BY_PROVINCE[provinceCode] || [];
}
