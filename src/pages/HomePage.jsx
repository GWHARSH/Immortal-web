import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import UploadsPreview from '../sections/UploadsPreview';
import PackagesPreview from '../sections/PackagesPreview';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <UploadsPreview />
      <PackagesPreview />
    </>
  );
}
