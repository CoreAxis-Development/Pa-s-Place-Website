import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Heart, Users, Eye } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useInView } from "@/hooks/useInView";
import Location from "@/components/sections/Location";
import CallToAction from "@/components/sections/CallToAction";

function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero/heroBG.png"
          alt="About Pa's Place"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
      </div>
      <div className="relative z-10 section-container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wider">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mt-3 mb-4">
            Our Story
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            A youth haven built on love, safety, and opportunity in the heart of
            Pennington, KwaZulu-Natal.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              Our Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">
              Creating a Safe Haven for Youth
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Pa&apos;s Place was founded with a simple but powerful vision: to
              provide disadvantaged youth with a safe, nurturing environment
              where they can grow, learn, and discover their potential.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Located in the tranquil coastal setting of Kelso, Pennington, our
              facility offers a unique blend of outdoor adventure, structured
              activities, and community support. Every child who walks through
              our doors is treated with dignity, care, and respect.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From surfing lessons to boxing training, from nature walks to
              community building — we believe that every experience shapes a
              young person&apos;s future. And we&apos;re committed to making
              those experiences positive, enriching, and life-changing.
            </p>
          </motion.div>

          <motion.div
            className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Image
              src="/missionStatement/bg.png"
              alt="Pa's Place Mission"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const [ref, inView] = useInView();

  const values = [
    {
      icon: Shield,
      title: "Safety & Security",
      desc: "24/7 CCTV surveillance, Gladiator Security partnership, and Community Watch support ensure every child is protected.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Heart,
      title: "Comfort & Care",
      desc: "Comfortable dormitories, modern facilities, and a home-like environment where children feel welcomed and valued.",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: Users,
      title: "Community",
      desc: "We bring people together — youth, families, volunteers, and supporters — to create a stronger, more connected community.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Eye,
      title: "Growth & Opportunity",
      desc: "Every activity, every interaction is designed to help young people build confidence, skills, and a vision for their future.",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          What Drives Us
        </span>
        <h2 className="section-heading mt-3">Our Values</h2>
        <p className="section-subheading">
          Everything we do is guided by our commitment to these core principles.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                className="card p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {v.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <Layout title="About Us" description="Learn about Pa's Place — a youth haven in Pennington, KZN providing safety, enrichment, and community support.">
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <Location />
      <CallToAction />
    </Layout>
  );
}
