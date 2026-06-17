import {Navbar} from '@/components/Navbar';
import {Hero} from '@/components/Hero';
import {Stats} from '@/components/Stats';
import {Features} from '@/components/Features';
import {HowItWorks} from '@/components/HowItWorks';
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
        <Stats stats={content.stats} />
        <Features features={content.features} />
        <HowItWorks steps={content.steps} />
        <Pricing plans={content.pricing} />
        <Faq faqs={content.faqs} />
        <CtaBand cta={content.cta} />
      </main>
      <Footer />
    </>
  );
}
