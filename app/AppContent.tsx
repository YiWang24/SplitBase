"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AppContent() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  // Handle message display
  const handleSuccess = (text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (text: string) => {
    setMessage({ type: "error", text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20">
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
              <Check className={`h-4 w-4 mt-0.5 mr-2 text-green-600`} />
            ) : (
              <Plus className={`h-4 w-4 mt-0.5 mr-2 text-red-600`} />
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

      {/* SplitBase Introduction */}
      <div className="space-y-6 animate-fade-in">
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Wallet className="mr-3 h-5 w-5 text-primary" />
              SplitBase
            </CardTitle>
            <CardDescription>
              Web3 Bill Splitting • Base Pay Settlement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-xl border">
                <Check className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="text-xs font-semibold">INSTANT SPLIT</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-xl border">
                <Wallet className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="text-xs font-semibold">USDC PAYMENT</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/create")}
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              CREATE NEW SPLIT
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
