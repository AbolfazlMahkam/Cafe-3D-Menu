import { CartDrawer } from "@/components/site/CartDrawer";
import { Footer } from "@/components/site/Footer";
import { Menu } from "@/components/site/Menu";
import { Nav } from "@/components/site/Nav";
import { ScrollDirector } from "@/components/site/ScrollDirector";
import { Signature } from "@/components/site/Signature";
import { Story } from "@/components/site/Story";
import { LoadingCurtain } from "@/components/three/LoadingCurtain";
import { SceneCanvas } from "@/components/three/SceneCanvas";

export default function Home() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(120%_80%_at_50%_-10%,#241a13_0%,#0b0b0b_55%,#080808_100%)]"
      />
      <SceneCanvas />
      <Nav />
      <ScrollDirector />
      <main>
        <Story />
        <Signature />
        <Menu />
      </main>
      <Footer />
      <CartDrawer />
      <LoadingCurtain />
    </>
  );
}
