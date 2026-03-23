import { motion } from "framer-motion";
import { FiMapPin } from "react-icons/fi";
import { CONTACT } from "@/constants/site";
import { useInView } from "@/hooks/useInView";

export default function Location() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          Find Us
        </span>
        <h2 className="section-heading mt-3">Where We Are Based</h2>
        <p className="section-subheading">
          Located in the beautiful coastal town of Pennington, KwaZulu-Natal —
          just a short walk from Nkomba Beach.
        </p>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Map */}
          <div className="card overflow-hidden min-h-[350px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3462.5!2d30.696!3d-30.377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDIyJzM3LjUiUyAzMMKwNDEnNDUuOCJF!5e0!3m2!1sen!2sza!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "350px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pa's Place Location"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <FiMapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Our Address
                  </h3>
                  <p className="text-gray-600">{CONTACT.address.street}</p>
                  <p className="text-gray-600">{CONTACT.address.area}</p>
                  <p className="text-gray-600">{CONTACT.address.province}</p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                About Pennington
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pennington is a tranquil coastal town on the KwaZulu-Natal South
                Coast, known for its pristine beaches, lush subtropical
                vegetation, and warm community. It&apos;s the perfect setting for
                youth to connect with nature, learn new skills, and build lasting
                memories in a safe environment.
              </p>
            </div>

            <a
              href={CONTACT.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center"
            >
              Get Directions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
