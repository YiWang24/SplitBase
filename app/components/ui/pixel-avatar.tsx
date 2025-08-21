"use client";

import { useMemo } from "react";

interface PixelAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

// Enhanced hash function (from nft-generation.ts)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Extract cyberpunk traits (from nft-generation.ts)
interface CyberTraits {
  bgHue: number;
  skinHue: number;
  hairHue: number;
  eyeHue: number;
  cyberware: number;
  glowColor: string;
  aura: number;
  expression: number;
  accessories: number;
}

function extractCyberTraits(hash: number): CyberTraits {
  return {
    bgHue: hash % 360,
    skinHue: ((hash >> 4) % 60) + 15,
    hairHue: (hash >> 8) % 360,
    eyeHue: (hash >> 12) % 360,
    cyberware: (hash >> 16) % 4,
    glowColor: `hsl(${(hash >> 20) % 360}, 100%, 60%)`,
    aura: (hash >> 24) % 5,
    expression: hash % 4,
    accessories: (hash >> 18) % 8,
  };
}

export default function PixelAvatar({
  address,
  size = 64,
  className = "",
}: PixelAvatarProps) {
  const avatarData = useMemo(() => {
    const hash = simpleHash(address.toLowerCase());
    const traits = extractCyberTraits(hash);

    // Cyberpunk color palette (from nft-generation.ts)
    const auraColors = ["#00ffff", "#ff00ff", "#00ff00", "#c9e265", "#89d957"];
    const skinTones = ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"];

    const bgColor = auraColors[traits.aura];
    const skinColor = skinTones[hash % skinTones.length];
    const hairColor = `hsl(${traits.hairHue}, 70%, 40%)`;
    const eyeColor = `hsl(${traits.eyeHue}, 100%, 60%)`;
    const glowColor = traits.glowColor;

    // Base avatar pattern (from nft-generation.ts)
    const avatarPattern = [
      "0000000000000000",
      "0000111111110000",
      "0001111111111000",
      "0011111111111100",
      "0111111111111110",
      "0111122112211110", // eyes with cyber mods
      "0111111111111110",
      "0111111111111110",
      "0111111331111110", // mouth/cyber jaw
      "0111111111111110",
      "0011111111111100",
      "0001111111111000",
      "0000111111110000",
      "0000044444440000", // cyber collar
      "0000044444440000",
      "0000000000000000",
    ];

    // Modify pattern based on traits
    const modifiedPattern = [...avatarPattern];

    // Add cyberware
    if (traits.cyberware >= 1) {
      modifiedPattern[5] = "0111155115511110"; // Cyber visor
      modifiedPattern[6] = "0111155115511110";
    }

    if (traits.cyberware >= 2) {
      modifiedPattern[8] = "0111166666661110"; // Cyber jaw
      modifiedPattern[9] = "0111166616661110";
    }

    if (traits.cyberware >= 3) {
      modifiedPattern[4] = "0777111111111777"; // Full cyber temples
      modifiedPattern[10] = "0777111111111777";
    }

    // Color mapping with cyber elements
    const colors: Record<string, string> = {
      "0": "transparent",
      "1": skinColor,
      "2": eyeColor,
      "3": hairColor,
      "4": glowColor,
      "5": "#000080", // Cyber visor
      "6": "#c0c0c0", // Cyber jaw
      "7": glowColor, // Cyber glow
    };

    return {
      modifiedPattern,
      colors,
      bgColor,
      glowColor,
      traits,
      skinColor,
      eyeColor,
      hairColor,
    };
  }, [address]);

  const pixelSize = size / 16; // 16x16 grid like in nft-generation.ts

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow effect background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${avatarData.bgColor}40 0%, ${avatarData.bgColor}20 70%, ${avatarData.bgColor}10 100%)`,
        }}
      />

      {/* Pixel grid */}
      <div className="relative w-full h-full rounded-full overflow-hidden">
        {avatarData.modifiedPattern.map((row, y) =>
          row.split("").map(
            (pixelType, x) =>
              pixelType !== "0" && (
                <div
                  key={`${y}-${x}`}
                  className="absolute"
                  style={{
                    left: x * pixelSize,
                    top: y * pixelSize,
                    width: pixelSize,
                    height: pixelSize,
                    backgroundColor: avatarData.colors[pixelType],
                    // Add glow to cyber elements
                    boxShadow:
                      pixelType === "4" || pixelType === "7"
                        ? `0 0 ${pixelSize * 0.5}px ${avatarData.colors[pixelType]}`
                        : "none",
                  }}
                />
              ),
          ),
        )}
      </div>

      {/* Holographic effects for high-tech variants */}
      {avatarData.traits.accessories >= 4 && (
        <div className="absolute inset-0 rounded-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                backgroundColor: avatarData.glowColor + "80",
                left: `${Math.sin((i * Math.PI) / 4) * 40 + 50}%`,
                top: `${Math.cos((i * Math.PI) / 4) * 40 + 50}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Border with glow */}
      <div
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: avatarData.bgColor + "60",
          boxShadow: `0 0 ${size * 0.1}px ${avatarData.bgColor}40`,
        }}
      />
    </div>
  );
}
