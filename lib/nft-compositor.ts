// NFT Compositor - Direct copy from NFTreceipt.html logic
// Combines avatars, scenes, and metadata into final NFT

import {
  generateCyberAvatar,
  generateCyberScene,
  getLocationName,
  getTimeDisplayName,
  getRarityLevel,
} from "./nft-generation";
import { NFTGenerationParams, NFTData, NFTMetadata } from "./nft-types";

export interface NFTCompositionOptions {
  canvasWidth?: number;
  canvasHeight?: number;
  avatarSize?: number;
  includeMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<NFTCompositionOptions> = {
  canvasWidth: 400,
  canvasHeight: 600, // Increased from 800 to 1000 for more vertical space
  avatarSize: 64,
  // Match HTML card layout which does not show a metadata block
  includeMetadata: false,
};

export async function generateCompleteNFT(
  params: NFTGenerationParams,
  options: NFTCompositionOptions = {},
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const canvas = document.createElement("canvas");
  canvas.width = opts.canvasWidth;
  canvas.height = opts.canvasHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Create deep cyberpunk gradient background - direct copy from HTML
  const backgroundGrad = ctx.createLinearGradient(
    0,
    0,
    opts.canvasWidth,
    opts.canvasHeight,
  );
  backgroundGrad.addColorStop(0, "#0a0a0a");
  backgroundGrad.addColorStop(0.25, "#1a0a2e");
  backgroundGrad.addColorStop(0.5, "#16213e");
  backgroundGrad.addColorStop(0.75, "#2d1b69");
  backgroundGrad.addColorStop(1, "#0f0f23");

  ctx.fillStyle = backgroundGrad;
  ctx.fillRect(0, 0, opts.canvasWidth, opts.canvasHeight);

  // Add atmospheric particle effects - direct copy from HTML
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * opts.canvasWidth;
    const y = Math.random() * opts.canvasHeight;
    const size = Math.random() * 2 + 1;
    const colors = ["#00ffff", "#ff00ff", "#c9e265", "#89d957"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    ctx.fillStyle = color + "40";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect - direct copy from HTML
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Generate scene background (top of card, like HTML layout)
  const sceneDataUrl = generateCyberScene(params.location, params.timeOfDay);
  const sceneImg = new Image();

  // Load scene image
  await new Promise<void>((resolve, reject) => {
    sceneImg.onload = () => {
      // Scene container
      const sceneX = 20;
      const sceneY = 30;
      const sceneW = opts.canvasWidth - 40;
      const sceneH = 140; // Reduced scene height from 200 to 140

      // Draw scene with subtle glow and cyan border to match HTML `.pixel-scene`
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 18;
      ctx.drawImage(sceneImg, sceneX, sceneY, sceneW, sceneH);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(sceneX, sceneY, sceneW, sceneH);
      resolve();
    };
    sceneImg.onerror = () => reject(new Error("Failed to load scene image"));
    sceneImg.src = sceneDataUrl;
  });

  // Generate avatars
  const avatars = params.participants.map((participant) => ({
    name: participant,
    dataUrl: generateCyberAvatar(participant, opts.avatarSize),
    amount: (params.totalAmount / params.participants.length).toFixed(2),
  }));

  // Draw title and location info directly underneath scene (HTML layout)
  drawTitleSection(ctx, params, opts);

  // Draw total amount as large gradient text (no framed box in HTML)
  drawAmountSection(ctx, params, opts);

  // Draw avatars section without a background panel (HTML layout)
  await drawAvatarsSection(ctx, avatars, opts, params.timeOfDay);

  // Optionally draw metadata (off by default to mirror HTML card)
  if (opts.includeMetadata) {
    drawMetadataSection(ctx, params, opts);
  }

  // Draw footer divider with brand and minted state (HTML layout)
  drawFooterRow(ctx, params, opts);

  return canvas.toDataURL();
}

function drawTitleSection(
  ctx: CanvasRenderingContext2D,
  params: NFTGenerationParams,
  opts: Required<NFTCompositionOptions>,
): void {
  const { canvasWidth } = opts;
  const startY = 190; // Adjusted title start position from 250 to 190

  // Location title (cyan, bold, glow)
  ctx.fillStyle = "#00ffff";
  ctx.font = 'bold 22px "Orbitron", monospace';
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,255,255,0.8)";
  ctx.shadowBlur = 12;
  ctx.fillText(getLocationName(params.location), canvasWidth / 2, startY);
  ctx.shadowBlur = 0;

  // Location line (pink)
  ctx.fillStyle = "#ff00ff";
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(
    `📍 Neo-Singapore • ${getTimeDisplayName(params.timeOfDay).toUpperCase()} CYCLE`,
    canvasWidth / 2,
    startY + 20,
  );

  // NFT id and date (amber)
  const nftText = `NFT #${Math.floor(Math.random() * 9999)} • ${new Date().toLocaleDateString()}`;
  ctx.fillStyle = "#ffaa00";
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(nftText, canvasWidth / 2, startY + 38);
}

function drawAmountSection(
  ctx: CanvasRenderingContext2D,
  params: NFTGenerationParams,
  opts: Required<NFTCompositionOptions>,
): void {
  const { canvasWidth } = opts;
  const y = 260; // Adjusted amount position from 320 to 260

  // Amount gradient text (pink -> lime like HTML visual)
  const grad = ctx.createLinearGradient(
    canvasWidth / 2 - 50,
    y - 15,
    canvasWidth / 2 + 50,
    y + 15,
  );
  grad.addColorStop(0, "#ff00ff");
  grad.addColorStop(1, "#c9e265");
  ctx.fillStyle = grad;
  ctx.font = 'bold 28px "JetBrains Mono", monospace'; // Further reduced from 36px to 28px
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(201,226,101,0.5)";
  ctx.shadowBlur = 12;
  ctx.fillText(`${params.totalAmount.toFixed(2)}`, canvasWidth / 2, y);
  ctx.shadowBlur = 0;

  // Currency label
  ctx.fillStyle = "#94a3b8";
  ctx.font = '12px "JetBrains Mono", monospace'; // Reduced from 14px to 12px
  ctx.fillText("USDC", canvasWidth / 2, y + 18); // Reduced from 22 to 18
}

async function drawAvatarsSection(
  ctx: CanvasRenderingContext2D,
  avatars: Array<{ name: string; dataUrl: string; amount: string }>,
  opts: Required<NFTCompositionOptions>,
  timeOfDay: string,
): Promise<void> {
  const { canvasWidth, avatarSize } = opts;
  const startY = 300; // Adjusted avatar start position from 340 to 300, closer to amount area
  const avatarsPerRow = Math.min(avatars.length, 4);
  const spacing = (canvasWidth - 40) / avatarsPerRow;
  // No background panel for avatars to match HTML

  // Load all avatars in parallel - direct copy from HTML
  const avatarPromises = avatars.map((avatar, index) => {
    return new Promise<void>((resolve) => {
      const row = Math.floor(index / avatarsPerRow);
      const col = index % avatarsPerRow;
      const x = 20 + col * spacing + (spacing - avatarSize) / 2;
      const y = startY + row * (avatarSize + 50);

      const avatarImg = new Image();
      avatarImg.onload = () => {
        // Enhanced avatar glow effect
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 15;
        ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);
        ctx.shadowBlur = 0;

        // Avatar border glow - direct copy from HTML
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        ctx.strokeRect(x, y, avatarSize, avatarSize);
        ctx.shadowBlur = 0;

        // Avatar name with cyberpunk styling
        ctx.fillStyle = "#00ffff";
        ctx.font = 'bold 12px "Orbitron", monospace';
        ctx.textAlign = "center";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 8;
        ctx.fillText(avatar.name, x + avatarSize / 2, y + avatarSize + 20);
        ctx.shadowBlur = 0;

        // Avatar status label (Creator for first, MINTED for others)
        if (index === 0) {
          ctx.fillStyle = "#00ffff";
          ctx.font = 'bold 10px "Orbitron", monospace';
          ctx.shadowColor = "#00ffff";
          ctx.shadowBlur = 8;
          ctx.fillText("Creator", x + avatarSize / 2, y + avatarSize + 35);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = "#00ff00";
          ctx.font = 'bold 10px "Orbitron", monospace';
          ctx.shadowColor = "#00ff00";
          ctx.shadowBlur = 8;
          ctx.fillText("✓ MINTED", x + avatarSize / 2, y + avatarSize + 35);
          ctx.shadowBlur = 0;
        }

        // Avatar amount with enhanced styling (on a new line below status)
        ctx.fillStyle = "#ffaa00";
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(
          `${avatar.amount}`,
          x + avatarSize / 2,
          y + avatarSize + 50,
        );
        resolve();
      };
      avatarImg.src = avatar.dataUrl;
    });
  });

