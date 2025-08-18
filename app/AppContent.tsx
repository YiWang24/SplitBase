"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Wallet,
  Check,
  Users,
  DollarSign,
  Zap,
  TrendingUp,
  Star,
  Receipt,
  Clock,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Magic UI Components
import { Particles } from "@/components/magicui/particles";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AuroraText } from "@/components/magicui/aurora-text";
import { TypingAnimation } from "@/components/magicui/typing-animation";

export default function AppContent() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 pb-4 overflow-x-hidden">
      {/* Hero Section */}
      <div className="space-y-6">
        {/* Main Hero */}
        <div className="text-center space-y-4">
          {/* App Logo and Title */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mb-4 shadow-brand-lg">
            <Wallet className="h-10 w-10 text-neutral-900" />
          </div>

          <AnimatedGradientText
            className="text-3xl font-black tracking-tight"
            speed={2}
            colorFrom="#c9e265"
            colorTo="#89d957"
          >
            SPLITBASE
          </AnimatedGradientText>

          <div className="text-lg text-neutral-600 font-medium">
            The{" "}
            <AuroraText
              className="font-bold"
              colors={["#c9e265", "#89d957", "#6bbf3a", "#b8d14a"]}
            >
              Future
            </AuroraText>{" "}
            of{" "}
            <TypingAnimation className="text-lg font-bold text-neutral-600">
              Bill Splitting
            </TypingAnimation>
          </div>

          {/* Subtitle */}
          <div className="text-sm font-semibold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full inline-block border border-brand-primary/20 shadow-brand">
            ⚡ Web3 Powered • Base Network • USDC Settlement
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-neutral-900 text-xs font-bold rounded-full shadow-brand">
            INSTANT
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-brand-accent to-brand-secondary text-neutral-900 text-xs font-bold rounded-full shadow-brand">
            SECURE
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-brand-primary to-brand-accent text-neutral-900 text-xs font-bold rounded-full shadow-brand">
            TRANSPARENT
          </span>
        </div>

        {/* Main CTA Button */}
        <div className="relative w-full">
          <button
            onClick={() => router.push("/create")}
            className="w-full h-16 px-8 py-4 text-xl font-black tracking-widest shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 active:scale-95 rounded-2xl overflow-hidden border-2 border-[#c9e265]/60 hover:border-[#c9e265] bg-gradient-to-r from-[#c9e265] via-[#89d957] to-[#6bbf3a] relative group animate-pulse"
          >
            {/* Rainbow border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#c9e265] via-[#89d957] to-[#6bbf3a] to-[#b8d14a] to-[#d7ea8a] animate-rainbow rounded-2xl"></div>

            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center gap-4">
              <div className="relative group">
                <Plus className="h-7 w-7 transition-transform duration-300 group-hover:rotate-90 drop-shadow-lg text-neutral-900" />
                <div className="absolute -inset-2 bg-gradient-to-r from-[#c9e265]/60 to-[#89d957]/60 rounded-full blur-md animate-pulse opacity-100"></div>
              </div>
              <span className="font-black text-2xl tracking-widest drop-shadow-lg text-neutral-900">
                CREATE NEW SPLIT
              </span>
            </div>

            {/* Enhanced glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>

            {/* Pulse ring effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#c9e265]/30 animate-ping opacity-75"></div>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="relative">
            <Card className="text-center p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-brand">
              <div className="text-2xl font-bold text-brand-primary">
                <AuroraText
                  className="text-brand-primary"
                  colors={["#c9e265", "#d7ea8a", "#b8d14a", "#c9e265"]}
                >
                  150+
                </AuroraText>
              </div>
              <div className="text-xs text-neutral-600">Active Users</div>
            </Card>
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
          <div className="relative">
            <Card className="text-center p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-brand">
              <div className="text-2xl font-bold text-brand-secondary">
                <AuroraText
                  className="text-brand-secondary"
                  colors={["#89d957", "#a0e06a", "#7ac94a", "#89d957"]}
                >
                  $2.5K
                </AuroraText>
              </div>
              <div className="text-xs text-neutral-600">Total Split</div>
            </Card>
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
          <div className="relative">
            <Card className="text-center p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-brand">
              <div className="text-2xl font-bold text-brand-accent">
                <AuroraText
                  className="text-brand-accent"
                  colors={["#6bbf3a", "#8cd45a", "#5a7a4a", "#6bbf3a"]}
                >
                  99.9%
                </AuroraText>
              </div>
              <div className="text-xs text-neutral-600">Success Rate</div>
            </Card>
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>

        {/* Features Section */}
        <NeonGradientCard>
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-neutral-800">
              <Zap className="mr-3 h-5 w-5 text-brand-accent" />
              Why Choose{" "}
              <AuroraText
                className="text-neutral-800"
                colors={["#1F2937", "#5a7a4a", "#7a9563", "#1F2937"]}
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

        {/* Quick Actions */}
        <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-neutral-50/90 to-neutral-100/90 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-800">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push("/bills")}
              variant="outline"
              className="w-full justify-start bg-white/70 hover:bg-white/90 border-brand-primary/20 text-brand-primary hover:text-brand-primary-dark transition-all duration-300 group"
            >
              <Receipt className="mr-3 h-4 w-4" />
              View My Bills
              <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              onClick={() => router.push("/friends")}
              variant="outline"
              className="w-full justify-start bg-white/70 hover:bg-white/90 border-brand-secondary/20 text-brand-secondary hover:text-brand-secondary-dark transition-all duration-300 group"
            >
              <Users className="mr-3 h-4 w-4" />
              Manage Friends
              <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-neutral-50/90 to-neutral-100/90 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-800">
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                Transaction Speed
              </span>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-brand-primary" />
                <span className="text-sm font-medium text-neutral-800">
                  &lt;{" "}
                  <AuroraText
                    className="text-neutral-800"
                    colors={["#1F2937", "#c9e265", "#d7ea8a", "#1F2937"]}
                  >
                    2
                  </AuroraText>{" "}
                  seconds
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Network Fee</span>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-brand-secondary" />
                <span className="text-sm font-medium text-neutral-800">
                  ~
                  <AuroraText
                    className="text-neutral-800"
                    colors={["#1F2937", "#89d957", "#a0e06a", "#1F2937"]}
                  >
                    $0.01
                  </AuroraText>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Uptime</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-brand-accent" />
                <span className="text-sm font-medium text-neutral-800">
                  <AuroraText
                    className="text-neutral-800"
                    colors={["#1F2937", "#6bbf3a", "#8cd45a", "#1F2937"]}
                  >
                    99.9%
                  </AuroraText>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Review */}
        <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-neutral-50/90 to-neutral-100/90 shadow-card">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-brand-accent fill-current"
                />
              ))}
            </div>
            <p className="text-sm text-neutral-700 italic mb-3">
              &ldquo;SplitBase made splitting bills with my roommates so much
              easier. The USDC payments are instant and transparent!&rdquo;
            </p>
            <div className="text-xs text-neutral-600">
              -{" "}
              <AuroraText
                className="text-neutral-600"
                colors={["#4B5563", "#7a9563", "#a3b583", "#4B5563"]}
              >
                Alex
              </AuroraText>{" "}
              from San Francisco
            </div>
          </CardContent>
        </Card>

        {/* Particles Background Effect */}
        <div className="relative h-32 w-full overflow-hidden rounded-lg">
          <Particles
            className="absolute inset-0"
            quantity={100}
            staticity={30}
            color="#c9e265"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-neutral-900">
              <Globe className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Powered by Base Network</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-brand-primary to-brand-secondary text-neutral-900 border-0 shadow-brand-xl">
          <CardContent className="p-6 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-neutral-700" />
            <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
            <p className="text-neutral-700 mb-4">
              Join thousands of users who trust SplitBase for their bill
              splitting needs
            </p>
            <Button
              onClick={() => router.push("/create")}
              variant="secondary"
              size="lg"
              className="bg-white text-neutral-900 hover:bg-neutral-100"
            >
              <AuroraText
                className="text-neutral-900"
                colors={["#1a2b1a", "#5a7a4a", "#7a9563", "#1a2b1a"]}
              >
                Start Splitting Now
              </AuroraText>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
