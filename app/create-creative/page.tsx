import CreateCreative from "@/src/components/pages/create-creative";
import { Suspense } from "react";

export default function CreateCreativePage() {
  return (
    <Suspense fallback={null}>
      <CreateCreative />
    </Suspense>
  );
}
