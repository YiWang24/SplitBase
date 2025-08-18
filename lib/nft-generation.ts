// NFT Generation Utilities
// Direct copy from NFTreceipt.html JavaScript to TypeScript

export interface CyberTraits {
  bgHue: number;
  skinHue: number;
  hairHue: number;
  eyeHue: number;
  cyberware: number; // 0=none, 1=visor, 2=implants, 3=full-cyber
  glowColor: string;
  aura: number; // 0=blue, 1=pink, 2=green, 3=lime, 4=yellow-green
  expression: number;
  accessories: number;
}

export type LocationType = "ramen" | "marina" | "hawker" | "rooftop";
export type TimeOfDayType = "evening" | "night" | "latenight" | "morning";
export type RarityLevel = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

// Enhanced hash function - direct copy from HTML
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Extract cyberpunk traits - direct copy from HTML
export function extractCyberTraits(hash: number): CyberTraits {
  return {
    bgHue: hash % 360,
    skinHue: ((hash >> 4) % 60) + 15,
    hairHue: (hash >> 8) % 360,
    eyeHue: (hash >> 12) % 360,
    cyberware: (hash >> 16) % 4, // 0=none, 1=visor, 2=implants, 3=full-cyber
    glowColor: `hsl(${(hash >> 20) % 360}, 100%, 60%)`,
    aura: (hash >> 24) % 5, // 0=blue, 1=pink, 2=green, 3=lime, 4=yellow-green
    expression: hash % 4,
    accessories: (hash >> 18) % 8,
  };
}

