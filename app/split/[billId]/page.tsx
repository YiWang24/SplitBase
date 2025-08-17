"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SplitBillDetail from "@/app/components/SplitBillDetail";
import { Button } from "@/app/components/DemoComponents";
import { Icon } from "@/app/components/DemoComponents";

export default function SplitBillPage() {
  const params = useParams();
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
    window.location.href = "/";
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        {/* Navigation Bar */}
        <header className="flex justify-between items-center mb-4 h-11">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
              icon={
                <Icon name="arrow-right" size="sm" className="rotate-180" />
              }
            >
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Icon
                name="wallet"
                className="text-[var(--app-accent)] text-base"
              />
              <span className="text-xs font-bold text-[var(--app-foreground)]">
                SplitBase
              </span>
            </div>
          </div>
          {/* Center - Page Title */}
          <h1 className="text-sm font-semibold text-[var(--app-foreground)]">
            Split Details
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </header>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start">
              <Icon
                name={message.type === "success" ? "check" : "star"}
                size="sm"
                className={`mt-0.5 mr-2 ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              />
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* 主要内容 */}
        <main className="flex-1">
          <SplitBillDetail
            billId={billId}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </main>

        {/* 页脚 */}
        <footer className="mt-6 pt-4 text-center">
          <p className="text-xs text-[var(--app-foreground-muted)]">
            Powered by Base Pay & OnchainKit
          </p>
        </footer>
      </div>
    </div>
  );
}
