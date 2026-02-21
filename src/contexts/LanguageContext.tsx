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
  'nav.signup': 'Registrati',
  'nav.areYouClient': 'Sei un Cliente?',
  'nav.pricing': 'Prezzi',
  
  // Hero
  'hero.badge': 'Sistema di Reputazione Innovativo',
  'hero.title1': 'I Migliori Tavoli',
  'hero.title2': 'Per Chi Se Li Merita',
  'hero.subtitle': 'Più rispetti le prenotazioni, più sblocchi vantaggi VIP nei migliori ristoranti.',
  'hero.searchButton': 'Cerca un ristorante',
  'hero.howItWorks': 'Come funziona',
  'hero.description': 'Più sei puntuale e affidabile, più vantaggi ottieni: upgrade di tavoli con vista migliore, sconti esclusivi e trattamenti VIP nei migliori ristoranti.',
  'hero.search': 'Cerca il tuo ristorante preferito...',
  'hero.rating': 'Valutazione Media',
  'hero.partners': 'Ristoranti Partner',
  
  // How It Works
  'howItWorks.sectionTitle': 'Il tuo comportamento diventa valore',
  'howItWorks.sectionSubtitle': 'Non basta prenotare, conta come ti comporti.',
  'howItWorks.title': 'Come Funziona',
  'howItWorks.step1.title': 'Crea il tuo account',
  'howItWorks.step1.desc': 'Registrati gratuitamente e inizia a prenotare.',
  'howItWorks.step2.title': 'Prenota un ristorante',
  'howItWorks.step2.desc': 'Scegli tra ristoranti selezionati e prenota in pochi click.',
  'howItWorks.step3.title': 'Rispetta la prenotazione',
  'howItWorks.step3.desc': 'Arriva puntuale e vivi l\'esperienza.',
  'howItWorks.step4.title': 'Sblocca vantaggi VIP',
  'howItWorks.step4.desc': 'Ogni prenotazione rispettata ti fa salire di livello e ti premia.',
  'howItWorks.scrollHint': '← Scorri per vedere tutti →',
  
  // Value Proposition
  'value.title': 'One-Table non è una semplice prenotazione.',
  'value.description': 'È un sistema che trasforma il tuo comportamento in vantaggi reali: upgrade, sconti, tavoli migliori e trattamenti riservati.',
  'value.upgrade': 'Upgrade',
  'value.upgradeDesc': 'Tavoli migliori',
  'value.discounts': 'Sconti',
  'value.discountsDesc': 'Esclusivi',
  'value.vip': 'VIP',
  'value.vipDesc': 'Trattamento riservato',
  'value.benefits': 'Vantaggi',
  'value.benefitsDesc': 'Reali e immediati',
  
  // Level Benefits
  'levels.badge': 'Sistema a livelli',
  'levels.title': 'Più sei affidabile, più vieni premiato',
  'levels.subtitle': 'Ogni livello sblocca vantaggi esclusivi. Il tuo percorso inizia ora.',
  'levels.points': 'punti',
  'levels.bronze': 'Bronzo',
  'levels.bronzeSub': 'Inizia il percorso',
  'levels.bronze.b1': 'Accesso alla piattaforma',
  'levels.bronze.b2': 'Prenotazioni standard',
  'levels.bronze.b3': 'Notifiche e gestione semplice',
  'levels.silver': 'Argento',
  'levels.silverSub': 'Inizia a distinguerti',
  'levels.silver.b1': 'Priorità nelle prenotazioni',
  'levels.silver.b2': '5% di sconto',
  'levels.silver.b3': 'Tavoli con vista migliore',
  'levels.gold': 'Oro',
  'levels.goldSub': 'Accesso premium',
  'levels.gold.b1': 'Prenotazioni garantite',
  'levels.gold.b2': '15% di sconto',
  'levels.gold.b3': 'Tavoli premium',
  'levels.gold.b4': 'Welcome drink incluso',
  'levels.platinum': 'Platino',
  'levels.platinumSub': 'Trattamento VIP',
  'levels.platinum.b1': 'Accesso VIP illimitato',
  'levels.platinum.b2': '25% di sconto',
  'levels.platinum.b3': 'I migliori tavoli disponibili',
  'levels.platinum.b4': 'Menu degustazione omaggio',
  'levels.platinum.b5': 'Concierge personale',
  'levels.goToLevel': 'Vai al livello',
  
  // Final CTA
  'cta.title': 'Il tuo tavolo ti sta aspettando',
  'cta.subtitle': 'Inizia da oggi a trasformare le tue prenotazioni in vantaggi esclusivi.',
  'cta.button': 'Cerca un ristorante',
  
  // Footer
  'footer.description': 'La piattaforma innovativa che premia la tua affidabilità con vantaggi esclusivi nei migliori ristoranti.',
  'footer.usefulLinks': 'Link Utili',
  'footer.howItWorks': 'Come Funziona',
  'footer.levelsAndBenefits': 'Livelli e Vantaggi',
  'footer.partnerRestaurants': 'Ristoranti Partner',
  'footer.forBusiness': 'Per Aziende',
  'footer.legal': 'Legale',
  'footer.privacyPolicy': 'Privacy Policy',
  'footer.termsAndConditions': 'Termini e Condizioni',
  'footer.cookiePolicy': 'Cookie Policy',
  'footer.contacts': 'Contatti',
  'footer.allRightsReserved': 'Tutti i diritti riservati.',
  'footer.product': 'Prodotto',
  'footer.company': 'Azienda',
  'footer.restaurants': 'Ristoranti',
  'footer.business': 'Per Aziende',
  'footer.about': 'Chi Siamo',
  'footer.careers': 'Carriere',
  'footer.contact': 'Contatti',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Termini',
  'footer.rights': 'Tutti i diritti riservati.',
  
  // Restaurant Section
  'restaurants.title': 'Ristoranti',
  'restaurants.nearMe': 'Vicino a me',
  'restaurants.sponsored': 'Sponsorizzato',
  'restaurants.bookNow': 'Prenota Ora',
  'restaurants.noResults': 'Nessun ristorante trovato',
  'restaurants.whatToEat': 'Cosa ti va di mangiare?',
  'restaurants.findPerfect': 'Trova il ristorante perfetto per ogni occasione',
  'restaurants.exploreByCategory': 'Esplora per categoria',
  'restaurants.discoverByCuisine': 'Scopri ristoranti per tipo di cucina',
  'restaurants.recentlyViewed': 'Hai già visto',
  'restaurants.recentlyViewedDesc': 'Ristoranti che hai visitato di recente',
  'restaurants.bookAgain': 'Prenota di nuovo',
  'restaurants.bookAgainDesc': 'Ristoranti dove hai già mangiato',
  'restaurants.recommendedForYou': 'Consigliati per te',
  'restaurants.recommendedDesc': 'Esperienze selezionate per te',
  'restaurants.allRestaurants': 'Tutti i ristoranti',
  'restaurants.found': 'ristoranti trovati',
  'restaurants.noRestaurantsFound': 'Nessun ristorante trovato',
  'restaurants.removeCategoryFilter': 'Rimuovi filtro categoria',
  'restaurants.nearbyRestaurants': 'Ristoranti vicino a te',
  'restaurants.missingMapToken': 'Token Mapbox mancante',
  'restaurants.findNearby': 'Trova ristoranti vicino a te',
  'restaurants.recentSearches': 'Ricerche recenti',
  'restaurants.restaurants': 'Ristoranti',
  'restaurants.others': 'altri',
  'restaurants.filters': 'Filtri',
  'restaurants.addToFavorites': 'Aggiungi ai preferiti',
  'restaurants.removeFromFavorites': 'Rimuovi dai preferiti',
  'restaurants.restaurant': 'Ristorante',
  'restaurants.goToPage': 'Vai a pagina',
  
  // Restaurant Detail Page
  'detail.overview': 'Panoramica',
  'detail.hours': 'Orari',
  'detail.position': 'Posizione',
  'detail.menu': 'Menu',
  'detail.reviews': 'Recensioni',
  'detail.inBrief': 'In breve',
  'detail.info': 'Info',
  'detail.showLess': 'Mostra meno',
  'detail.showMore': 'Scopri di più',
  'detail.features': 'Caratteristiche',
  'detail.openInGoogleMaps': 'Apri in Google Maps',
  'detail.noDishesAvailable': 'Nessun piatto disponibile al momento',
  'detail.writeReview': 'Scrivi una recensione',
  'detail.restaurantNotFound': 'Ristorante non trovato',
  'detail.saved': 'Salvato',
  'detail.save': 'Salva',
  'detail.saveRestaurant': 'Salva questo ristorante',

  // Booking Widget
  'booking.bookATable': 'Prenota un tavolo',
  'booking.dateLabel': 'Data',
  'booking.guestsLabel': 'Ospiti',
  'booking.closedOnDate': 'Il ristorante è chiuso in questa data. Seleziona un altro giorno.',
  'booking.openHours': 'Aperto',
  'booking.breakTime': 'pausa',
  'booking.checkingAvailability': 'Controllo disponibilità...',
  'booking.lunch': 'Pranzo',
  'booking.dinner': 'Cena',
  'booking.noSlotsAvailable': 'Nessuno slot disponibile per questa data',
  'booking.sending': 'Invio...',
  'booking.bookNow': 'Prenota ora',
  'booking.selectTime': 'Seleziona un orario disponibile',
  'booking.requestSent': 'Richiesta di prenotazione inviata!',

  // Opening Hours
  'hours.title': 'Orari',
  'hours.openNow': 'Aperto ora',
  'hours.closed': 'Chiuso',
  'hours.opensAt': 'Apre alle',
  'hours.opensTomorrow': 'Apre domani alle',
  'hours.opensOn': 'Apre',
  'hours.at': 'alle',
  'hours.monday': 'Lunedì',
  'hours.tuesday': 'Martedì',
  'hours.wednesday': 'Mercoledì',
  'hours.thursday': 'Giovedì',
  'hours.friday': 'Venerdì',
  'hours.saturday': 'Sabato',
  'hours.sunday': 'Domenica',

  // Filters
  'filters.title': 'Filtri',
  'filters.city': 'Città',
  'filters.radius': 'Raggio (km)',
  'filters.price': 'Prezzo',
  'filters.sortBy': 'Ordina per',
  'filters.rating': 'Valutazione',
  'filters.apply': 'Applica Filtri',
  
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
  
  // Auth
  'auth.welcome': 'Benvenuto su OneTable',
  'auth.subtitle': 'Accedi o registrati per prenotare il tuo tavolo',
  'auth.login': 'Accedi',
  'auth.signup': 'Registrati',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.rememberMe': 'Ricordami',
  'auth.forgotPassword': 'Password dimenticata?',
  'auth.loggingIn': 'Accesso in corso...',
  'auth.or': 'oppure',
  'auth.continueGoogle': 'Continua con Google',
  'auth.continueApple': 'Continua con Apple',
  'auth.appleComingSoon': 'Apple: disponibile a breve',
  'auth.fullName': 'Nome completo',
  'auth.confirmPassword': 'Conferma Password',
  'auth.phone': 'Telefono',
  'auth.signingUp': 'Registrazione in corso...',
  'auth.passwordsMatch': 'Le password corrispondono ✓',
  'auth.passwordsNoMatch': 'Le password non corrispondono',
  'auth.termsAgree': 'Registrandoti, accetti i nostri',
  'auth.termsOfService': 'Termini di Servizio',
  'auth.and': 'e la nostra',
  'auth.privacyPolicy': 'Privacy Policy',
  'auth.resetPassword': 'Recupera Password',
  'auth.resetDescription': 'Inserisci la tua email e ti invieremo un link per reimpostare la password',
  'auth.sendResetLink': 'Invia Link di Recupero',
  'auth.sendingReset': 'Invio in corso...',

  // MyBookings
  'bookings.title': 'Le Mie Prenotazioni',
  'bookings.subtitle': 'Gestisci le tue prenotazioni passate e future',
  'bookings.upcoming': 'Prossime',
  'bookings.past': 'Passate',
  'bookings.noUpcoming': 'Nessuna prenotazione futura',
  'bookings.noUpcomingDesc': 'Non hai ancora prenotazioni in programma',
  'bookings.searchRestaurants': 'Cerca Ristoranti',
  'bookings.noPast': 'Nessuna prenotazione passata',
  'bookings.noPastDesc': 'Non hai ancora prenotazioni completate o annullate',
  'bookings.confirmed': 'Confermata',
  'bookings.pending': 'In Attesa',
  'bookings.cancelled': 'Annullata',
  'bookings.completed': 'Completata',
  'bookings.guest': 'ospite',
  'bookings.guests': 'ospiti',
  'bookings.specialRequests': 'Richieste speciali:',
  'bookings.viewRestaurant': 'Vedi Ristorante',
  'bookings.cancel': 'Annulla',
  'bookings.cancelQuestion': 'Annullare la prenotazione?',
  'bookings.cancelWarning': 'Annullando questa prenotazione confermata a meno di 48 ore dall\'orario prenotato, perderai dei punti fedeltà.',
  'bookings.cancelConfirm': 'Sei sicuro di voler procedere?',
  'bookings.cancelGeneric': 'Sei sicuro di voler annullare questa prenotazione? Questa azione non può essere annullata.',
  'bookings.back': 'Indietro',
  'bookings.cancelBooking': 'Annulla Prenotazione',
  'bookings.leaveReview': 'Lascia una Recensione',
  'bookings.loading': 'Caricamento...',

  // Favorites
  'favorites.title': 'I Miei Preferiti',
  'favorites.saved': 'salvato',
  'favorites.savedPlural': 'salvati',
  'favorites.restaurant': 'ristorante',
  'favorites.restaurants': 'ristoranti',
  'favorites.noSaved': 'Nessun ristorante salvato',
  'favorites.emptyTitle': 'Nessun preferito ancora',
  'favorites.emptyDesc': 'Inizia ad aggiungere i tuoi ristoranti preferiti per trovarli facilmente qui',
  'favorites.explore': 'Esplora Ristoranti',

  // Profile extras
  'profile.personalData': 'Dati Personali',
  'profile.changeEmail': 'Cambia Email',
  'profile.newEmail': 'Nuova Email',
  'profile.currentPasswordLabel': 'Password Attuale',
  'profile.changeEmailButton': 'Cambia Email',
  'profile.myBookings': 'Le Mie Prenotazioni',
  'profile.manageBookings': 'Gestisci le tue prenotazioni',
  'profile.myFavorites': 'I Miei Preferiti',
  'profile.savedRestaurants': 'Ristoranti salvati',
  'profile.writtenReviews': 'Recensioni Scritte',
  'profile.reviewsCount': 'recensioni',
  'profile.pointsToNextLevel': 'Ti mancano {0} punti per raggiungere il livello {1}',
  'profile.maxLevel': 'Hai raggiunto il livello massimo! 🎉',
  'profile.progressToward': 'Progresso verso',

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
  'settings.aboutDescription': 'La piattaforma innovativa che premia la tua affidabilità con vantaggi esclusivi nei migliori ristoranti.',
  'settings.copyright': 'Tutti i diritti riservati.',
  'settings.privacyPolicy': 'Privacy Policy',
  'settings.termsConditions': 'Termini e Condizioni',
  'settings.cookiePolicy': 'Cookie Policy',
  'settings.themeLightActivated': 'Tema chiaro attivato',
  'settings.themeDarkActivated': 'Tema scuro attivato',

  // User Menu
  'menu.title': 'Menu Utente',
  'menu.myBookings': 'Le Mie Prenotazioni',
  'menu.favorites': 'Preferiti',
  'menu.settings': 'Impostazioni',
  'menu.adminPanel': 'Pannello Admin',
  'menu.logout': 'Disconnetti',
  'menu.logoutSuccess': 'Disconnesso con successo',
  'menu.user': 'Utente',
  'menu.points': 'punti',
  'menu.quickPreferences': 'Preferenze Rapide',
  'menu.language': 'Lingua',
  'menu.darkTheme': 'Tema Scuro',
  'menu.languageChanged': 'Lingua cambiata in',
};