// Generate cyberpunk pixel avatar - direct copy from HTML
export function generateCyberAvatar(
  basename: string,
  size: number = 64,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  ctx.imageSmoothingEnabled = false;

  const hash = simpleHash(basename);
  const traits = extractCyberTraits(hash);
  const pixelSize = size / 16;

  // Cyberpunk color palette with new greens - direct copy from HTML
  const auraColors = ["#00ffff", "#ff00ff", "#00ff00", "#c9e265", "#89d957"];
  const skinTones = ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"];

  const bgColor = auraColors[traits.aura];
  const skinColor = skinTones[hash % skinTones.length];
  const hairColor = `hsl(${traits.hairHue}, 70%, 40%)`;
  const eyeColor = `hsl(${traits.eyeHue}, 100%, 60%)`;
  const glowColor = traits.glowColor;

  // Create glow effect background - direct copy from HTML
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, bgColor + "40");
  gradient.addColorStop(0.7, bgColor + "20");
  gradient.addColorStop(1, bgColor + "10");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Base avatar pattern with cyberpunk modifications - direct copy from HTML
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

  // Modify pattern based on traits - direct copy from HTML
  let modifiedPattern = [...avatarPattern];

  // Add cyberware - direct copy from HTML
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

  // Color mapping with cyber elements - direct copy from HTML
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

  // Draw base avatar - direct copy from HTML
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const pixelType = modifiedPattern[y][x];
      if (pixelType !== "0") {
        ctx.fillStyle = colors[pixelType];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

        // Add glow to cyber elements - direct copy from HTML
        if (pixelType === "4" || pixelType === "7") {
          ctx.shadowColor = colors[pixelType];
          ctx.shadowBlur = 10;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  // Add holographic effects - direct copy from HTML
  if (traits.accessories >= 4) {
    ctx.fillStyle = glowColor + "80";
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL();
}

// Generate modern cyberpunk scene (non-pixelated) - direct copy from HTML
export function generateCyberScene(
  locationType: LocationType,
  timeOfDay: TimeOfDayType,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Cyberpunk time-based palettes with new greens - direct copy from HTML
  const timePalettes: Record<TimeOfDayType, string[]> = {
    morning: ["#ff6b35", "#f7931e", "#c9e265"],
    evening: ["#ff00ff", "#00ffff", "#89d957"],
    night: ["#0066ff", "#9900ff", "#c9e265"],
    latenight: ["#ff0080", "#8000ff", "#89d957"],
  };

  const palette = timePalettes[timeOfDay] || timePalettes.night;

  // Smooth gradient background - direct copy from HTML
  const gradient = ctx.createLinearGradient(0, 0, 400, 200);
  gradient.addColorStop(0, "#000011");
  gradient.addColorStop(0.3, "#001122");
  gradient.addColorStop(0.7, "#112233");
  gradient.addColorStop(1, "#000033");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 200);

  // Add atmospheric effects - direct copy from HTML
  const atmosGradient = ctx.createRadialGradient(200, 100, 0, 200, 100, 300);
  atmosGradient.addColorStop(0, palette[0] + "20");
  atmosGradient.addColorStop(0.5, palette[1] + "15");
  atmosGradient.addColorStop(1, palette[2] + "10");
  ctx.fillStyle = atmosGradient;
  ctx.fillRect(0, 0, 400, 200);

  // Draw modern location elements - direct copy from HTML
  drawModernElements(ctx, locationType, palette);

  // Add particle effects - direct copy from HTML
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 400;
    const y = Math.random() * 200;
    const size = Math.random() * 3 + 1;
    const color = palette[Math.floor(Math.random() * palette.length)];

    ctx.fillStyle = color + "80";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Add glow - direct copy from HTML
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  return canvas.toDataURL();
}

// Draw location-specific elements - direct copy from HTML
function drawModernElements(
  ctx: CanvasRenderingContext2D,
  locationType: LocationType,
  palette: string[],
): void {
  ctx.lineWidth = 2;

  switch (locationType) {
    case "ramen":
      // Modern ramen shop with glowing signs - direct copy from HTML
      // Building silhouette
      ctx.fillStyle = "rgba(40, 40, 60, 0.8)";
      ctx.fillRect(80, 100, 240, 100);

      // Glowing neon sign
      ctx.strokeStyle = palette[0];
      ctx.lineWidth = 4;
      ctx.shadowColor = palette[0];
      ctx.shadowBlur = 20;
      ctx.strokeRect(120, 80, 160, 40);
      ctx.shadowBlur = 0;

      // Window glow
      const windowGrad = ctx.createLinearGradient(120, 130, 280, 170);
      windowGrad.addColorStop(0, palette[1] + "60");
      windowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = windowGrad;
      ctx.fillRect(120, 130, 160, 40);

      // Steam effects
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = palette[2] + "40";
        ctx.beginPath();
        ctx.arc(140 + i * 20, 60 - i * 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "marina":
      // Modern towers with light effects - direct copy from HTML
      for (let i = 0; i < 5; i++) {
        const height = 80 + Math.random() * 100;
        const x = 60 + i * 60;
        const width = 40 + Math.random() * 20;

        // Building gradient
        const buildingGrad = ctx.createLinearGradient(x, 200 - height, x, 200);
        buildingGrad.addColorStop(0, "rgba(30, 30, 50, 0.9)");
        buildingGrad.addColorStop(1, "rgba(60, 60, 80, 0.9)");
        ctx.fillStyle = buildingGrad;
        ctx.fillRect(x, 200 - height, width, height);

        // Neon accent lines
        ctx.strokeStyle = palette[i % palette.length];
        ctx.lineWidth = 2;
        ctx.shadowColor = palette[i % palette.length];
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(x, 200 - height);
        ctx.lineTo(x + width, 200 - height);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Window lights
        for (let floor = 0; floor < height / 12; floor++) {
          if (Math.random() > 0.4) {
            ctx.fillStyle =
              palette[Math.floor(Math.random() * palette.length)] + "80";
            ctx.fillRect(x + 8, 200 - height + floor * 12, width - 16, 8);
          }
        }
      }
      break;

    case "hawker":
      // Modern food court with ambient lighting - direct copy from HTML
      // Base structure
      ctx.fillStyle = "rgba(80, 60, 40, 0.8)";
      ctx.fillRect(50, 140, 300, 60);

      // Overhead lighting strips
      for (let i = 0; i < 6; i++) {
        const x = 70 + i * 50;
        ctx.fillStyle = palette[i % palette.length] + "60";
        ctx.fillRect(x, 120, 40, 20);

        // Light beam effect
        const lightGrad = ctx.createLinearGradient(x + 20, 140, x + 20, 180);
        lightGrad.addColorStop(0, palette[i % palette.length] + "40");
        lightGrad.addColorStop(1, "transparent");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(x + 10, 140, 20, 40);
      }
      break;

    case "rooftop":
      // Holographic sky bar - direct copy from HTML
      // Floor platform
      ctx.fillStyle = "rgba(40, 40, 60, 0.9)";
      ctx.fillRect(0, 160, 400, 40);

      // Floating holo-platforms with glow
      for (let i = 0; i < 4; i++) {
        const x = 80 + i * 80;
        const y = 120 - i * 8;

        // Platform glow
        ctx.shadowColor = palette[i % palette.length];
        ctx.shadowBlur = 25;
        ctx.fillStyle = palette[i % palette.length] + "60";
        ctx.fillRect(x, y, 60, 15);
        ctx.shadowBlur = 0;

        // Platform solid
        ctx.fillStyle = "rgba(100, 100, 120, 0.8)";
        ctx.fillRect(x, y, 60, 15);
      }

      // City skyline silhouette
      for (let i = 0; i < 10; i++) {
        const height = 40 + Math.random() * 80;
        const x = i * 40;
        ctx.fillStyle = "rgba(20, 20, 40, 0.7)";
        ctx.fillRect(x, 160 - height, 35, height);

        // Random window lights
        if (Math.random() > 0.6) {
          ctx.fillStyle =
            palette[Math.floor(Math.random() * palette.length)] + "80";
          ctx.fillRect(x + 10, 160 - height + 20, 15, 10);
        }
      }
      break;
  }
}

// Get location style class name - direct copy from HTML
export function getLocationStyle(location: LocationType): string {
  const styles: Record<LocationType, string> = {
    ramen: "neon-ramen",
    marina: "neon-marina",
    hawker: "neon-hawker",
    rooftop: "neon-party",
  };
  return styles[location] || "neon-party";
}

// Get location display name - direct copy from HTML
export function getLocationName(location: LocationType): string {
  const names: Record<LocationType, string> = {
    ramen: "Cyber Ramen District",
    marina: "Neo Marina Towers",
    hawker: "Digital Food Court",
    rooftop: "Hologram Rooftop",
  };
  return names[location] || "Cyber Space";
}

// Get time display name - direct copy from HTML
export function getTimeDisplayName(timeOfDay: TimeOfDayType): string {
  const names: Record<TimeOfDayType, string> = {
    evening: "Evening Glow",
    night: "Neon Night",
    latenight: "Deep Cyber",
    morning: "Dawn Matrix",
  };
  return names[timeOfDay] || "Neon Night";
}

// Calculate rarity level based on amount and participants - direct copy from HTML
export function getRarityLevel(
  amount: number,
  participants: number,
): RarityLevel {
  const avgAmount = amount / participants;
  if (avgAmount > 100) return "LEGENDARY";
  if (avgAmount > 50) return "EPIC";
  if (avgAmount > 25) return "RARE";
  return "COMMON";
}

// Location and time options for UI
export const LOCATION_OPTIONS = [
  { value: "ramen" as LocationType, label: "🍜 Cyber Ramen District" },
  { value: "marina" as LocationType, label: "🏙️ Neo Marina Towers" },
  { value: "hawker" as LocationType, label: "🍛 Digital Food Court" },
  { value: "rooftop" as LocationType, label: "🌃 Hologram Rooftop" },
];

export const TIME_OPTIONS = [
  { value: "evening" as TimeOfDayType, label: "Evening Glow" },
  { value: "night" as TimeOfDayType, label: "Neon Night" },
  { value: "latenight" as TimeOfDayType, label: "Deep Cyber" },
  { value: "morning" as TimeOfDayType, label: "Dawn Matrix" },
];

// Create floating particles - direct copy from HTML
export function createParticles(): void {
  const particlesContainer = document.getElementById("particles");

  if (!particlesContainer) {
    return;
  }

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = 6 + Math.random() * 4 + "s";
    particlesContainer.appendChild(particle);
  }
}

// Avatar generation data interface
export interface AvatarData {
  basename: string;
  avatar: string;
  amount: string;
}

// Main generation function - direct copy from HTML
export function generatePixelNeon(): void {
  const participantsInput = (
    document.getElementById("participants") as HTMLInputElement
  )?.value;
  const location = (document.getElementById("location") as HTMLSelectElement)
    ?.value as LocationType;
  const timeOfDay = (document.getElementById("timeOfDay") as HTMLSelectElement)
    ?.value as TimeOfDayType;
  const amount =
    parseFloat(
      (document.getElementById("amount") as HTMLInputElement)?.value,
    ) || 247.5;

  if (!participantsInput) {
    return;
  }

  const participants = participantsInput
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p);

  const grid = document.getElementById("nftGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  // Generate scene
  const sceneCanvas = generateCyberScene(location, timeOfDay);

  // Generate avatars
  const avatars: AvatarData[] = participants.map((p) => ({
    basename: p,
    avatar: generateCyberAvatar(p, 64),
    amount: (amount / participants.length).toFixed(2),
  }));

  const rarity = getRarityLevel(amount, participants.length);
  const locationStyle = getLocationStyle(location);
  const locationName = getLocationName(location);

  // Create NFT card
  const card = document.createElement("div");
  card.className = `pixel-nft-card ${locationStyle}`;
  card.innerHTML = `
    <div class="card-header">
      <div class="pixel-scene">
        <img src="${sceneCanvas}" class="scene-canvas" alt="${locationName}">
      </div>
      
      <h3 style="font-size: 1.4rem; color: #00ffff; margin-bottom: 0.5rem; text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);">
        ${locationName}
      </h3>
      <p style="font-size: 0.9rem; color: #ff00ff; text-shadow: 0 0 10px rgba(255, 0, 255, 0.3);">
        📍 Neo-Singapore • ${timeOfDay.toUpperCase()} CYCLE
      </p>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #ffaa00; margin-top: 0.5rem;">
        NFT #${Math.floor(Math.random() * 9999)} • ${new Date().toLocaleDateString()}
      </div>
    </div>
    
    <div class="total-amount">
      <div class="amount-display">${amount}</div>
      <span class="currency">USDC</span>
    </div>
    
    <div class="pixel-avatars">
      ${avatars
        .map(
          (a) => `
        <div class="pixel-avatar">
          <img src="${a.avatar}" class="avatar-canvas" alt="${a.basename}">
          <div class="avatar-name">${a.basename}</div>
          <div class="avatar-amount">${a.amount}</div>
        </div>
      `,
        )
        .join("")}
    </div>
    
    <div style="text-align: center; margin: 1.5rem 0; font-size: 0.9rem; color: #00ff00; text-shadow: 0 0 15px rgba(0, 255, 0, 0.3);">
      🧑‍🤝‍🧑 ${participants.length} cyber-friends • ${timeOfDay} vibes
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(0, 255, 255, 0.2); font-size: 0.7rem;">
      <span style="color: #00ffff;">SplitBase</span>
      <span style="color: #00ff00;">✓ MINTED</span>
    </div>
  `;

  grid.appendChild(card);

  // Add entrance animation
  setTimeout(() => {
    card.style.opacity = "0";
    card.style.transform = "translateY(50px)";
    card.style.transition = "all 0.8s ease";

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 100);
  }, 0);
}

