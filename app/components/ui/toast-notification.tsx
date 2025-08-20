"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ToastNotificationProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function ToastNotification({
  type,
  message,
  onClose,
}: ToastNotificationProps) {
  return (
    <div className="mb-6">
      <div
        className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-lg ${
          type === "success"
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
            : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800"
        }`}
      >
        <div className="flex items-center space-x-3">
          {type === "success" ? (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          )}
          <span className="text-sm font-bold">{message}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-transparent"
        >
          ×
        </Button>
      </div>
    </div>
  );
}
