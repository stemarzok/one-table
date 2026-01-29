import { motion } from "framer-motion";
import onetableLogo from "@/assets/onetable-logo.png";

// Restaurant logos from the site - we'll use placeholder brand names since we use the same logo for now
const partnerLogos = [
  { name: "Ristorante Milano", logo: onetableLogo },
  { name: "Trattoria Roma", logo: onetableLogo },
  { name: "Osteria Firenze", logo: onetableLogo },
  { name: "Pizzeria Napoli", logo: onetableLogo },
  { name: "Taverna Venezia", logo: onetableLogo },
  { name: "Locanda Torino", logo: onetableLogo },
  { name: "Bistro Bologna", logo: onetableLogo },
  { name: "Enoteca Verona", logo: onetableLogo },
];

const LogoScroller = () => {
  // Duplicate logos for seamless infinite scroll
  const allLogos = [...partnerLogos, ...partnerLogos];

  return (
    <div className="w-full bg-black/90 backdrop-blur-md py-8 overflow-hidden border-y border-white/10">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-sm font-medium text-white/60 uppercase tracking-widest">
          Oltre 500 ristoranti partner si fidano di OneTable
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient masks for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/90 to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex gap-16 items-center"
          animate={{
            x: [0, -50 * partnerLogos.length * 8],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {allLogos.map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 w-10 object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
              <span className="text-white/70 font-medium text-sm whitespace-nowrap">
                {partner.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LogoScroller;
