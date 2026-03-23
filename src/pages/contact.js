import Image from "next/image";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";
import Layout from "@/components/layout/Layout";
import { CONTACT } from "@/constants/site";
import { useInView } from "@/hooks/useInView";

function ContactHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero/heroBG.png"
          alt="Contact Pa's Place"
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
            Reach Out
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mt-3 mb-4">
            Get in Touch
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            We&apos;d love to hear from you. Whether you have questions about our
            services, want to volunteer, or need to book — reach out anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ContactInfo() {
  const [ref, inView] = useInView();

  const contactMethods = [
    {
      icon: FiMail,
      title: "Email Us",
      detail: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      desc: "We aim to respond within 24 hours",
    },
    {
      icon: FiPhone,
      title: "Call Us",
      detail: `${CONTACT.person}: ${CONTACT.phone}`,
      href: `tel:${CONTACT.phoneLink}`,
      desc: "Available during business hours",
    },
    {
      icon: FiMapPin,
      title: "Visit Us",
      detail: CONTACT.address.full,
      href: CONTACT.mapUrl,
      desc: "Walk-ins welcome by appointment",
      external: true,
    },
    {
      icon: FiClock,
      title: "Hours",
      detail: "Mon - Sun: 8:00 AM - 6:00 PM",
      desc: "24/7 for overnight guests",
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, i) => {
            const Icon = method.icon;
            const Wrapper = method.href ? "a" : "div";
            const wrapperProps = method.href
              ? {
                  href: method.href,
                  ...(method.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {}),
                }
              : {};

            return (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Wrapper
                  {...wrapperProps}
                  className="card p-6 text-center h-full block hover:border-emerald-200 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {method.title}
                  </h3>
                  <p className="text-emerald-700 text-sm font-medium mb-1">
                    {method.detail}
                  </p>
                  <p className="text-gray-500 text-xs">{method.desc}</p>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="section-container">
        <span className="block text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
          Our Location
        </span>
        <h2 className="section-heading mt-3">Find Us</h2>
        <p className="section-subheading">
          We&apos;re located in the beautiful coastal area of Kelso, Pennington.
        </p>

        <motion.div
          className="card overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3462.5!2d30.696!3d-30.377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDIyJzM3LjUiUyAzMMKwNDEnNDUuOCJF!5e0!3m2!1sen!2sza!4v1"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pa's Place Location"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default function Contact() {
  return (
    <Layout title="Contact" description="Get in touch with Pa's Place. Email, call, or visit us in Pennington, KZN.">
      <ContactHero />
      <ContactInfo />
      <MapSection />
    </Layout>
  );
}
