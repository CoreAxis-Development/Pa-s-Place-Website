import { motion } from "framer-motion";
import { Shield, Home, Coffee, Sun, Moon, Users, Banknote } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ServicePageHero from "@/components/sections/ServicePageHero";
import CallToAction from "@/components/sections/CallToAction";
import { PRICING } from "@/constants/site";
import { useInView } from "@/hooks/useInView";

const features = [
  {
    icon: Shield,
    title: "Security & Privacy",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      "24/7 CCTV surveillance",
      "Gender-segregated dormitories",
      "Private bathroom facilities",
      "Secure access control",
    ],
  },
  {
    icon: Home,
    title: "Comfort & Amenities",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    items: [
      "Quality bedding and linens",
      "Climate-controlled rooms",
      "Common living spaces",
      "Storage facilities",
    ],
  },
  {
    icon: Coffee,
    title: "Daily Essentials",
    color: "text-amber-600",
    bg: "bg-amber-50",
    items: [
      "Fresh towels and toiletries",
      "Cleaning service",
      "Laundry facilities",
      "First aid supplies",
    ],
  },
];

const schedule = [
  {
    icon: Sun,
    title: "Morning",
    color: "text-amber-500",
    items: [
      "6:00 AM — Early morning beach access",
      "7:00 AM — Breakfast time",
      "8:00 AM — Room cleaning service",
      "9:00 AM — Activities begin",
    ],
  },
  {
    icon: Moon,
    title: "Evening",
    color: "text-blue-500",
    items: [
      "6:00 PM — Dinner time",
      "7:00 PM — Evening activities",
      "9:00 PM — Quiet hours begin",
      "10:00 PM — Facility secure time",
    ],
  },
];

function Features() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          What&apos;s Included
        </span>
        <h2 className="section-heading mt-3">Accommodation Features</h2>
        <p className="section-subheading">
          Everything you need for a comfortable, secure stay.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="card p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <ul className="space-y-3">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
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

function PricingSection() {
  const [ref, inView] = useInView();
  const p = PRICING.accommodation;

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <h2 className="section-heading">Pricing</h2>
        <motion.div
          className="max-w-md mx-auto mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="card p-8 text-center bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Banknote className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Accommodation</h3>
            <div className="text-5xl font-bold mb-1">
              {p.currency}{p.rate}
              <span className="text-lg font-normal text-white/70">/{p.unit}</span>
            </div>
            <p className="text-white/60 text-sm mb-6">
              Minimum {p.minimum} people ({p.currency}{p.minimumTotal})
            </p>
            <ul className="text-sm space-y-2 text-white/80">
              <li>Comfortable bedding</li>
              <li>Modern facilities</li>
              <li>Secure premises</li>
              <li>Access to all activities</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Schedule() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <h2 className="section-heading">Daily Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {schedule.map((block, i) => {
            const Icon = block.icon;
            return (
              <motion.div
                key={block.title}
                className="card p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Icon className={`w-6 h-6 ${block.color}`} />
                  <h3 className="text-xl font-bold text-gray-900">{block.title}</h3>
                </div>
                <ul className="space-y-3">
                  {block.items.map((item) => (
                    <li key={item} className="text-gray-600 text-sm">{item}</li>
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

function WhatToExpect() {
  const [ref, inView] = useInView();

  const items = [
    { icon: Users, title: "Community Living", desc: "Experience shared spaces while maintaining personal privacy." },
    { icon: Shield, title: "Safety First", desc: "24/7 security measures ensure peace of mind." },
    { icon: Home, title: "Home Comfort", desc: "All the amenities you need for a comfortable stay." },
  ];

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <h2 className="section-heading">What to Expect</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className="text-center p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Accommodation() {
  return (
    <Layout title="Accommodation" description="Comfortable, secure accommodation at Pa's Place — R200/person/night with modern facilities and 24/7 security.">
      <ServicePageHero
        title="Rest & Recharge"
        subtitle="Experience comfort, security, and tranquility in our thoughtfully designed accommodations."
        image="/hero/heroBG.png"
      />
      <Features />
      <PricingSection />
      <Schedule />
      <WhatToExpect />
      <CallToAction />
    </Layout>
  );
}