  // Wait for all avatars to load
  await Promise.all(avatarPromises);

  // Draw connection line between avatars (if more than 1 avatar)
  if (avatars.length > 1) {
    const firstAvatarX = 20 + (spacing - avatarSize) / 2 + avatarSize / 2;
    const lastAvatarX =
      20 +
      (avatars.length - 1) * spacing +
      (spacing - avatarSize) / 2 +
      avatarSize / 2;
    const lineY = startY + avatarSize + 55; // Position below avatar amount

    ctx.strokeStyle = "rgba(0,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(firstAvatarX, lineY);
    ctx.lineTo(lastAvatarX, lineY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Participants count display with time vibes (HTML)
  ctx.fillStyle = "#00ff00";
  ctx.font = '14px "Orbitron", monospace';
  ctx.textAlign = "center";
  ctx.shadowColor = "#00ff00";
  ctx.shadowBlur = 10;
  ctx.fillText(
    `🧑‍🤝‍🧑 ${avatars.length} cyber-friends • ${timeOfDay} vibes`,
    canvasWidth / 2,
    startY + 200, // Increased spacing to accommodate connection line
  );
  ctx.shadowBlur = 0;
}

function drawMetadataSection(
  ctx: CanvasRenderingContext2D,
  params: NFTGenerationParams,
  opts: Required<NFTCompositionOptions>,
): void {
  const { canvasWidth } = opts;
  const y = 600;

  // Create cyberpunk metadata background - direct copy from HTML
  const metadataGrad = ctx.createLinearGradient(0, y, canvasWidth, y + 60);
  metadataGrad.addColorStop(0, "rgba(0, 0, 0, 0.8)");
  metadataGrad.addColorStop(1, "rgba(26, 10, 46, 0.8)");

  ctx.fillStyle = metadataGrad;
  ctx.fillRect(20, y, canvasWidth - 40, 60);

  // Add cyberpunk border - direct copy from HTML
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 1;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 10;
  ctx.strokeRect(20, y, canvasWidth - 40, 60);
  ctx.shadowBlur = 0;

  // Metadata title - direct copy from HTML
  ctx.fillStyle = "#00ffff";
  ctx.font = 'bold 12px "Orbitron", monospace';
  ctx.textAlign = "left";
  ctx.fillText("NFT METADATA", 30, y + 20);

  // Metadata content with cyberpunk styling - direct copy from HTML
  ctx.fillStyle = "#94a3b8";
  ctx.font = '10px "JetBrains Mono", monospace';
  const rarity = getRarityLevel(params.totalAmount, params.participants.length);
  ctx.fillText(`Rarity: ${rarity}`, 30, y + 35);
  ctx.fillText(`Participants: ${params.participants.length}`, 30, y + 50);
  ctx.fillText(
    `Per Person: ${(params.totalAmount / params.participants.length).toFixed(2)} USDC`,
    30,
    y + 65,
  );
}

function drawFooterRow(
  ctx: CanvasRenderingContext2D,
  params: NFTGenerationParams,
  opts: Required<NFTCompositionOptions>,
): void {
  const { canvasWidth, canvasHeight } = opts;
  const y = canvasHeight - 80; // Adjusted bottom position for more space

  // Divider line like HTML border-top
  ctx.strokeStyle = "rgba(0,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y - 5);
  ctx.lineTo(canvasWidth - 20, y - 5);
  ctx.stroke();

  // Footer content row
  ctx.fillStyle = "#00ffff";
  ctx.font = '12px "Orbitron", monospace';
  ctx.textAlign = "left";
  ctx.fillText("SplitBase", 20, y + 10);

  ctx.fillStyle = "#00ff00";
  ctx.textAlign = "right";
  ctx.fillText("✓ MINTED", canvasWidth - 20, y + 10);
}

// Create NFT data object
export function createNFTData(
  params: NFTGenerationParams,
  imageData: string,
  nftId: string,
  userId?: string,
): NFTData {
  const metadata: NFTMetadata = {
    title: params.billTitle,
    participants: params.participants,
    totalAmount: params.totalAmount,
    location: params.location,
    timeOfDay: params.timeOfDay,
    participantCount: params.participants.length,
    amountPerPerson: params.totalAmount / params.participants.length,
    rarity: getRarityLevel(params.totalAmount, params.participants.length),
    locationDisplayName: getLocationName(params.location),
    timeDisplayName: getTimeDisplayName(params.timeOfDay),
  };

  const now = new Date().toISOString();

  return {
    id: nftId,
    billId: params.billId,
    userId,
    imageData,
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}
