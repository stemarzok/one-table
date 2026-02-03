import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'it' | 'en' | 'es' | 'de' | 'fr' | 'nl' | 'ru';

export const languageInfo: Record<Language, { flag: string; name: string; nativeName: string }> = {
  it: { flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano' },
  en: { flag: '🇬🇧', name: 'English', nativeName: 'English' },
  es: { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  de: { flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  fr: { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  nl: { flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands' },
  ru: { flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTranslating: boolean;
}

// Base translations in Italian (source language)
const baseTranslations: Record<string, string> = {
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
  
  // Settings
  'settings.title': 'Impostazioni',
  'settings.preferences': 'Preferenze',
  'settings.language': 'Lingua',
  'settings.darkTheme': 'Tema Scuro',
  'settings.translating': 'Traduzione in corso...',
  'settings.contacts': 'Contatti',
  'settings.email': 'Email',
  'settings.phone': 'Telefono',
  'settings.address': 'Indirizzo',
  'settings.social': 'Social Media',
  'settings.legal': 'Informazioni Legali',
  'settings.about': 'Chi Siamo',
  'settings.systemStatus': 'Status Sistema',
};

// Pre-translated English (for performance on common language)
const englishTranslations: Record<string, string> = {
  'nav.forBusiness': 'For Business',
  'nav.login': 'Login',
  'nav.profile': 'Profile',
  'nav.logout': 'Logout',
  'hero.badge': 'Innovative Reputation System',
  'hero.title1': 'Book, Save,',
  'hero.title2': 'Enjoy VIP Benefits',
  'hero.description': 'The more punctual and reliable you are, the more benefits you get: table upgrades with better views, exclusive discounts and VIP treatment at the best restaurants.',
  'hero.search': 'Search for your favorite restaurant...',
  'hero.searchButton': 'Search',
  'hero.rating': 'Average Rating',
  'hero.partners': 'Partner Restaurants',
  'restaurants.title': 'Restaurants',
  'restaurants.nearMe': 'Near Me',
  'restaurants.sponsored': 'Sponsored',
  'restaurants.bookNow': 'Book Now',
  'restaurants.noResults': 'No restaurants found',
  'filters.title': 'Filters',
  'filters.city': 'City',
  'filters.radius': 'Radius (km)',
  'filters.price': 'Price',
  'filters.sortBy': 'Sort by',
  'filters.rating': 'Rating',
  'filters.apply': 'Apply Filters',
  'howItWorks.title': 'How It Works',
  'howItWorks.step1.title': 'Create your account',
  'howItWorks.step1.desc': 'Sign up for free in seconds',
  'howItWorks.step2.title': 'Book a restaurant',
  'howItWorks.step2.desc': 'Choose from hundreds of partner restaurants',
  'howItWorks.step3.title': 'Earn points',
  'howItWorks.step3.desc': 'Every honored reservation makes you level up',
  'howItWorks.step4.title': 'Get VIP benefits',
  'howItWorks.step4.desc': 'Discounts, upgrades and exclusive treatments',
  'levels.title': 'Your Benefits by Level',
  'levels.bronze': 'Bronze',
  'levels.silver': 'Silver',
  'levels.gold': 'Gold',
  'levels.platinum': 'Platinum',
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
  'businessReg.title': 'Business Registration',
  'businessReg.subtitle': 'Fill out the form to request access to OneTable platform',
  'businessReg.companyInfo': 'Company Information',
  'businessReg.businessName': 'Business Name',
  'businessReg.vatNumber': 'VAT Number',
  'businessReg.legalRep': 'Legal Representative',
  'businessReg.contactInfo': 'Business Contacts',
  'businessReg.businessEmail': 'Business Email',
  'businessReg.businessPhone': 'Business Phone',
  'businessReg.address': 'Legal Address',
  'businessReg.city': 'City',
  'businessReg.province': 'Province',
  'businessReg.postalCode': 'Postal Code',
  'businessReg.documents': 'Documents',
  'businessReg.uploadDocs': 'Upload Documents',
  'businessReg.docsRequired': 'Chamber Certificate, Registry, Commercial License',
  'businessReg.submit': 'Submit Request',
  'businessReg.submitting': 'Submitting...',
  'businessReg.success': 'Request submitted successfully',
  'businessReg.successMsg': 'Your request is under review. We will contact you within 48 hours.',
  'businessReg.error': 'Error',
  'businessReg.pending': 'You already have a pending request',
  'businessReg.pendingMsg': 'Your request is under review',
  'dashboard.title': 'Restaurant Dashboard',
  'dashboard.overview': 'Overview',
  'dashboard.restaurant': 'Restaurant',
  'dashboard.tables': 'Tables',
  'dashboard.menu': 'Menu',
  'dashboard.bookings': 'Bookings',
  'dashboard.stats': 'Statistics',
  'dashboard.promote': 'Promotions',
  'dashboard.restaurantInfo': 'Restaurant Information',
  'dashboard.editInfo': 'Edit Information',
  'dashboard.manageTables': 'Table Management',
  'dashboard.addTable': 'Add Table',
  'dashboard.tableNumber': 'Table Number',
  'dashboard.seats': 'Seats',
  'dashboard.location': 'Location',
  'dashboard.available': 'Available',
  'dashboard.manageMenu': 'Menu Management',
  'dashboard.addDish': 'Add Dish',
  'dashboard.dishName': 'Dish Name',
  'dashboard.category': 'Category',
  'dashboard.price': 'Price',
  'dashboard.description': 'Description',
  'dashboard.todayBookings': "Today's Bookings",
  'dashboard.monthRevenue': 'Monthly Revenue',
  'dashboard.avgRating': 'Average Rating',
  'dashboard.promoteCampaign': 'Promotional Campaigns',
  'dashboard.createCampaign': 'Create Campaign',
  'dashboard.save': 'Save',
  'dashboard.cancel': 'Cancel',
  'dashboard.delete': 'Delete',
  'dashboard.noAccess': 'Access Denied',
  'dashboard.noAccessMsg': 'You must be registered as a restaurant owner to access this section',
  'dashboard.loading': 'Loading...',
  'business.hero.title': 'OneTable for Restaurants',
  'business.hero.subtitle': 'Reduce No-Shows and Reward Loyal Customers',
  'business.hero.demo': 'Request a Demo',
  'business.hero.learnMore': 'Learn More',
  'business.why.title': 'Why Choose OneTable',
  'business.howItWorks.title': 'How It Works for Business',
  'business.cta.title': 'Start Reducing No-Shows Today',
  'business.cta.subtitle': 'Join hundreds of restaurants that have already improved their management',
  'business.cta.register': 'Register',
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
  'settings.title': 'Settings',
  'settings.preferences': 'Preferences',
  'settings.language': 'Language',
  'settings.darkTheme': 'Dark Theme',
  'settings.translating': 'Translating...',
  'settings.contacts': 'Contacts',
  'settings.email': 'Email',
  'settings.phone': 'Phone',
  'settings.address': 'Address',
  'settings.social': 'Social Media',
  'settings.legal': 'Legal Information',
  'settings.about': 'About Us',
  'settings.systemStatus': 'System Status',
};

// Translation cache
const translationCache: Record<Language, Record<string, string>> = {
  it: baseTranslations,
  en: englishTranslations,
  es: {},
  de: {},
  fr: {},
  nl: {},
  ru: {},
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('onetable_language');
    return (stored as Language) || 'it';
  });
  const [translations, setTranslations] = useState<Record<string, string>>(
    language === 'it' ? baseTranslations : (translationCache[language] || {})
  );
  const [isTranslating, setIsTranslating] = useState(false);

  // Load AI translations for non-cached languages
  const loadTranslations = useCallback(async (lang: Language) => {
    if (lang === 'it') {
      setTranslations(baseTranslations);
      return;
    }

    if (lang === 'en') {
      setTranslations(englishTranslations);
      return;
    }

    // Check localStorage cache first
    const cacheKey = `onetable_translations_${lang}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Object.keys(parsed).length > 0) {
          translationCache[lang] = parsed;
          setTranslations(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load cached translations:', e);
    }

    // Need to fetch translations via AI
    setIsTranslating(true);

    try {
      const textsToTranslate = Object.entries(baseTranslations).map(([key, value]) => ({
        key,
        value,
      }));

      // Split into batches of 30 to avoid token limits
      const batchSize = 30;
      const batches = [];
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        batches.push(textsToTranslate.slice(i, i + batchSize));
      }

      let allTranslations: Record<string, string> = {};

      for (const batch of batches) {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: {
            texts: batch,
            targetLanguage: lang,
            sourceLanguage: 'it',
          },
        });

        if (error) {
          console.error('Translation error:', error);
          continue;
        }

        if (data?.translations) {
          allTranslations = { ...allTranslations, ...data.translations };
        }
      }

      if (Object.keys(allTranslations).length > 0) {
        translationCache[lang] = allTranslations;
        setTranslations(allTranslations);
        
        // Cache to localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(allTranslations));
        } catch (e) {
          console.error('Failed to cache translations:', e);
        }
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to Italian
      setTranslations(baseTranslations);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Handle language change
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('onetable_language', lang);
    loadTranslations(lang);
  }, [loadTranslations]);

  // Load translations on mount and language change
  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  // Translation function
  const t = useCallback((key: string): string => {
    return translations[key] || baseTranslations[key] || key;
  }, [translations]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    isTranslating,
  }), [language, setLanguage, t, isTranslating]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
