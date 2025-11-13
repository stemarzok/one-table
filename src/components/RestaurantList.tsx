import RestaurantCard from "./RestaurantCard";

const restaurants = [
  {
    name: "La Terrazza del Sole",
    cuisine: "Cucina Italiana Gourmet",
    location: "Centro Storico, Milano",
    rating: 4.8,
    priceRange: "€€€",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    available: true
  },
  {
    name: "Sushi Zen Garden",
    cuisine: "Giapponese Fusion",
    location: "Brera, Milano",
    rating: 4.9,
    priceRange: "€€€€",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800&q=80",
    available: true
  },
  {
    name: "Trattoria del Porto",
    cuisine: "Cucina Mediterranea",
    location: "Navigli, Milano",
    rating: 4.7,
    priceRange: "€€",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    available: false
  },
  {
    name: "Le Jardin Étoilé",
    cuisine: "Cucina Francese",
    location: "Porta Venezia, Milano",
    rating: 4.9,
    priceRange: "€€€€",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    available: true
  },
  {
    name: "Osteria della Luna",
    cuisine: "Cucina Tradizionale",
    location: "Porta Romana, Milano",
    rating: 4.6,
    priceRange: "€€",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",
    available: true
  },
  {
    name: "The Urban Bistrot",
    cuisine: "Cucina Contemporanea",
    location: "Isola, Milano",
    rating: 4.8,
    priceRange: "€€€",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
    available: false
  }
];

const RestaurantList = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ristoranti Partner in Evidenza
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scopri i migliori ristoranti e prenota il tuo tavolo con un click
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant, index) => (
            <RestaurantCard key={index} {...restaurant} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantList;
