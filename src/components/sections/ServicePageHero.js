import Image from "next/image";
import { motion } from "framer-motion";

export default function ServicePageHero({ title, subtitle, image }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0">
        <Image src={image} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
      </div>
      <div className="relative z-10 section-container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
}
