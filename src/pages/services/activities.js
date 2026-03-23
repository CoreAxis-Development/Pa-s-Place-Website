import { motion } from "framer-motion";
import { Waves, Dumbbell, Sun, Users, Trees, Bike } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ServicePageHero from "@/components/sections/ServicePageHero";
import CallToAction from "@/components/sections/CallToAction";
import { useInView } from "@/hooks/useInView";

const categories = [
  {
    icon: Waves,
    title: "Water Activities",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      "Swimming at Nkomba Beach",
      "Beginner surfing lessons",
      "Beach volleyball",
      "Safe swimming areas for kids",
    ],
  },
  {
    icon: Dumbbell,
    title: "Fitness & Sports",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    items: [
      "Boxing equipment & training",
      "Outdoor fitness area",
      "Guided workout sessions",
      "Team sports",
    ],
  },
  {
    icon: Sun,
    title: "Outdoor Fun",
    color: "text-amber-600",
    bg: "bg-amber-50",
    items: [
      "Adventure slides",
      "Trampoline park",
      "Mini putt-putt course",
      "Playground equipment",
    ],
  },
];

const benefits = [
  {
    icon: Users,
    title: "All Ages Welcome",
    desc: "Activities designed for everyone, from kids to adults.",
  },
  {
    icon: Trees,
    title: "Natural Setting",
    desc: "Beautiful beachside location with stunning coastal views.",
  },
  {
    icon: Bike,
    title: "Active Lifestyle",
    desc: "Promoting health and wellness through varied activities.",
  },
];

function ActivityCategories() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          What We Offer
        </span>
        <h2 className="section-heading mt-3">Activity Categories</h2>
        <p className="section-subheading">
          From beachside adventures to fitness training, there&apos;s something
          for everyone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                className="card p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-6`}
                >
                  <Icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {cat.title}
                </h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-gray-600 text-sm"
                    >
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

function Benefits() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <h2 className="section-heading">Why Choose Our Activities?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                className="text-center p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {b.title}
                </h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Activities() {
  return (
    <Layout title="Activities" description="Explore the wide range of activities at Pa's Place — swimming, surfing, boxing, adventure slides, and more.">
      <ServicePageHero
        title="Adventure & Activities"
        subtitle="From beachside adventures to fitness training, discover a world of activities at Pa's Place."
        image="/hero/heroBG.png"
      />
      <ActivityCategories />
      <Benefits />
      <CallToAction />
    </Layout>
  );
}
