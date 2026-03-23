import Layout from "@/components/layout/Layout";
import Hero from "@/components/sections/Hero";
import Mission from "@/components/sections/Mission";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Location from "@/components/sections/Location";
import CallToAction from "@/components/sections/CallToAction";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Mission />
      <Services />
      <Testimonials />
      <Location />
      <CallToAction />
    </Layout>
  );
}
