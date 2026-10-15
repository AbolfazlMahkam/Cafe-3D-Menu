import { notFound } from "next/navigation";
import { CupGlbLab } from "@/components/three/CupGlbLab";

export const metadata = {
  title: "Cup GLB Lab",
  robots: { index: false, follow: false },
};

/**
 * Development-only sandbox for verifying /models/Cup_NOIR.glb before it is ever
 * considered for the production cup. In a production build the route 404s, so
 * it cannot ship as part of the live experience.
 */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CupGlbLab />;
}
