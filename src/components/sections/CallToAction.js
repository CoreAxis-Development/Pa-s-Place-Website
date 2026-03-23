import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

export default function CallToAction() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <motion.div
        className="section-container text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider">
          Get Involved
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">
          Ready to Make a Difference?
        </h2>
        <p className="text-lg text-gray-600 mb-10">
          Whether you want to book a stay, hire our venue, or volunteer your
          time — we&apos;d love to hear from you. Every contribution helps us
          create a brighter future for our youth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-primary text-lg px-8 py-4">
            Contact Us
          </Link>
          <Link href="/about" className="btn-outline text-lg px-8 py-4">
            Learn More
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
