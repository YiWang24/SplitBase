"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SplitBillDetail from "@/app/components/ui/split-bill-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SplitBillPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.billId as string;
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSuccess = (text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (text: string) => {
    setMessage({ type: "error", text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="ghost" size="sm" onClick={handleGoHome}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert
          className={`mb-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start">
            {message.type === "success" ? (
              <Check className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-red-600" />
            )}
            <AlertDescription
              className={`text-sm ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <SplitBillDetail
        billId={billId}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
