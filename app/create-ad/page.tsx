import CreateAd from "@/src/components/pages/create-ad";
import { Suspense } from "react";

export default function CreateAdPage() {
  return (
    <Suspense fallback={null}>
      <CreateAd />
    </Suspense>
  );
}
