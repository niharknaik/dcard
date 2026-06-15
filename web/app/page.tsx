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
import {getLandingContent} from '@/lib/landing';

export default async function HomePage() {
  const content = await getLandingContent();
  return (
    <>
      <Navbar />
      <main>
        <Hero hero={content.hero} />
        <TrustedBy logos={content.trusted_by} />
        <Stats stats={content.stats} />
        <Features features={content.features} />
        <HowItWorks steps={content.steps} />
        <Testimonials testimonials={content.testimonials} />
        <Pricing plans={content.pricing} />
        <Faq faqs={content.faqs} />
        <CtaBand cta={content.cta} />
      </main>
      <Footer />
    </>
  );
}
