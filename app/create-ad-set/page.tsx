import CreateAdSet from "@/src/components/pages/create-ad-set";
import { Suspense } from "react";

export default function CreateAdSetPage() {
  return (
    <Suspense fallback={null}>
      <CreateAdSet />
    </Suspense>
  );
}
