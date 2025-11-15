-- Insert sample restaurants with complete data (without owner_id for now)
INSERT INTO public.restaurants (
  name, 
  business_name,
  description, 
  address, 
  city, 
  phone, 
  email, 
  cuisine_type, 
  price_range,
  is_active,
  is_verified,
  verification_status,
  owner_id
) VALUES
-- Italian Restaurants
(
  'La Bella Vita',
  'La Bella Vita SRL',
  'Autentica cucina italiana con pasta fatta in casa e ingredienti di prima qualità. Ambiente elegante e accogliente.',
  'Via Roma 45',
  'Milano',
  '+39 02 1234567',
  'info@labellavita.it',
  'Italiano',
  '€€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Trattoria del Porto',
  'Trattoria del Porto di Rossi Mario',
  'Pesce fresco e piatti della tradizione napoletana. Vista mozzafiato sul porto.',
  'Via Caracciolo 128',
  'Napoli',
  '+39 081 7654321',
  'prenotazioni@trattoriaporto.it',
  'Italiano',
  '€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Pizzeria Margherita',
  'Pizzeria Margherita SNC',
  'La vera pizza napoletana con forno a legna. Impasto a lievitazione naturale di 48 ore.',
  'Piazza Dante 33',
  'Roma',
  '+39 06 9876543',
  'margherita@pizza.it',
  'Italiano',
  '€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Japanese Restaurants
(
  'Sakura Sushi',
  'Sakura Sushi SRL',
  'Sushi bar giapponese con chef certificati. Pesce freschissimo e sake premium.',
  'Corso Venezia 77',
  'Milano',
  '+39 02 3456789',
  'info@sakurasushi.it',
  'Giapponese',
  '€€€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Ramen House',
  'Ramen House di Tanaka Ken',
  'Ramen autentico giapponese con brodo preparato per 12 ore. Atmosfera informale.',
  'Via Torino 55',
  'Torino',
  '+39 011 2345678',
  'contact@ramenhouse.it',
  'Giapponese',
  '€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- French Restaurant
(
  'Le Petit Bistrot',
  'Le Petit Bistrot SARL',
  'Cucina francese raffinata con menu degustazione. Cantina con oltre 300 etichette.',
  'Via Manzoni 12',
  'Milano',
  '+39 02 8765432',
  'reservation@petitbistrot.it',
  'Francese',
  '€€€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Mediterranean
(
  'Mare Nostrum',
  'Mare Nostrum SRL',
  'Cucina mediterranea con influenze greche e spagnole. Terrazza sul mare.',
  'Lungomare Caracciolo 201',
  'Napoli',
  '+39 081 3456789',
  'info@marenostrum.it',
  'Mediterraneo',
  '€€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Steak House
(
  'Black Angus Grill',
  'Black Angus Grill SPA',
  'Steakhouse di alta qualità con carni selezionate e cottura alla griglia. Wine bar.',
  'Via della Spiga 88',
  'Milano',
  '+39 02 4567890',
  'booking@blackangus.it',
  'Steakhouse',
  '€€€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Vegetarian
(
  'Green Garden',
  'Green Garden Bio SRL',
  'Ristorante vegetariano e vegano con ingredienti biologici a km zero.',
  'Via Garibaldi 44',
  'Bologna',
  '+39 051 2345678',
  'info@greengarden.it',
  'Vegetariano',
  '€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Chinese
(
  'Dragon Palace',
  'Dragon Palace di Wang Li',
  'Cucina cinese autentica con specialità del Sichuan. Dim sum fatti a mano.',
  'Via Paolo Sarpi 99',
  'Milano',
  '+39 02 5678901',
  'info@dragonpalace.it',
  'Cinese',
  '€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Mexican
(
  'Casa del Sol',
  'Casa del Sol SRL',
  'Cucina messicana tradizionale con tacos, fajitas e margarita preparati al momento.',
  'Via Tortona 15',
  'Milano',
  '+39 02 6789012',
  'hola@casadelsol.it',
  'Messicano',
  '€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
),
-- Thai
(
  'Thai Orchid',
  'Thai Orchid di Somchai',
  'Autentica cucina thailandese con curry, pad thai e specialità piccanti.',
  'Via Brera 22',
  'Milano',
  '+39 02 7890123',
  'info@thaiorchid.it',
  'Thailandese',
  '€€',
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
);

-- Insert tables for each restaurant (3-5 tables per restaurant with different capacities)

-- La Bella Vita tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Sala Principale', true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'T2', 4, 'Sala Principale', true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'T3', 4, 'Terrazza', true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'T4', 6, 'Sala Privata', true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'T5', 8, 'Sala Privata', true FROM public.restaurants WHERE name = 'La Bella Vita';

-- Trattoria del Porto tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Interno', true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'T2', 4, 'Vista Porto', true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'T3', 4, 'Vista Porto', true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'T4', 6, 'Terrazza', true FROM public.restaurants WHERE name = 'Trattoria del Porto';

-- Pizzeria Margherita tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Sala', true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'T2', 4, 'Sala', true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'T3', 4, 'Sala', true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'T4', 6, 'Sala', true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'T5', 8, 'Esterno', true FROM public.restaurants WHERE name = 'Pizzeria Margherita';

-- Sakura Sushi tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Sushi Bar', true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'T2', 2, 'Sushi Bar', true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'T3', 4, 'Sala Tatami', true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'T4', 6, 'Sala Privata', true FROM public.restaurants WHERE name = 'Sakura Sushi';

-- Ramen House tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Counter', true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'T2', 2, 'Counter', true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'T3', 4, 'Sala', true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'T4', 4, 'Sala', true FROM public.restaurants WHERE name = 'Ramen House';

-- Le Petit Bistrot tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Sala Principale', true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'T2', 4, 'Sala Principale', true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'T3', 6, 'Sala VIP', true FROM public.restaurants WHERE name = 'Le Petit Bistrot';

-- Mare Nostrum tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Terrazza', true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'T2', 4, 'Terrazza', true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'T3', 4, 'Interno', true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'T4', 6, 'Terrazza', true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'T5', 8, 'Sala Privata', true FROM public.restaurants WHERE name = 'Mare Nostrum';

-- Black Angus Grill tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Wine Bar', true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'T2', 4, 'Sala Principale', true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'T3', 6, 'Sala Principale', true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'T4', 8, 'Sala Privata', true FROM public.restaurants WHERE name = 'Black Angus Grill';

-- Green Garden tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Giardino', true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'T2', 4, 'Giardino', true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'T3', 4, 'Interno', true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'T4', 6, 'Terrazza', true FROM public.restaurants WHERE name = 'Green Garden';

-- Dragon Palace tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 4, 'Sala Principale', true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'T2', 4, 'Sala Principale', true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'T3', 6, 'Sala Privata', true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'T4', 8, 'Sala Banchetti', true FROM public.restaurants WHERE name = 'Dragon Palace';

-- Casa del Sol tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Bar', true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'T2', 4, 'Sala', true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'T3', 4, 'Patio', true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'T4', 6, 'Sala', true FROM public.restaurants WHERE name = 'Casa del Sol';

-- Thai Orchid tables
INSERT INTO public.restaurant_tables (restaurant_id, table_number, seats, location, is_available)
SELECT id, 'T1', 2, 'Sala', true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'T2', 4, 'Sala', true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'T3', 4, 'Sala', true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'T4', 6, 'Sala Privata', true FROM public.restaurants WHERE name = 'Thai Orchid';

-- Insert menu items for each restaurant

-- La Bella Vita menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Spaghetti Carbonara', 'Pasta fresca con guanciale, pecorino e uova', 'Primi', 14.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Risotto ai Funghi Porcini', 'Risotto mantecato con funghi porcini freschi', 'Primi', 16.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Tagliata di Manzo', 'Tagliata di manzo con rucola e grana', 'Secondi', 22.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Branzino al Forno', 'Branzino intero al forno con patate', 'Secondi', 24.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Tiramisù', 'Il classico dessert italiano', 'Dolci', 8.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Panna Cotta', 'Panna cotta con coulis di frutti di bosco', 'Dolci', 7.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Antipasto Misto', 'Selezione di salumi e formaggi', 'Antipasti', 12.00, true FROM public.restaurants WHERE name = 'La Bella Vita'
UNION ALL
SELECT id, 'Carpaccio di Manzo', 'Carpaccio con rucola, grana e aceto balsamico', 'Antipasti', 13.00, true FROM public.restaurants WHERE name = 'La Bella Vita';

-- Trattoria del Porto menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Spaghetti alle Vongole', 'Spaghetti con vongole fresche e prezzemolo', 'Primi', 15.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Risotto ai Frutti di Mare', 'Risotto cremoso con frutti di mare misti', 'Primi', 18.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Frittura Mista', 'Frittura di calamari, gamberi e pesce', 'Secondi', 20.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Orata alla Griglia', 'Orata fresca alla griglia', 'Secondi', 22.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Insalata di Mare', 'Insalata di polpo, calamari e gamberi', 'Antipasti', 14.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Alici Marinate', 'Alici fresche marinate al limone', 'Antipasti', 10.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Babà al Rum', 'Babà napoletano con panna', 'Dolci', 6.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto'
UNION ALL
SELECT id, 'Pastiera Napoletana', 'Torta tradizionale napoletana', 'Dolci', 7.00, true FROM public.restaurants WHERE name = 'Trattoria del Porto';

-- Pizzeria Margherita menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Pizza Margherita', 'Pomodoro, mozzarella e basilico', 'Pizze', 8.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Pizza Marinara', 'Pomodoro, aglio, origano', 'Pizze', 6.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Pizza Diavola', 'Pomodoro, mozzarella, salame piccante', 'Pizze', 10.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Pizza Quattro Stagioni', 'Pomodoro, mozzarella, prosciutto, funghi, carciofi, olive', 'Pizze', 12.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Pizza Capricciosa', 'Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi', 'Pizze', 11.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Supplì al Telefono', 'Supplì di riso fritti', 'Antipasti', 5.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Bruschette Miste', 'Bruschette con pomodoro e varianti', 'Antipasti', 6.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita'
UNION ALL
SELECT id, 'Tiramisu', 'Tiramisù della casa', 'Dolci', 6.00, true FROM public.restaurants WHERE name = 'Pizzeria Margherita';

-- Sakura Sushi menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Sashimi Misto', 'Selezione di sashimi di pesce crudo', 'Sashimi', 28.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Nigiri Sushi Set', 'Set di 12 nigiri misti', 'Sushi', 32.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Uramaki California', 'Surimi, avocado, maionese', 'Sushi', 12.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Uramaki Spicy Tuna', 'Tonno piccante, cetriolo', 'Sushi', 15.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Dragon Roll', 'Gambero in tempura, avocado, tobiko', 'Sushi Speciali', 18.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Tempura Mista', 'Gamberi e verdure in tempura', 'Antipasti', 14.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Edamame', 'Fagioli di soia al vapore', 'Antipasti', 6.00, true FROM public.restaurants WHERE name = 'Sakura Sushi'
UNION ALL
SELECT id, 'Mochi Assortiti', 'Mochi al tè verde, fragola, vaniglia', 'Dolci', 8.00, true FROM public.restaurants WHERE name = 'Sakura Sushi';

-- Ramen House menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Tonkotsu Ramen', 'Ramen con brodo di maiale e chashu', 'Ramen', 14.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Shoyu Ramen', 'Ramen con brodo di soia', 'Ramen', 13.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Miso Ramen', 'Ramen con pasta di miso', 'Ramen', 13.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Spicy Ramen', 'Ramen piccante con kimchi', 'Ramen', 15.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Gyoza', 'Ravioli giapponesi alla griglia', 'Antipasti', 8.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Karaage', 'Pollo fritto giapponese', 'Antipasti', 9.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Edamame', 'Fagioli di soia', 'Antipasti', 5.00, true FROM public.restaurants WHERE name = 'Ramen House'
UNION ALL
SELECT id, 'Dorayaki', 'Pancake giapponesi con crema', 'Dolci', 6.00, true FROM public.restaurants WHERE name = 'Ramen House';

-- Le Petit Bistrot menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Foie Gras Poêlé', 'Fegato grasso d''oca con chutney', 'Antipasti', 32.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Escargots de Bourgogne', 'Lumache alla bourguignonne', 'Antipasti', 18.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Coq au Vin', 'Pollo brasato al vino rosso', 'Secondi', 28.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Boeuf Bourguignon', 'Manzo brasato al vino', 'Secondi', 32.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Sole Meunière', 'Sogliola al burro e limone', 'Secondi', 35.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Crème Brûlée', 'Classico dessert francese', 'Dolci', 10.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Tarte Tatin', 'Torta di mele caramellata', 'Dolci', 12.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot'
UNION ALL
SELECT id, 'Plateau de Fromages', 'Selezione di formaggi francesi', 'Formaggi', 16.00, true FROM public.restaurants WHERE name = 'Le Petit Bistrot';

-- Mare Nostrum menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Polpo alla Griglia', 'Polpo grigliato con patate', 'Antipasti', 16.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Cozze Gratinate', 'Cozze al forno con pangrattato', 'Antipasti', 12.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Paella Marinera', 'Paella con frutti di mare', 'Primi', 22.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Risotto Nero di Seppia', 'Risotto con nero di seppia', 'Primi', 18.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Grigliata Mista di Pesce', 'Grigliata di pesce fresco', 'Secondi', 28.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Calamari Ripieni', 'Calamari farciti al forno', 'Secondi', 20.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Catalana di Aragosta', 'Insalata di aragosta', 'Antipasti', 35.00, true FROM public.restaurants WHERE name = 'Mare Nostrum'
UNION ALL
SELECT id, 'Baklava', 'Dolce greco con miele e noci', 'Dolci', 8.00, true FROM public.restaurants WHERE name = 'Mare Nostrum';

-- Black Angus Grill menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Carpaccio di Filetto', 'Carpaccio di manzo con rucola', 'Antipasti', 18.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'Tartare di Manzo', 'Tartare preparata al momento', 'Antipasti', 20.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'Filetto di Manzo', 'Filetto 300g con contorno', 'Secondi', 38.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'Costata di Manzo', 'Costata 500g con contorno', 'Secondi', 45.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'T-Bone Steak', 'T-bone 600g con contorno', 'Secondi', 50.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'Tagliata Black Angus', 'Tagliata 400g con rucola', 'Secondi', 35.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'Patate al Forno', 'Patate rustiche', 'Contorni', 6.00, true FROM public.restaurants WHERE name = 'Black Angus Grill'
UNION ALL
SELECT id, 'Cheese Cake', 'Cheese cake con frutti di bosco', 'Dolci', 10.00, true FROM public.restaurants WHERE name = 'Black Angus Grill';

-- Green Garden menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Hummus e Falafel', 'Hummus fatto in casa con falafel croccanti', 'Antipasti', 9.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Insalata Buddha Bowl', 'Bowl con quinoa, avocado, verdure', 'Insalate', 14.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Burger Vegetale', 'Burger con hamburger di ceci e verdure', 'Secondi', 13.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Lasagne Vegetariane', 'Lasagne con verdure di stagione', 'Primi', 12.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Curry di Verdure', 'Curry thai con latte di cocco', 'Secondi', 14.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Risotto ai Funghi', 'Risotto cremoso con funghi misti', 'Primi', 13.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Cheesecake Vegan', 'Cheesecake senza derivati animali', 'Dolci', 8.00, true FROM public.restaurants WHERE name = 'Green Garden'
UNION ALL
SELECT id, 'Tiramisù Vegan', 'Tiramisù vegano', 'Dolci', 7.00, true FROM public.restaurants WHERE name = 'Green Garden';

-- Dragon Palace menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Ravioli al Vapore', 'Dim sum misti (8 pezzi)', 'Antipasti', 10.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Involtini Primavera', 'Involtini fritti con verdure', 'Antipasti', 7.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Anatra Laccata', 'Anatra alla pechinese', 'Secondi', 22.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Maiale in Agrodolce', 'Maiale con salsa agrodolce', 'Secondi', 15.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Pollo Kung Pao', 'Pollo piccante con arachidi', 'Secondi', 14.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Noodles Saltati', 'Noodles con verdure e carne', 'Primi', 12.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Riso Cantonese', 'Riso saltato con uova e verdure', 'Primi', 9.00, true FROM public.restaurants WHERE name = 'Dragon Palace'
UNION ALL
SELECT id, 'Banana Fritta', 'Banana in pastella con miele', 'Dolci', 6.00, true FROM public.restaurants WHERE name = 'Dragon Palace';

-- Casa del Sol menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Guacamole e Nachos', 'Guacamole fatto al momento con chips', 'Antipasti', 9.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Quesadilla', 'Tortilla con formaggio e jalapeños', 'Antipasti', 10.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Tacos al Pastor', '3 tacos con maiale marinato', 'Secondi', 14.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Fajitas di Pollo', 'Fajitas con pollo e peperoni', 'Secondi', 16.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Burrito Supreme', 'Burrito con carne, fagioli, riso', 'Secondi', 15.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Enchiladas', 'Tortillas ripiene con salsa piccante', 'Secondi', 14.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Churros', 'Churros con cioccolato caldo', 'Dolci', 7.00, true FROM public.restaurants WHERE name = 'Casa del Sol'
UNION ALL
SELECT id, 'Tres Leches', 'Torta ai tre latti', 'Dolci', 8.00, true FROM public.restaurants WHERE name = 'Casa del Sol';

-- Thai Orchid menu
INSERT INTO public.menus (restaurant_id, name, description, category, price, is_available)
SELECT id, 'Tom Yum Kung', 'Zuppa piccante con gamberi', 'Zuppe', 10.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Satay di Pollo', 'Spiedini di pollo con salsa arachidi', 'Antipasti', 9.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Pad Thai', 'Noodles saltati con gamberi e arachidi', 'Primi', 13.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Green Curry', 'Curry verde con pollo e verdure', 'Secondi', 14.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Red Curry', 'Curry rosso con manzo', 'Secondi', 15.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Som Tam', 'Insalata di papaya verde piccante', 'Insalate', 9.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Mango Sticky Rice', 'Riso dolce con mango', 'Dolci', 8.00, true FROM public.restaurants WHERE name = 'Thai Orchid'
UNION ALL
SELECT id, 'Thai Tea Ice Cream', 'Gelato al tè thailandese', 'Dolci', 6.00, true FROM public.restaurants WHERE name = 'Thai Orchid';