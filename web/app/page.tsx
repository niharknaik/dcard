import {Navbar} from '@/components/Navbar';
import {Hero} from '@/components/Hero';
import {TrustedBy} from '@/components/TrustedBy';
import {Stats} from '@/components/Stats';
import {Features} from '@/components/Features';
import {HowItWorks} from '@/components/HowItWorks';
import {Testimonials} from '@/components/Testimonials';
import {Pricing} from '@/components/Pricing';
import {Faq} from '@/components/Faq';
import {CtaBand} from '@/components/CtaBand';
import {Footer} from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
