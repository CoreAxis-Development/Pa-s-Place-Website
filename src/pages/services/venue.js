import { motion } from "framer-motion";
import { Calendar, Users, Heart, MapPin, Phone, Banknote, Home } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ServicePageHero from "@/components/sections/ServicePageHero";
import CallToAction from "@/components/sections/CallToAction";
import { PRICING, CONTACT } from "@/constants/site";
import { useInView } from "@/hooks/useInView";

const venueFeatures = [
  {
    icon: Calendar,
    title: "Perfect for Parties",
    desc: "From magical children's birthday parties to family gatherings, our venue adapts to your needs.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Users,
    title: "Safe & Secure",
    desc: "State-of-the-art security systems and dedicated staff ensure peace of mind.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Heart,
    title: "All-Inclusive",
    desc: "Access to entertainment facilities including trampoline and putt-putt course.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
];

const entertainment = {
  kids: [
    "Trampoline for endless bouncy fun",
    "Mini putt-putt course adventures",
    "Safe, enclosed play areas",
    "Nature observation opportunities",
  ],
  additional: [
    "Walking distance to Nkomba Beach",
    "Beautiful garden spaces",
    "Ample parking space",
    "Modern restroom facilities",
  ],
};

function VenueFeatures() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          Why Choose Us
        </span>
        <h2 className="section-heading mt-3">A Venue for Every Celebration</h2>
        <p className="section-subheading">
          Nestled in the heart of Kelso, Pennington, Pa&apos;s Place offers a
          unique blend of rustic charm and modern amenities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {venueFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className={`card p-8 border ${f.border}`}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VenuePricing() {
  const [ref, inView] = useInView();
  const venue = PRICING.venue;
  const accom = PRICING.accommodation;

  const plans = [
    {
      title: "Event Hire",
      icon: Calendar,
      price: `${venue.currency}${venue.rate}`,
      unit: venue.unit,
      details: [
        `Minimum ${venue.minimum} people (${venue.currency}${venue.minimumTotal})`,
        `${venue.currency}${venue.deposit} deposit required`,
        "Full venue access",
        "Access to entertainment facilities",
      ],
      gradient: "from-purple-600 to-purple-800",
    },
    {
      title: "Accommodation",
      icon: Home,
      price: `${accom.currency}${accom.rate}`,
      unit: accom.unit,
      details: [
        `Minimum ${accom.minimum} people (${accom.currency}${accom.minimumTotal})`,
        "Comfortable bedding",
        "Modern facilities",
        "Secure premises",
      ],
      gradient: "from-emerald-600 to-teal-700",
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <h2 className="section-heading">Our Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-3xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.title}
                className={`card p-8 text-center bg-gradient-to-br ${plan.gradient} border-0 text-white`}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                <div className="text-5xl font-bold mb-1">
                  {plan.price}
                  <span className="text-lg font-normal text-white/70">/{plan.unit}</span>
                </div>
                <ul className="text-sm space-y-2 text-white/80 mt-6">
                  {plan.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Entertainment() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <h2 className="section-heading">Entertainment for All Ages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <motion.div
            className="card p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-blue-700 mb-4">For the Little Ones</h3>
            <ul className="space-y-3">
              {entertainment.kids.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="card p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-emerald-700 mb-4">Additional Features</h3>
            <ul className="space-y-3">
              {entertainment.additional.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BookingContact() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <motion.div
        className="section-container text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-heading">Book Your Celebration</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span className="text-gray-700">{CONTACT.address.full}</span>
          </div>
          <a href={`tel:${CONTACT.phoneLink}`} className="flex items-center gap-3 text-emerald-700 hover:text-emerald-800 transition-colors">
            <Phone className="w-5 h-5" />
            <span>{CONTACT.person}: {CONTACT.phone}</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export default function Venue() {
  return (
    <Layout title="Venue Hire" description="Host your special celebration at Pa's Place — R80/person with full venue access, entertainment facilities, and more.">
      <ServicePageHero
        title="Host Your Celebration"
        subtitle="Where memories are made and hearts are warmed."
        image="/hero/heroBG.png"
      />
      <VenueFeatures />
      <VenuePricing />
      <Entertainment />
      <BookingContact />
      <CallToAction />
    </Layout>
  );
}
