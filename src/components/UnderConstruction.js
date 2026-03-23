import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { SITE, CONTACT } from "@/constants/site";

export default function UnderConstruction() {
  return (
    <>
      <Head>
        <title>{SITE.name} — Coming Soon</title>
        <meta name="description" content={SITE.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt={`${SITE.name} Logo`}
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            {SITE.name}
          </h1>
          <p className="text-emerald-300 text-lg mb-2">{SITE.tagline}</p>

          <motion.div
            className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-white/80 text-sm font-medium">
              Website Under Development
            </span>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-left space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-white font-semibold text-lg text-center mb-6">
              Get in Touch
            </h2>

            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center gap-4 text-gray-300 hover:text-emerald-300 transition-colors group"
            >
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <FiMail className="w-4 h-4" />
              </span>
              <span className="text-sm">{CONTACT.email}</span>
            </a>

            <a
              href={`tel:${CONTACT.phoneLink}`}
              className="flex items-center gap-4 text-gray-300 hover:text-emerald-300 transition-colors group"
            >
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <FiPhone className="w-4 h-4" />
              </span>
              <span className="text-sm">
                {CONTACT.person}: {CONTACT.phone}
              </span>
            </a>

            <a
              href={CONTACT.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-gray-300 hover:text-emerald-300 transition-colors group"
            >
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <FiMapPin className="w-4 h-4" />
              </span>
              <span className="text-sm">{CONTACT.address.full}</span>
            </a>
          </motion.div>
        </motion.div>

        <p className="absolute bottom-6 text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </>
  );
}
