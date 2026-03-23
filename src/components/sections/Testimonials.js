import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    quote:
      "Pa's Place changed our children's lives. The care, the activities, the environment — everything is designed to help kids grow and thrive.",
    author: "Parent",
    role: "Community Member",
  },
  {
    quote:
      "A truly safe and enriching space. My kids came home excited, confident, and already asking when they could go back.",
    author: "Guardian",
    role: "Returning Family",
  },
  {
    quote:
      "The dedication of the team at Pa's Place is incredible. They go above and beyond to create a nurturing environment for every child.",
    author: "Volunteer",
    role: "Community Supporter",
  },
];

export default function Testimonials() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-emerald-900 text-white">
      <div className="section-container">
        <span className="block text-emerald-300 font-semibold text-sm uppercase tracking-wider text-center">
          Testimonials
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mt-3 mb-4">
          What People Say
        </h2>
        <p className="text-emerald-200/70 text-center max-w-2xl mx-auto mb-12">
          Hear from families and volunteers who have experienced Pa&apos;s Place
          firsthand.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <svg
                className="w-8 h-8 text-emerald-400/50 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white/90 text-sm leading-relaxed mb-6">
                {t.quote}
              </p>
              <footer>
                <div className="text-white font-semibold text-sm">
                  {t.author}
                </div>
                <div className="text-emerald-300/60 text-xs">{t.role}</div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
