import Layout from "@/components/layout/Layout";
import Services from "@/components/sections/Services";
import CallToAction from "@/components/sections/CallToAction";
import ServicePageHero from "@/components/sections/ServicePageHero";

export default function ServicesPage() {
  return (
    <Layout title="Services" description="Explore our services — activities, accommodation, and venue hire at Pa's Place, Pennington.">
      <ServicePageHero
        title="Our Services"
        subtitle="Activities, accommodation, and venue hire — everything you need for an unforgettable experience."
        image="/hero/heroBG.png"
      />
      <Services />
      <CallToAction />
    </Layout>
  );
}
