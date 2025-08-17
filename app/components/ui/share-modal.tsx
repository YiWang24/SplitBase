"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Copy, Share, QrCode, Check } from "lucide-react";
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Split</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Split Information */}
          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base">{billTitle}</CardTitle>
              <CardDescription>
                Each pays:{" "}
                <Badge variant="secondary" className="font-medium">
                  {amount} USDC
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-sm">
                <QrCode className="h-4 w-4" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border">
                {isGenerating ? (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Split QR Code"
                    className="w-[200px] h-[200px]"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-muted-foreground">
                    QR code generation failed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground">
            Scan QR code or share link to invite friends
          </p>

          <Separator />

          {/* Share Link */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly className="flex-1 text-sm" />
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copySuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default" size="sm" onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <div className="text-xs text-foreground">
                  <p className="font-medium mb-2">Sharing Tips:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Friends need to connect Base wallet</li>
                    <li>• Payment completed with USDC</li>
                    <li>• Status updates automatically after payment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
