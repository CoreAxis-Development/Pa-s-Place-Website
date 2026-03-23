import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

export default function Mission() {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">
            Empowering Youth Through Community
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Pa&apos;s Place is dedicated to creating a safe haven where young people
            can thrive. Nestled in the serene coastal town of Pennington,
            KwaZulu-Natal, we offer a nurturing environment that combines
            outdoor adventure, life skills development, and community support to
            help disadvantaged youth reach their full potential.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[
            {
              stat: "22",
              label: "Youth Capacity",
              desc: "Beds available for overnight stays",
            },
            {
              stat: "24/7",
              label: "Security",
              desc: "CCTV surveillance & dedicated staff",
            },
            {
              stat: "10+",
              label: "Activities",
              desc: "From surfing to boxing & nature walks",
            },
          ].map((item) => (
            <div key={item.label} className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {item.stat}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {item.label}
              </div>
              <div className="text-sm text-gray-500">{item.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
