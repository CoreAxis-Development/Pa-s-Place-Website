import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/constants/site";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero/heroBG.png"
          alt="Pa's Place"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt={`${SITE.name} Logo`}
              width={100}
              height={100}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            {SITE.name}
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-4 font-light">
            {SITE.tagline}
          </p>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10">
            Providing a safe, nurturing environment with enriching activities,
            personal growth opportunities, and community support.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link href="/services/activities" className="btn-primary text-lg px-8 py-4">
            Explore Activities
          </Link>
          <Link href="/contact" className="btn-outline text-lg px-8 py-4 border-white/40 text-white hover:bg-white/10">
            Get in Touch
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
