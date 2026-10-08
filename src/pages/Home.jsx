import Hero from '../components/home/Hero';
import Statement from '../components/home/Statement';
import CollectionGallery from '../components/home/CollectionGallery';
import StoryPinned from '../components/home/StoryPinned';
import ProductRail from '../components/home/ProductRail';
import Craft from '../components/home/Craft';
import { EditorialQuote, FeaturedGrid, JournalTeaser, NewsletterBand } from '../components/home/Lower';

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <CollectionGallery />
      <StoryPinned />
      <ProductRail />
      <Craft />
      <EditorialQuote />
      <FeaturedGrid />
      <JournalTeaser />
      <NewsletterBand />
    </>
  );
}