// Pre-translated English (for performance on common language)
const englishTranslations: Record<string, string> = {
  'nav.forBusiness': 'For Business',
  'nav.login': 'Login',
  'nav.profile': 'Profile',
  'nav.logout': 'Logout',
  'nav.signup': 'Sign Up',
  'nav.areYouClient': 'Are you a Client?',
  'nav.pricing': 'Pricing',
  'hero.badge': 'Innovative Reputation System',
  'hero.title1': 'The Best Tables',
  'hero.title2': 'For Those Who Deserve Them',
  'hero.subtitle': 'The more you honor your reservations, the more VIP benefits you unlock at the best restaurants.',
  'hero.searchButton': 'Find a restaurant',
  'hero.howItWorks': 'How it works',
  'hero.description': 'The more punctual and reliable you are, the more benefits you get: table upgrades with better views, exclusive discounts and VIP treatment at the best restaurants.',
  'hero.search': 'Search for your favorite restaurant...',
  'hero.rating': 'Average Rating',
  'hero.partners': 'Partner Restaurants',
  'howItWorks.sectionTitle': 'Your behavior becomes value',
  'howItWorks.sectionSubtitle': 'It\'s not enough to book, what matters is how you behave.',
  'howItWorks.title': 'How It Works',
  'howItWorks.step1.title': 'Create your account',
  'howItWorks.step1.desc': 'Sign up for free and start booking.',
  'howItWorks.step2.title': 'Book a restaurant',
  'howItWorks.step2.desc': 'Choose from selected restaurants and book in a few clicks.',
  'howItWorks.step3.title': 'Honor the reservation',
  'howItWorks.step3.desc': 'Show up on time and enjoy the experience.',
  'howItWorks.step4.title': 'Unlock VIP benefits',
  'howItWorks.step4.desc': 'Every honored reservation levels you up and rewards you.',
  'howItWorks.scrollHint': '← Scroll to see all →',
  'value.title': 'OneTable is not just a booking.',
  'value.description': 'It\'s a system that transforms your behavior into real benefits: upgrades, discounts, better tables and reserved treatments.',
  'value.upgrade': 'Upgrade',
  'value.upgradeDesc': 'Better tables',
  'value.discounts': 'Discounts',
  'value.discountsDesc': 'Exclusive',
  'value.vip': 'VIP',
  'value.vipDesc': 'Reserved treatment',
  'value.benefits': 'Benefits',
  'value.benefitsDesc': 'Real and immediate',
  'levels.badge': 'Level system',
  'levels.title': 'The more reliable you are, the more you get rewarded',
  'levels.subtitle': 'Each level unlocks exclusive benefits. Your journey starts now.',
  'levels.points': 'points',
  'levels.bronze': 'Bronze',
  'levels.bronzeSub': 'Start the journey',
  'levels.bronze.b1': 'Platform access',
  'levels.bronze.b2': 'Standard reservations',
  'levels.bronze.b3': 'Notifications and simple management',
  'levels.silver': 'Silver',
  'levels.silverSub': 'Start standing out',
  'levels.silver.b1': 'Priority reservations',
  'levels.silver.b2': '5% discount',
  'levels.silver.b3': 'Tables with better views',
  'levels.gold': 'Gold',
  'levels.goldSub': 'Premium access',
  'levels.gold.b1': 'Guaranteed reservations',
  'levels.gold.b2': '15% discount',
  'levels.gold.b3': 'Premium tables',
  'levels.gold.b4': 'Welcome drink included',
  'levels.platinum': 'Platinum',
  'levels.platinumSub': 'VIP Treatment',
  'levels.platinum.b1': 'Unlimited VIP access',
  'levels.platinum.b2': '25% discount',
  'levels.platinum.b3': 'Best available tables',
  'levels.platinum.b4': 'Complimentary tasting menu',
  'levels.platinum.b5': 'Personal concierge',
  'levels.goToLevel': 'Go to level',
  'cta.title': 'Your table is waiting for you',
  'cta.subtitle': 'Start today transforming your reservations into exclusive benefits.',
  'cta.button': 'Find a restaurant',
  'footer.description': 'The innovative platform that rewards your reliability with exclusive benefits at the best restaurants.',
  'footer.usefulLinks': 'Useful Links',
  'footer.howItWorks': 'How It Works',
  'footer.levelsAndBenefits': 'Levels and Benefits',
  'footer.partnerRestaurants': 'Partner Restaurants',
  'footer.forBusiness': 'For Business',
  'footer.legal': 'Legal',
  'footer.privacyPolicy': 'Privacy Policy',
  'footer.termsAndConditions': 'Terms and Conditions',
  'footer.cookiePolicy': 'Cookie Policy',
  'footer.contacts': 'Contacts',
  'footer.allRightsReserved': 'All rights reserved.',
  'footer.product': 'Product',
  'footer.company': 'Company',
  'footer.restaurants': 'Restaurants',
  'footer.business': 'For Business',
  'footer.about': 'About Us',
  'footer.careers': 'Careers',
  'footer.contact': 'Contact',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.rights': 'All rights reserved.',
  'restaurants.title': 'Restaurants',
  'restaurants.nearMe': 'Near Me',
  'restaurants.sponsored': 'Sponsored',
  'restaurants.bookNow': 'Book Now',
  'restaurants.noResults': 'No restaurants found',
  'restaurants.whatToEat': 'What are you in the mood for?',
  'restaurants.findPerfect': 'Find the perfect restaurant for every occasion',
  'restaurants.exploreByCategory': 'Explore by category',
  'restaurants.discoverByCuisine': 'Discover restaurants by cuisine type',
  'restaurants.recentlyViewed': 'Recently viewed',
  'restaurants.recentlyViewedDesc': 'Restaurants you visited recently',
  'restaurants.bookAgain': 'Book again',
  'restaurants.bookAgainDesc': 'Restaurants where you already dined',
  'restaurants.recommendedForYou': 'Recommended for you',
  'restaurants.recommendedDesc': 'Curated experiences for you',
  'restaurants.allRestaurants': 'All restaurants',
  'restaurants.found': 'restaurants found',
  'restaurants.noRestaurantsFound': 'No restaurants found',
  'restaurants.removeCategoryFilter': 'Remove category filter',
  'restaurants.nearbyRestaurants': 'Restaurants near you',
  'restaurants.missingMapToken': 'Mapbox token missing',
  'restaurants.findNearby': 'Find restaurants near you',
  'restaurants.recentSearches': 'Recent searches',
  'restaurants.restaurants': 'Restaurants',
  'restaurants.others': 'others',
  'restaurants.filters': 'Filters',
  'restaurants.addToFavorites': 'Add to favorites',
  'restaurants.removeFromFavorites': 'Remove from favorites',
  'restaurants.restaurant': 'Restaurant',
  'restaurants.goToPage': 'Go to page',

  'detail.overview': 'Overview',
  'detail.hours': 'Hours',
  'detail.position': 'Location',
  'detail.menu': 'Menu',
  'detail.reviews': 'Reviews',
  'detail.inBrief': 'At a glance',
  'detail.info': 'Info',
  'detail.showLess': 'Show less',
  'detail.showMore': 'Read more',
  'detail.features': 'Features',
  'detail.openInGoogleMaps': 'Open in Google Maps',
  'detail.noDishesAvailable': 'No dishes available at the moment',
  'detail.writeReview': 'Write a review',
  'detail.restaurantNotFound': 'Restaurant not found',
  'detail.saved': 'Saved',
  'detail.save': 'Save',
  'detail.saveRestaurant': 'Save this restaurant',

  'booking.bookATable': 'Book a table',
  'booking.dateLabel': 'Date',
  'booking.guestsLabel': 'Guests',
  'booking.closedOnDate': 'The restaurant is closed on this date. Please select another day.',
  'booking.openHours': 'Open',
  'booking.breakTime': 'break',
  'booking.checkingAvailability': 'Checking availability...',
  'booking.lunch': 'Lunch',
  'booking.dinner': 'Dinner',
  'booking.noSlotsAvailable': 'No slots available for this date',
  'booking.sending': 'Sending...',
  'booking.bookNow': 'Book now',
  'booking.selectTime': 'Select an available time',
  'booking.requestSent': 'Booking request sent!',

  'hours.title': 'Hours',
  'hours.openNow': 'Open now',
  'hours.closed': 'Closed',
  'hours.opensAt': 'Opens at',
  'hours.opensTomorrow': 'Opens tomorrow at',
  'hours.opensOn': 'Opens',
  'hours.at': 'at',
  'hours.monday': 'Monday',
  'hours.tuesday': 'Tuesday',
  'hours.wednesday': 'Wednesday',
  'hours.thursday': 'Thursday',
  'hours.friday': 'Friday',
  'hours.saturday': 'Saturday',
  'hours.sunday': 'Sunday',

  'filters.title': 'Filters',
  'filters.city': 'City',
  'filters.radius': 'Radius (km)',
  'filters.price': 'Price',
  'filters.sortBy': 'Sort by',
  'filters.rating': 'Rating',
  'filters.apply': 'Apply Filters',
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
  'auth.welcome': 'Welcome to OneTable',
  'auth.subtitle': 'Login or sign up to book your table',
  'auth.login': 'Login',
  'auth.signup': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.rememberMe': 'Remember me',
  'auth.forgotPassword': 'Forgot password?',
  'auth.loggingIn': 'Logging in...',
  'auth.or': 'or',
  'auth.continueGoogle': 'Continue with Google',
  'auth.continueApple': 'Continue with Apple',
  'auth.appleComingSoon': 'Apple: coming soon',
  'auth.fullName': 'Full name',
  'auth.confirmPassword': 'Confirm Password',
  'auth.phone': 'Phone',
  'auth.signingUp': 'Signing up...',
  'auth.passwordsMatch': 'Passwords match ✓',
  'auth.passwordsNoMatch': 'Passwords do not match',
  'auth.termsAgree': 'By signing up, you agree to our',
  'auth.termsOfService': 'Terms of Service',
  'auth.and': 'and our',
  'auth.privacyPolicy': 'Privacy Policy',
  'auth.resetPassword': 'Reset Password',
  'auth.resetDescription': 'Enter your email and we\'ll send you a link to reset your password',
  'auth.sendResetLink': 'Send Reset Link',
  'auth.sendingReset': 'Sending...',
  'bookings.title': 'My Bookings',
  'bookings.subtitle': 'Manage your past and upcoming bookings',
  'bookings.upcoming': 'Upcoming',
  'bookings.past': 'Past',
  'bookings.noUpcoming': 'No upcoming bookings',
  'bookings.noUpcomingDesc': 'You don\'t have any scheduled bookings yet',
  'bookings.searchRestaurants': 'Search Restaurants',
  'bookings.noPast': 'No past bookings',
  'bookings.noPastDesc': 'You don\'t have any completed or cancelled bookings yet',
  'bookings.confirmed': 'Confirmed',
  'bookings.pending': 'Pending',
  'bookings.cancelled': 'Cancelled',
  'bookings.completed': 'Completed',
  'bookings.guest': 'guest',
  'bookings.guests': 'guests',
  'bookings.specialRequests': 'Special requests:',
  'bookings.viewRestaurant': 'View Restaurant',
  'bookings.cancel': 'Cancel',
  'bookings.cancelQuestion': 'Cancel booking?',
  'bookings.cancelWarning': 'Cancelling this confirmed booking less than 48 hours before the reserved time will cost you loyalty points.',
  'bookings.cancelConfirm': 'Are you sure you want to proceed?',
  'bookings.cancelGeneric': 'Are you sure you want to cancel this booking? This action cannot be undone.',
  'bookings.back': 'Back',
  'bookings.cancelBooking': 'Cancel Booking',
  'bookings.leaveReview': 'Leave a Review',
  'bookings.loading': 'Loading...',
  'favorites.title': 'My Favorites',
  'favorites.saved': 'saved',
  'favorites.savedPlural': 'saved',
  'favorites.restaurant': 'restaurant',
  'favorites.restaurants': 'restaurants',
  'favorites.noSaved': 'No saved restaurants',
  'favorites.emptyTitle': 'No favorites yet',
  'favorites.emptyDesc': 'Start adding your favorite restaurants to easily find them here',
  'favorites.explore': 'Explore Restaurants',
  'profile.personalData': 'Personal Data',
  'profile.changeEmail': 'Change Email',
  'profile.newEmail': 'New Email',
  'profile.currentPasswordLabel': 'Current Password',
  'profile.changeEmailButton': 'Change Email',
  'profile.myBookings': 'My Bookings',
  'profile.manageBookings': 'Manage your bookings',
  'profile.myFavorites': 'My Favorites',
  'profile.savedRestaurants': 'Saved restaurants',
  'profile.writtenReviews': 'Written Reviews',
  'profile.reviewsCount': 'reviews',
  'profile.pointsToNextLevel': 'You need {0} points to reach level {1}',
  'profile.maxLevel': 'You\'ve reached the maximum level! 🎉',
  'profile.progressToward': 'Progress toward',
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
  'settings.aboutDescription': 'The innovative platform that rewards your reliability with exclusive benefits at the best restaurants.',
  'settings.copyright': 'All rights reserved.',
  'settings.privacyPolicy': 'Privacy Policy',
  'settings.termsConditions': 'Terms and Conditions',
  'settings.cookiePolicy': 'Cookie Policy',
  'settings.themeLightActivated': 'Light theme activated',
  'settings.themeDarkActivated': 'Dark theme activated',

  // User Menu
  'menu.title': 'User Menu',
  'menu.myBookings': 'My Bookings',
  'menu.favorites': 'Favorites',
  'menu.settings': 'Settings',
  'menu.adminPanel': 'Admin Panel',
  'menu.logout': 'Log Out',
  'menu.logoutSuccess': 'Logged out successfully',
  'menu.user': 'User',
  'menu.points': 'points',
  'menu.quickPreferences': 'Quick Preferences',
  'menu.language': 'Language',
  'menu.darkTheme': 'Dark Theme',
  'menu.languageChanged': 'Language changed to',
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
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    const lang = (localStorage.getItem('onetable_language') as Language) || 'it';
    if (lang === 'it') return baseTranslations;
    if (lang === 'en') return englishTranslations;
    // Try localStorage cache
    try {
      const cached = localStorage.getItem(`onetable_translations_${lang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Object.keys(parsed).length > 0) return parsed;
      }
    } catch {}
    return baseTranslations; // fallback to Italian while loading
  });
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
        if (Object.keys(parsed).length >= Object.keys(baseTranslations).length * 0.8) {
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

      // Split into batches of 40
      const batchSize = 40;
      const batches = [];
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        batches.push(textsToTranslate.slice(i, i + batchSize));
      }

      let allTranslations: Record<string, string> = {};

      // Run batches in parallel for speed
      const results = await Promise.allSettled(
        batches.map(async (batch) => {
          const { data, error } = await supabase.functions.invoke('translate', {
            body: {
              texts: batch,
              targetLanguage: lang,
              sourceLanguage: 'it',
            },
          });

          if (error) {
            console.error('Translation batch error:', error);
            return {};
          }

          return data?.translations || {};
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          allTranslations = { ...allTranslations, ...result.value };
        }
      });

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
      // Keep current translations (Italian fallback)
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

  // Load translations on mount
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
