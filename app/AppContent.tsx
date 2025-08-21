"use client";

import { useRouter } from "next/navigation";
import { Plus, Wallet, Check, Users, Zap, TrendingUp } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Magic UI Components
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { TypingAnimation } from "@/components/magicui/typing-animation";

export default function AppContent() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md md:max-w-none mx-auto px-4 py-2  overflow-x-hidden">
      {/* Hero Section */}
      <div className="space-y-6 md:space-y-0">
        {/* Main Hero */}
        <div className="text-center space-y-4 md:space-y-8 md:py-16 md:bg-gradient-to-br md:from-neutral-50/50 md:to-neutral-100/50 md:rounded-none md:mx-0 md:px-8">
          {/* App Logo and Title */}
          <div className="mx-auto w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-8 shadow-brand-lg">
            <Wallet className="h-10 w-10 md:h-16 md:w-16 text-neutral-900" />
          </div>

          <AnimatedGradientText
            className="text-3xl md:text-6xl font-black tracking-tight"
            speed={2}
            colorFrom="#a8c44a"
            colorTo="#6ba83a"
          >
            SPLITBASE
          </AnimatedGradientText>

          <div className="text-lg md:text-2xl text-neutral-600 font-medium">
            The{" "}
            <AuroraText
              className="font-bold"
              colors={["#a8c44a", "#6ba83a", "#4a7a3a", "#8ba63a"]}
            >
              Future
            </AuroraText>{" "}
            of{" "}
            <TypingAnimation className="text-lg md:text-2xl font-bold text-neutral-600">
              Bill Splitting
            </TypingAnimation>
          </div>

          {/* Subtitle */}
          <div className="text-sm md:text-lg font-bold text-white bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent px-4 py-2 md:px-6 md:py-3 rounded-full inline-block border-2 border-white/30 shadow-brand-lg backdrop-blur-sm">
            ⚡ &lt;2s Settlement • Base Network • USDC
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 md:py-8 md:bg-white/80 md:mx-0 md:px-8">
          <span className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-neutral-900 text-xs md:text-sm font-bold rounded-full shadow-brand">
            INSTANT
          </span>
          <span className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-brand-accent to-brand-secondary text-neutral-900 text-xs md:text-sm font-bold rounded-full shadow-brand">
            SECURE
          </span>
          <span className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-brand-primary to-brand-accent text-neutral-900 text-xs md:text-sm font-bold rounded-full shadow-brand">
            TRANSPARENT
          </span>
        </div>

        {/* Main CTA Button */}
        <div className="relative w-full md:py-8 md:bg-gradient-to-br md:from-neutral-50/50 md:to-neutral-100/50 md:mx-0 md:px-8">
          <div className="md:max-w-2xl md:mx-auto">
            <button
              onClick={() => router.push("/create")}
              className="w-full h-20 md:h-24 px-8 py-4 md:px-12 md:py-6 text-xl md:text-2xl font-black tracking-widest shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 active:scale-95 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-[#a8c44a]/60 hover:border-[#a8c44a] bg-gradient-to-r from-[#a8c44a] via-[#6ba83a] to-[#4a7a3a] relative group animate-pulse"
            >
              {/* Rainbow border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#a8c44a] via-[#6ba83a] to-[#4a7a3a] to-[#8ba63a] to-[#b8d14a] animate-rainbow rounded-2xl md:rounded-3xl"></div>

              {/* Button content */}
              <div className="relative z-10 flex items-center justify-center gap-4 md:gap-6">
                <div className="relative group">
                  <Plus className="h-7 w-7 md:h-9 md:w-9 transition-transform duration-300 group-hover:rotate-90 drop-shadow-lg text-neutral-900" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#a8c44a]/60 to-[#6ba83a]/60 rounded-full blur-md animate-pulse opacity-100"></div>
                </div>
                <span className="font-black text-xl md:text-2xl tracking-widest drop-shadow-lg text-neutral-900 leading-tight">
                  CREATE NEW SPLIT
                </span>
              </div>

              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl md:rounded-3xl"></div>

              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 border-[#a8c44a]/30 animate-ping opacity-75"></div>
            </button>

            {/* Roadmap Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/roadmap")}
                className="group inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-brand-primary/80 to-brand-secondary/80 hover:from-brand-primary hover:to-brand-secondary border border-brand-primary/40 hover:border-brand-primary/60 rounded-full text-sm font-bold text-white hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <TrendingUp className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>View Product Roadmap</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Features Section - Web Layout */}
        <div className="hidden md:block w-full bg-gradient-to-br from-neutral-50/80 to-neutral-100/80 py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center">
              <div className="max-w-2xl mx-auto">
                <NeonGradientCard>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-2xl text-neutral-800">
                      <Zap className="mr-3 h-7 w-7 text-brand-accent" />
                      Why Choose{" "}
                      <AuroraText
                        className="text-neutral-800"
                        colors={["#1F2937", "#4a5a3a", "#6a7a4a", "#1F2937"]}
                      >
                        SplitBase
                      </AuroraText>
                      ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-center space-x-4 p-4 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
                      <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center">
                        <Check className="h-6 w-6 text-brand-primary" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-neutral-800">
                          Instant Settlement
                        </div>
                        <div className="text-base text-neutral-600">
                          Pay with USDC
                          <br />
                          on Base network
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 p-4 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
                      <div className="w-12 h-12 bg-brand-secondary/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-brand-secondary" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-neutral-800">
                          Group Management
                        </div>
                        <div className="text-base text-neutral-600">
                          Easy bill splitting
                          <br />
                          with friends
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 p-4 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
                      <div className="w-12 h-12 bg-brand-accent/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-brand-accent" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-neutral-800">
                          Transparent Tracking
                        </div>
                        <div className="text-base text-neutral-600">
                          Real-time payment
                          <br />
                          status
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </NeonGradientCard>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Mobile Layout */}
        <div className="md:hidden">
          <NeonGradientCard>
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-neutral-800">
                <Zap className="mr-3 h-5 w-5 text-brand-accent" />
                Why Choose{" "}
                <AuroraText
                  className="text-neutral-800"
                  colors={["#1F2937", "#4a5a3a", "#6a7a4a", "#1F2937"]}
                >
                  SplitBase
                </AuroraText>
                ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
                <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-brand-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-800">
                    Instant Settlement
                  </div>
                  <div className="text-xs text-neutral-600">
                    Pay with USDC on Base network
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
                <div className="w-8 h-8 bg-brand-secondary/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-brand-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-800">
                    Group Management
                  </div>
                  <div className="text-xs text-neutral-600">
                    Easy bill splitting with friends
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
                <div className="w-8 h-8 bg-brand-accent/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-brand-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-800">
                    Transparent Tracking
                  </div>
                  <div className="text-xs text-neutral-600">
                    Real-time payment status
                  </div>
                </div>
              </div>
            </CardContent>
          </NeonGradientCard>
        </div>
      </div>
    </div>
  );
}