// Initialize NFT generation environment - direct copy from HTML
export function initializeNFTGeneration(): void {
  createParticles();
  generatePixelNeon();
}

// Auto-demo functionality - direct copy from HTML
export function startAutoDemo(intervalMs: number = 15000): NodeJS.Timer {
  return setInterval(() => {
    const participants = [
      "cyber.alice",
      "neon.bob",
      "pixel.charlie",
      "matrix.diana",
      "holo.eve",
    ];
    const locations: LocationType[] = ["ramen", "marina", "hawker", "rooftop"];
    const times: TimeOfDayType[] = ["evening", "night", "latenight"];

    // Randomize inputs
    const participantsElement = document.getElementById(
      "participants",
    ) as HTMLInputElement;
    const locationElement = document.getElementById(
      "location",
    ) as HTMLSelectElement;
    const timeOfDayElement = document.getElementById(
      "timeOfDay",
    ) as HTMLSelectElement;
    const amountElement = document.getElementById("amount") as HTMLInputElement;

    if (
      participantsElement &&
      locationElement &&
      timeOfDayElement &&
      amountElement
    ) {
      participantsElement.value = participants
        .slice(0, 2 + Math.floor(Math.random() * 3))
        .join(", ");
      locationElement.value =
        locations[Math.floor(Math.random() * locations.length)];
      timeOfDayElement.value = times[Math.floor(Math.random() * times.length)];
      amountElement.value = (50 + Math.random() * 300).toFixed(2);

      generatePixelNeon();
    }
  }, intervalMs);
}
