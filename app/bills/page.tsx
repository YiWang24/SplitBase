import { Suspense } from "react";
import BillsContent from "./BillsContent";

export default function BillsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading bills...</p>
          </div>
        </div>
      }
    >
      <BillsContent />
    </Suspense>
  );
}
