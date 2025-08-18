"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReceiptDetail from "@/app/components/ui/receipt-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const billId = params.billId as string;

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="ghost" size="sm" onClick={() => router.push("/bills")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Bills
        </Button>
      </div>
      <ReceiptDetail billId={billId} />
    </div>
  );
}
