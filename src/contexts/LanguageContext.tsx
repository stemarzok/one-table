import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'it' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  it: {
    // Header
    'nav.forBusiness': 'Per Aziende',
    'nav.login': 'Accedi',
    'nav.profile': 'Profilo',
    'nav.logout': 'Esci',
    
    // Hero
    'hero.badge': 'Sistema di Reputazione Innovativo',
    'hero.title1': 'Prenota, Risparmia,',
    'hero.title2': 'Goditi i Vantaggi VIP',
    'hero.description': 'Più sei puntuale e affidabile, più vantaggi ottieni: upgrade di tavoli con vista migliore, sconti esclusivi e trattamenti VIP nei migliori ristoranti.',
    'hero.search': 'Cerca il tuo ristorante preferito...',
    'hero.searchButton': 'Cerca',
    'hero.rating': 'Valutazione Media',
    'hero.partners': 'Ristoranti Partner',
    
    // Restaurant Section
    'restaurants.title': 'Ristoranti',
    'restaurants.nearMe': 'Vicino a me',
    'restaurants.sponsored': 'Sponsorizzato',
    'restaurants.bookNow': 'Prenota Ora',
    'restaurants.noResults': 'Nessun ristorante trovato',
    
    // Filters
    'filters.title': 'Filtri',
    'filters.city': 'Città',
    'filters.radius': 'Raggio (km)',
    'filters.price': 'Prezzo',
    'filters.sortBy': 'Ordina per',
    'filters.rating': 'Valutazione',
    'filters.apply': 'Applica Filtri',
    
    // How It Works
    'howItWorks.title': 'Come Funziona',
    'howItWorks.step1.title': 'Crea il tuo account',
    'howItWorks.step1.desc': 'Registrati gratuitamente in pochi secondi',
    'howItWorks.step2.title': 'Prenota un ristorante',
    'howItWorks.step2.desc': 'Scegli tra centinaia di ristoranti partner',
    'howItWorks.step3.title': 'Guadagna punti',
    'howItWorks.step3.desc': 'Ogni prenotazione rispettata ti fa salire di livello',
    'howItWorks.step4.title': 'Ottieni vantaggi VIP',
    'howItWorks.step4.desc': 'Sconti, upgrade e trattamenti esclusivi',
    
    // Levels
    'levels.title': 'I Tuoi Vantaggi per Livello',
    'levels.bronze': 'Bronzo',
    'levels.silver': 'Argento',
    'levels.gold': 'Oro',
    'levels.platinum': 'Platino',
    
    // Profile
    'profile.title': 'Il Mio Profilo',
    'profile.username': 'Nome Utente',
    'profile.email': 'Email',
    'profile.phone': 'Telefono',
    'profile.currentPassword': 'Password Attuale',
    'profile.newPassword': 'Nuova Password',
    'profile.confirmPassword': 'Conferma Password',
    'profile.changePassword': 'Cambia Password',
    'profile.uploadAvatar': 'Carica Foto Profilo',
    'profile.saveChanges': 'Salva Modifiche',
    'profile.loyaltyLevel': 'Il Tuo Livello di Fedeltà',
    'profile.progress': 'Progresso',
    'profile.benefits': 'I Tuoi Vantaggi',
    'profile.points': 'punti',
    'profile.pointsToNext': 'Ti mancano',
    'profile.toReach': 'per raggiungere il livello',
    'profile.emailNotEditable': 'L\'email non può essere modificata',
    'profile.passwordUpdated': 'Password aggiornata con successo',
    'profile.profileUpdated': 'Profilo aggiornato con successo',
    'profile.avatarUpdated': 'Foto profilo aggiornata',
    'profile.passwordsMustMatch': 'Le password devono coincidere',
    'profile.fillAllPasswordFields': 'Compila tutti i campi password',
    
    // Restaurant Detail
    'restaurantDetail.menu': 'Menu',
    'restaurantDetail.booking': 'Prenotazione',
    'restaurantDetail.reviews': 'Recensioni',
    'restaurantDetail.contacts': 'Contatti',
    'restaurantDetail.phone': 'Telefono',
    'restaurantDetail.address': 'Indirizzo',
    'restaurantDetail.hours': 'Orari',
    'restaurantDetail.bookTable': 'Prenota il Tuo Tavolo',
    'restaurantDetail.selectTime': 'Seleziona Orario',
    'restaurantDetail.confirm': 'Conferma Prenotazione',
    'restaurantDetail.leaveReview': 'Lascia una recensione',
    'restaurantDetail.submit': 'Pubblica Recensione',
    
    // Booking & Reviews
    'booking.bookTable': 'Prenota Tavolo',
    'booking.date': 'Data',
    'booking.time': 'Ora',
    'booking.numberOfGuests': 'Numero di Ospiti',
    'booking.specialRequests': 'Richieste Speciali',
    'booking.specialRequestsPlaceholder': 'Allergie, preferenze, occasioni speciali...',
    'booking.confirmBooking': 'Conferma Prenotazione',
    'booking.confirming': 'Confermando...',
    'booking.pleaseLoginToBook': 'Effettua il login per prenotare',
    'booking.noTablesAvailable': 'Nessun tavolo disponibile per questa data e ora',
    'booking.bookingConfirmed': 'Prenotazione confermata! Riceverai una email di conferma.',
    'booking.bookingError': 'Errore durante la prenotazione. Riprova.',
    'review.writeReview': 'Scrivi Recensione',
    'review.overallRating': 'Valutazione Complessiva',
    'review.foodQuality': 'Qualità del Cibo',
    'review.serviceQuality': 'Qualità del Servizio',
    'review.ambiance': 'Atmosfera',
    'review.yourReview': 'La Tua Recensione',
    'review.reviewPlaceholder': 'Condividi la tua esperienza...',
    'review.submitReview': 'Invia Recensione',
    'review.submitting': 'Invio...',
    'review.pleaseLoginToReview': 'Effettua il login per lasciare una recensione',
    'review.pleaseSelectRating': 'Seleziona una valutazione',
    'review.reviewSubmitted': 'Recensione inviata con successo!',
    'review.reviewError': 'Errore durante l\'invio della recensione. Riprova.',
    'review.loading': 'Caricamento...',
    'review.noReviewsYet': 'Nessuna recensione ancora',
    'review.food': 'Cibo',
    'review.service': 'Servizio',
    
    // Business Registration
    'businessReg.title': 'Registrazione Aziendale',
    'businessReg.subtitle': 'Compila il modulo per richiedere l\'accesso alla piattaforma OneTable',
    'businessReg.companyInfo': 'Informazioni Aziendali',
    'businessReg.businessName': 'Ragione Sociale',
    'businessReg.vatNumber': 'Partita IVA',
    'businessReg.legalRep': 'Rappresentante Legale',
    'businessReg.contactInfo': 'Contatti Aziendali',
    'businessReg.businessEmail': 'Email Aziendale',
    'businessReg.businessPhone': 'Telefono Aziendale',
    'businessReg.address': 'Indirizzo Sede Legale',
    'businessReg.city': 'Città',
    'businessReg.province': 'Provincia',
    'businessReg.postalCode': 'CAP',
    'businessReg.documents': 'Documenti',
    'businessReg.uploadDocs': 'Carica Documenti',
    'businessReg.docsRequired': 'Certificato Camerale, Visura, Licenza Commerciale',
    'businessReg.submit': 'Invia Richiesta',
    'businessReg.submitting': 'Invio in corso...',
    'businessReg.success': 'Richiesta inviata con successo',
    'businessReg.successMsg': 'La tua richiesta è in fase di verifica. Ti contatteremo entro 48 ore.',
    'businessReg.error': 'Errore',
    'businessReg.pending': 'Hai già una richiesta in sospeso',
    'businessReg.pendingMsg': 'La tua richiesta è in fase di verifica',
    
    // Dashboard
    'dashboard.title': 'Dashboard Ristorante',
    'dashboard.overview': 'Panoramica',
    'dashboard.restaurant': 'Ristorante',
    'dashboard.tables': 'Tavoli',
    'dashboard.menu': 'Menu',
    'dashboard.bookings': 'Prenotazioni',
    'dashboard.stats': 'Statistiche',
    'dashboard.promote': 'Sponsorizzazioni',
    'dashboard.restaurantInfo': 'Informazioni Ristorante',
    'dashboard.editInfo': 'Modifica Informazioni',
    'dashboard.manageTables': 'Gestione Tavoli',
    'dashboard.addTable': 'Aggiungi Tavolo',
    'dashboard.tableNumber': 'Numero Tavolo',
    'dashboard.seats': 'Posti',
    'dashboard.location': 'Posizione',
    'dashboard.available': 'Disponibile',
    'dashboard.manageMenu': 'Gestione Menu',
    'dashboard.addDish': 'Aggiungi Piatto',
    'dashboard.dishName': 'Nome Piatto',
    'dashboard.category': 'Categoria',
    'dashboard.price': 'Prezzo',
    'dashboard.description': 'Descrizione',
    'dashboard.todayBookings': 'Prenotazioni Oggi',
    'dashboard.monthRevenue': 'Ricavi Mese',
    'dashboard.avgRating': 'Valutazione Media',
    'dashboard.promoteCampaign': 'Campagne Promozionali',
    'dashboard.createCampaign': 'Crea Campagna',
    'dashboard.save': 'Salva',
    'dashboard.cancel': 'Annulla',
    'dashboard.delete': 'Elimina',
    'dashboard.noAccess': 'Accesso Negato',
    'dashboard.noAccessMsg': 'Devi essere registrato come ristoratore per accedere a questa sezione',
    'dashboard.loading': 'Caricamento...',
    
    // Business
    'business.hero.title': 'OneTable per Ristoratori',
    'business.hero.subtitle': 'Riduci i No-Show e Premia i Clienti Fedeli',
    'business.hero.demo': 'Richiedi una Demo',
    'business.hero.learnMore': 'Scopri di più',
    'business.why.title': 'Perché Scegliere OneTable',
    'business.howItWorks.title': 'Come Funziona per Aziende',
    'business.cta.title': 'Inizia a Ridurre i No-Show Oggi',
    'business.cta.subtitle': 'Unisciti a centinaia di ristoranti che hanno già migliorato la loro gestione',
    'business.cta.register': 'Registrati',
    
    // Footer
    'footer.product': 'Prodotto',
    'footer.company': 'Azienda',
    'footer.legal': 'Legale',
    'footer.restaurants': 'Ristoranti',
    'footer.business': 'Per Aziende',
    'footer.howItWorks': 'Come Funziona',
    'footer.about': 'Chi Siamo',
    'footer.careers': 'Carriere',
    'footer.contact': 'Contatti',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Termini',
    'footer.rights': 'Tutti i diritti riservati.',
  },
  en: {
    // Header
    'nav.forBusiness': 'For Business',
    'nav.login': 'Login',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.badge': 'Innovative Reputation System',
    'hero.title1': 'Book, Save,',
    'hero.title2': 'Enjoy VIP Benefits',
    'hero.description': 'The more punctual and reliable you are, the more benefits you get: table upgrades with better views, exclusive discounts and VIP treatment at the best restaurants.',
    'hero.search': 'Search for your favorite restaurant...',
    'hero.searchButton': 'Search',
    'hero.rating': 'Average Rating',
    'hero.partners': 'Partner Restaurants',
    
    // Restaurant Section
    'restaurants.title': 'Restaurants',
    'restaurants.nearMe': 'Near Me',
    'restaurants.sponsored': 'Sponsored',
    'restaurants.bookNow': 'Book Now',
    'restaurants.noResults': 'No restaurants found',
    
    // Filters
    'filters.title': 'Filters',
    'filters.city': 'City',
    'filters.radius': 'Radius (km)',
    'filters.price': 'Price',
    'filters.sortBy': 'Sort by',
    'filters.rating': 'Rating',
    'filters.apply': 'Apply Filters',
    
    // How It Works
    'howItWorks.title': 'How It Works',
    'howItWorks.step1.title': 'Create your account',
    'howItWorks.step1.desc': 'Sign up for free in seconds',
    'howItWorks.step2.title': 'Book a restaurant',
    'howItWorks.step2.desc': 'Choose from hundreds of partner restaurants',
    'howItWorks.step3.title': 'Earn points',
    'howItWorks.step3.desc': 'Every honored reservation makes you level up',
    'howItWorks.step4.title': 'Get VIP benefits',
    'howItWorks.step4.desc': 'Discounts, upgrades and exclusive treatments',
    
    // Levels
    'levels.title': 'Your Benefits by Level',
    'levels.bronze': 'Bronze',
    'levels.silver': 'Silver',
    'levels.gold': 'Gold',
    'levels.platinum': 'Platinum',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.username': 'Username',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm Password',
    'profile.changePassword': 'Change Password',
    'profile.uploadAvatar': 'Upload Avatar',
    'profile.saveChanges': 'Save Changes',
    'profile.loyaltyLevel': 'Your Loyalty Level',
    'profile.progress': 'Progress',
    'profile.benefits': 'Your Benefits',
    'profile.points': 'points',
    'profile.pointsToNext': 'You need',
    'profile.toReach': 'to reach level',
    'profile.emailNotEditable': 'Email cannot be changed',
    'profile.passwordUpdated': 'Password updated successfully',
    'profile.profileUpdated': 'Profile updated successfully',
    'profile.avatarUpdated': 'Avatar updated',
    'profile.passwordsMustMatch': 'Passwords must match',
    'profile.fillAllPasswordFields': 'Fill all password fields',
    
    // Restaurant Detail
    'restaurantDetail.menu': 'Menu',
    'restaurantDetail.booking': 'Booking',
    'restaurantDetail.reviews': 'Reviews',
    'restaurantDetail.contacts': 'Contacts',
    'restaurantDetail.phone': 'Phone',
    'restaurantDetail.address': 'Address',
    'restaurantDetail.hours': 'Hours',
    'restaurantDetail.bookTable': 'Book Your Table',
    'restaurantDetail.selectTime': 'Select Time',
    'restaurantDetail.confirm': 'Confirm Booking',
    'restaurantDetail.leaveReview': 'Leave a review',
    'restaurantDetail.submit': 'Submit Review',
    
    // Booking & Reviews
    'booking.bookTable': 'Book Table',
    'booking.date': 'Date',
    'booking.time': 'Time',
    'booking.numberOfGuests': 'Number of Guests',
    'booking.specialRequests': 'Special Requests',
    'booking.specialRequestsPlaceholder': 'Allergies, preferences, special occasions...',
    'booking.confirmBooking': 'Confirm Booking',
    'booking.confirming': 'Confirming...',
    'booking.pleaseLoginToBook': 'Please login to book',
    'booking.noTablesAvailable': 'No tables available for this date and time',
    'booking.bookingConfirmed': 'Booking confirmed! You will receive a confirmation email.',
    'booking.bookingError': 'Error making booking. Please try again.',
    'review.writeReview': 'Write Review',
    'review.overallRating': 'Overall Rating',
    'review.foodQuality': 'Food Quality',
    'review.serviceQuality': 'Service Quality',
    'review.ambiance': 'Ambiance',
    'review.yourReview': 'Your Review',
    'review.reviewPlaceholder': 'Share your experience...',
    'review.submitReview': 'Submit Review',
    'review.submitting': 'Submitting...',
    'review.pleaseLoginToReview': 'Please login to leave a review',
    'review.pleaseSelectRating': 'Please select a rating',
    'review.reviewSubmitted': 'Review submitted successfully!',
    'review.reviewError': 'Error submitting review. Please try again.',
    'review.loading': 'Loading...',
    'review.noReviewsYet': 'No reviews yet',
    'review.food': 'Food',
    'review.service': 'Service',
    
    // Business
    'business.hero.title': 'OneTable for Restaurants',
    'business.hero.subtitle': 'Reduce No-Shows and Reward Loyal Customers',
    'business.hero.demo': 'Request a Demo',
    'business.hero.learnMore': 'Learn More',
    'business.why.title': 'Why Choose OneTable',
    'business.howItWorks.title': 'How It Works for Business',
    'business.cta.title': 'Start Reducing No-Shows Today',
    'business.cta.subtitle': 'Join hundreds of restaurants that have already improved their management',
    'business.cta.register': 'Register',
    
    // Footer
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.restaurants': 'Restaurants',
    'footer.business': 'For Business',
    'footer.howItWorks': 'How It Works',
    'footer.about': 'About Us',
    'footer.careers': 'Careers',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.rights': 'All rights reserved.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('it');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['it']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
