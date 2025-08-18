"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Copy,
  Share,
  QrCode,
  Check,
  X,
  Users,
  DollarSign,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  billTitle: string;
  amount: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  billTitle,
  amount,
}: ShareModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate QR code
  useEffect(() => {
    if (isOpen && shareUrl) {
      generateQRCode();
    }
  }, [isOpen, shareUrl]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // Share to social media (simulate)
  const handleShare = async () => {
    const shareText = `💰 ${billTitle}\nEach pays: ${amount} USDC\nJoin the split!\n\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SplitBase - ${billTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#fefce8] to-[#fef3c7] border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center text-neutral-900 tracking-wide">
            SHARE SPLIT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Split Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#c9e265]/20 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
            <CardHeader className="text-center pb-4 pt-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <DollarSign className="h-8 w-8 text-neutral-900" />
              </div>
              <CardTitle className="text-xl font-black text-neutral-900 tracking-wide">
                {billTitle}
              </CardTitle>
              <CardDescription className="text-base font-medium text-neutral-600 mt-2">
                Each pays:{" "}
                <Badge className="bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold text-sm px-3 py-1 border-0 shadow-md">
                  {amount} USDC
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* QR Code */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#89d957]/20 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
            <CardHeader className="text-center pb-4 pt-6">
              <CardTitle className="flex items-center justify-center gap-3 text-lg font-bold text-neutral-900">
                <div className="w-8 h-8 bg-gradient-to-br from-[#89d957] to-[#6bbf3a] rounded-lg flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-white" />
                </div>
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <div className="bg-white p-6 rounded-2xl border-2 border-[#89d957]/20 shadow-lg">
                {isGenerating ? (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#89d957]/20 border-t-[#89d957]"></div>
                  </div>
                ) : qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Split QR Code"
                    className="w-[200px] h-[200px] rounded-xl shadow-md"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-neutral-500 bg-neutral-100 rounded-xl">
                    QR code generation failed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-center text-neutral-600 font-medium bg-white/60 px-4 py-2 rounded-xl backdrop-blur-sm">
            Scan QR code or share link to invite friends
          </p>

          <Separator className="bg-gradient-to-r from-transparent via-[#c9e265]/30 to-transparent" />

          {/* Share Link */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className={`h-12 px-4 border-2 transition-all duration-300 rounded-xl ${
                  copySuccess
                    ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-[#c9e265]/30 text-[#c9e265] hover:bg-[#c9e265]/10 hover:border-[#c9e265]"
                }`}
              >
                {copySuccess ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="default"
                size="lg"
                onClick={handleShare}
                className="h-14 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0"
              >
                <Share className="mr-2 h-5 w-5" />
                Share
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLink}
                className="h-14 border-2 border-[#89d957]/30 text-[#89d957] font-bold hover:bg-[#89d957]/10 hover:border-[#89d957] hover:scale-105 transition-all duration-300"
              >
                <Copy className="mr-2 h-5 w-5" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-gradient-to-r from-[#c9e265]/10 to-[#89d957]/10 border-2 border-[#c9e265]/20 shadow-lg overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Users className="h-6 w-6 text-neutral-900" />
                </div>
                <p className="font-bold text-neutral-900 mb-4 text-lg">
                  Sharing Tips:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <Wallet className="h-4 w-4 text-[#89d957]" />
                    <span className="text-sm text-neutral-700 font-medium">
                      Friends need to connect Base wallet
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <DollarSign className="h-4 w-4 text-[#c9e265]" />
                    <span className="text-sm text-neutral-700 font-medium">
                      Payment completed with USDC
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <Zap className="h-4 w-4 text-[#6bbf3a]" />
                    <span className="text-sm text-neutral-700 font-medium">
                      Status updates automatically after payment
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-gradient-to-r from-transparent via-[#c9e265]/30 to-transparent" />

          {/* Close Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full h-14 border-2 border-[#c9e265]/30 text-[#c9e265] font-bold hover:bg-[#c9e265]/10 hover:border-[#c9e265] hover:scale-105 transition-all duration-300 shadow-md"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
