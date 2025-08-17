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
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Wallet className="h-10 w-10 text-white" />
          </div>

          <AnimatedGradientText
            className="text-3xl font-black tracking-tight"
            speed={2}
            colorFrom="#ff6b6b"
            colorTo="#4ecdc4"
          >
            SPLITBASE
          </AnimatedGradientText>

          <div className="text-lg text-gray-600 font-medium">
            The{" "}
            <AuroraText
              className="font-bold"
              colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]}
            >
              Future
            </AuroraText>{" "}
            of{" "}
            <TypingAnimation className="text-lg font-bold text-gray-600">
              Bill Splitting
            </TypingAnimation>
          </div>

          {/* Subtitle */}
          <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-block border border-blue-200 shadow-sm">
            ⚡ Web3 Powered • Base Network • USDC Settlement
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
            INSTANT
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
            SECURE
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
            TRANSPARENT
          </span>
        </div>

        {/* Main CTA Button */}
        <Button
          onClick={() => router.push("/create")}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          <AuroraText
            className="text-white"
            colors={["#FFFFFF", "#F0F9FF", "#E0F2FE", "#FFFFFF"]}
          >
            CREATE NEW SPLIT
          </AuroraText>
        </Button>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="relative">
            <Card className="text-center p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-2xl font-bold text-blue-600">
                <AuroraText
                  className="text-blue-600"
                  colors={["#3B82F6", "#60A5FA", "#93C5FD", "#3B82F6"]}
                >
                  150+
                </AuroraText>
              </div>
              <div className="text-xs text-gray-600">Active Users</div>
            </Card>
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
          <div className="relative">
            <Card className="text-center p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-2xl font-bold text-indigo-600">
                <AuroraText
                  className="text-indigo-600"
                  colors={["#6366F1", "#818CF8", "#A5B4FC", "#6366F1"]}
                >
                  $2.5K
                </AuroraText>
              </div>
              <div className="text-xs text-gray-600">Total Split</div>
            </Card>
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
          <div className="relative">
            <Card className="text-center p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-2xl font-bold text-green-600">
                <AuroraText
                  className="text-green-600"
                  colors={["#10B981", "#34D399", "#6EE7B7", "#10B981"]}
                >
                  98%
                </AuroraText>
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </Card>
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>

        {/* Features Section */}
        <NeonGradientCard>
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Zap className="mr-3 h-5 w-5 text-yellow-500" />
              Why Choose{" "}
              <AuroraText
                className="text-gray-800"
                colors={["#1F2937", "#374151", "#4B5563", "#1F2937"]}
              >
                SplitBase
              </AuroraText>
              ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">
                  Instant Settlement
                </div>
                <div className="text-xs text-gray-600">
                  Pay with USDC on Base network
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">
                  Group Management
                </div>
                <div className="text-xs text-gray-600">
                  Easy bill splitting with friends
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors duration-300">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">
                  Transparent Tracking
                </div>
                <div className="text-xs text-gray-600">
                  Real-time payment status
                </div>
              </div>
            </div>
          </CardContent>
        </NeonGradientCard>

        {/* Quick Actions */}
        <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push("/bills")}
              variant="outline"
              className="w-full justify-start bg-white/70 hover:bg-white/90 border-indigo-200 text-indigo-700 hover:text-indigo-800 transition-all duration-300 group"
            >
              <Receipt className="mr-3 h-4 w-4" />
              View My Bills
              <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              onClick={() => router.push("/friends")}
              variant="outline"
              className="w-full justify-start bg-white/70 hover:bg-white/90 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300 group"
            >
              <Users className="mr-3 h-4 w-4" />
              Manage Friends
              <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-slate-50/90 to-gray-50/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transaction Speed</span>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-800">
                  &lt;{" "}
                  <AuroraText
                    className="text-gray-800"
                    colors={["#1F2937", "#3B82F6", "#60A5FA", "#1F2937"]}
                  >
                    2
                  </AuroraText>{" "}
                  seconds
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network Fee</span>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-800">
                  ~
                  <AuroraText
                    className="text-gray-800"
                    colors={["#1F2937", "#10B981", "#34D399", "#1F2937"]}
                  >
                    $0.01
                  </AuroraText>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-800">
                  <AuroraText
                    className="text-gray-800"
                    colors={["#1F2937", "#8B5CF6", "#A78BFA", "#1F2937"]}
                  >
                    99.9%
                  </AuroraText>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Review */}
        <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-yellow-50/90 to-orange-50/90 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-yellow-500 fill-current"
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 italic mb-3">
              &ldquo;SplitBase made splitting bills with my roommates so much
              easier. The USDC payments are instant and transparent!&rdquo;
            </p>
            <div className="text-xs text-gray-600">
              -{" "}
              <AuroraText
                className="text-gray-600"
                colors={["#4B5563", "#6B7280", "#9CA3AF", "#4B5563"]}
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
            color="#3b82f6"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Globe className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Powered by Base Network</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-4">
              Join thousands of users who trust SplitBase for their bill
              splitting needs
            </p>
            <Button
              onClick={() => router.push("/create")}
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <AuroraText
                className="text-blue-600"
                colors={["#2563EB", "#3B82F6", "#60A5FA", "#2563EB"]}
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
