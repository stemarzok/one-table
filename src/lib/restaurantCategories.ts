// Categorie fisse per i ristoranti

export const CUISINE_TYPES = [
  "Italiana",
  "Pizzeria",
  "Sushi / Giapponese",
  "Cinese",
  "Asiatico",
  "Mediterranea",
  "Europea",
  "Americana",
  "Messicana",
  "Indiana",
  "Medio Orientale",
  "Sudamericana",
  "Africana",
  "Fusion"
] as const;

export const SPECIALIZATIONS = [
  "Ristorante Tradizionale",
  "Trattoria",
  "Osteria",
  "Fine Dining",
  "Bistrot",
  "Street Food",
  "Fast Casual",
  "Ristorante Gourmet",
  "Steakhouse",
  "Pesce / Seafood",
  "Vegano",
  "Vegetariano",
  "Gluten Free",
  "Healthy",
  "Tapas / Small Plates"
] as const;

export const OCCASIONS = [
  "Cena romantica",
  "Famiglie",
  "Gruppi",
  "Business / Pranzi di lavoro",
  "Aperitivo",
  "Brunch",
  "Vista panoramica",
  "Centro storico",
  "Fuori città",
  "Locale di tendenza",
  "Storico",
  "Informale",
  "Elegante"
] as const;

export const EXTRA_FEATURES = [
  "Prenotazione online",
  "Tavoli all'aperto",
  "Animali ammessi",
  "Musica dal vivo",
  "Eventi privati",
  "Menu degustazione",
  "Wine bar",
  "Cocktail bar"
] as const;

export type CuisineType = typeof CUISINE_TYPES[number];
export type Specialization = typeof SPECIALIZATIONS[number];
export type Occasion = typeof OCCASIONS[number];
export type ExtraFeature = typeof EXTRA_FEATURES[number];
