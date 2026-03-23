import Link from "next/link";
import { motion } from "framer-motion";
import { Waves, Home, Calendar } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const services = [
  {
    icon: Waves,
    title: "Activities",
    description:
      "From swimming at Nkomba Beach and surfing lessons to boxing, trampoline fun, and nature walks — adventure awaits.",
    href: "/services/activities",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Home,
    title: "Accommodation",
    description:
      "Comfortable, secure overnight stays with modern facilities, gender-segregated dormitories, and 24/7 supervision.",
    href: "/services/accommodation",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Calendar,
    title: "Venue Hire",
    description:
      "Host your celebrations in our unique venue with full access to entertainment facilities, gardens, and more.",
    href: "/services/venue",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function Services() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          What We Offer
        </span>
        <h2 className="section-heading mt-3">Our Services</h2>
        <p className="section-subheading">
          Whether you&apos;re looking for adventure, a place to stay, or the perfect
          venue — we&apos;ve got you covered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Link href={service.href} className="group block card p-8 h-full">
                  <div
                    className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-7 h-7 ${service.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <span className="text-emerald-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
