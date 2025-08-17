"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CreateSplitForm from "../components/ui/create-split-form";

export default function CreatePage() {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle message display
  const handleSuccess = (text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (text: string) => {
    setMessage({ type: "error", text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle split creation success
  const handleSplitCreated = (billId: string) => {
    handleSuccess("Split created successfully!");
    setTimeout(() => {
      router.push(`/split/${billId}`);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold mb-2">Create New Split</h1>
        <p className="text-muted-foreground">
          Create a new bill split and invite your friends
        </p>
      </div>

      {/* Create Split Form */}
      <div className="space-y-6">
        <CreateSplitForm onSuccess={handleSplitCreated} onError={handleError} />
      </div>
    </div>
  );
}
