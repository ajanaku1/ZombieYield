import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ─── Color Palette ────────────────────────────────────────
const COLORS = {
  bg: "#0a0a0a",
  bgCard: "#111111",
  green: "#39ff14",
  greenDark: "#1a8a0a",
  white: "#ffffff",
  gray: "#9ca3af",
  grayDark: "#374151",
  red: "#ef4444",
  purple: "#a855f7",
  yellow: "#facc15",
};

// ─── Reusable Components ──────────────────────────────────
const GlowText: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  glow?: boolean;
}> = ({ children, size = 72, color = COLORS.green, glow = true }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 900,
      color,
      fontFamily: "SF Pro Display, system-ui, sans-serif",
      textShadow: glow ? `0 0 40px ${color}80, 0 0 80px ${color}40` : "none",
      letterSpacing: "-0.02em",
    }}
  >
    {children}
  </div>
);

const Subtitle: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 32,
}) => (
  <div
    style={{
      fontSize: size,
      color: COLORS.gray,
      fontFamily: "SF Pro Text, system-ui, sans-serif",
      lineHeight: 1.5,
      maxWidth: 900,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}> = ({ children, delay = 0, direction = "up" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ fps, frame: frame - delay, config: { damping: 20, mass: 0.8 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const offsets = { up: [40, 0], down: [-40, 0], left: [40, 0], right: [-40, 0], none: [0, 0] };
  const [start, end] = offsets[direction];

  const translate = interpolate(progress, [0, 1], [start, end]);
  const axis = direction === "left" || direction === "right" ? "X" : "Y";

  return (
    <div style={{ opacity, transform: direction === "none" ? undefined : `translate${axis}(${translate}px)` }}>
      {children}
    </div>
  );
};

const GridBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 0.3) % 60;

  return (
    <AbsoluteFill style={{ opacity: 0.06 }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform={`translate(0, ${offset})`}>
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={COLORS.green} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </AbsoluteFill>
  );
};

const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: ((i * 73 + 17) % 100),
    y: ((i * 47 + 31 + frame * 0.2) % 110) - 5,
    size: 2 + (i % 3),
    opacity: 0.1 + (i % 5) * 0.06,
  }));

  return (
    <AbsoluteFill>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: COLORS.green,
            opacity: p.opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => (
  <FadeIn delay={delay} direction="up">
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgCard}, #1a1a1a)`,
        border: `1px solid ${COLORS.green}30`,
        borderRadius: 20,
        padding: "36px 32px",
        width: 380,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.white, fontFamily: "SF Pro Display, system-ui, sans-serif" }}>
        {title}
      </div>
      <div style={{ fontSize: 18, color: COLORS.gray, lineHeight: 1.5, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
        {description}
      </div>
    </div>
  </FadeIn>
);

const StepCard: React.FC<{
  number: string;
  title: string;
  description: string;
  delay: number;
}> = ({ number, title, description, delay }) => (
  <FadeIn delay={delay} direction="left">
    <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 12 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: 900,
          color: COLORS.bg,
          fontFamily: "SF Pro Display, system-ui, sans-serif",
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.white, fontFamily: "SF Pro Display, system-ui, sans-serif" }}>
          {title}
        </div>
        <div style={{ fontSize: 20, color: COLORS.gray, fontFamily: "SF Pro Text, system-ui, sans-serif", marginTop: 4 }}>
          {description}
        </div>
      </div>
    </div>
  </FadeIn>
);

const TechBadge: React.FC<{ label: string; delay: number }> = ({ label, delay }) => (
  <FadeIn delay={delay} direction="up">
    <div
      style={{
        padding: "14px 28px",
        borderRadius: 14,
        border: `1px solid ${COLORS.green}40`,
        background: `${COLORS.green}10`,
        color: COLORS.green,
        fontSize: 22,
        fontWeight: 600,
        fontFamily: "SF Mono, monospace",
      }}
    >
      {label}
    </div>
  </FadeIn>
);

const SceneTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        opacity: interpolate(progress, [0, 0.5, 1], [1, 1, 0], { extrapolateRight: "clamp" }),
      }}
    />
  );
};

// ─── Scenes ───────────────────────────────────────────────

// Scene 1: Title (0-5s = 0-150 frames)
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 12 } });
  const titleSpring = spring({ fps, frame: frame - 15, config: { damping: 15 } });
  const subtitleOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagOpacity = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulse glow
  const pulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <ParticleField />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div
          style={{
            transform: `scale(${logoScale})`,
            width: 140,
            height: 140,
            borderRadius: 40,
            background: `linear-gradient(135deg, ${COLORS.green}20, ${COLORS.green}08)`,
            border: `3px solid ${COLORS.green}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${60 * pulse}px ${COLORS.green}40`,
          }}
        >
          <span style={{ fontSize: 80 }}>🧟</span>
        </div>

        <div style={{ transform: `scale(${titleSpring})`, textAlign: "center" }}>
          <GlowText size={96}>ZombieYield</GlowText>
        </div>

        <div style={{ opacity: subtitleOpacity }}>
          <Subtitle size={36}>Resurrect Your Dead Tokens. Earn Rewards.</Subtitle>
        </div>

        <div
          style={{
            opacity: tagOpacity,
            display: "flex",
            gap: 16,
            marginTop: 12,
          }}
        >
          <div style={{ padding: "10px 24px", borderRadius: 30, background: `${COLORS.green}15`, border: `1px solid ${COLORS.green}30`, color: COLORS.green, fontSize: 20, fontWeight: 600, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
            Solana Graveyard Hackathon
          </div>
          <div style={{ padding: "10px 24px", borderRadius: 30, background: `${COLORS.purple}15`, border: `1px solid ${COLORS.purple}30`, color: COLORS.purple, fontSize: 20, fontWeight: 600, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
            Torque Bounty
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: The Problem (5-15s = 150-450 frames)
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const items = [
    { emoji: "💀", text: "Dead tokens sitting in your wallet", delay: 20 },
    { emoji: "📉", text: "Rugged projects with zero value", delay: 40 },
    { emoji: "🪦", text: "NFTs from abandoned collections", delay: 60 },
    { emoji: "😤", text: "No way to extract any value", delay: 80 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <FadeIn delay={0}>
          <GlowText size={64} color={COLORS.red} glow={false}>
            The Problem
          </GlowText>
        </FadeIn>

        <FadeIn delay={10}>
          <Subtitle size={36}>Every Solana wallet has zombie tokens.</Subtitle>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 16 }}>
          {items.map((item, i) => (
            <FadeIn key={i} delay={item.delay} direction="left">
              <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, color: COLORS.gray, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
                <span style={{ fontSize: 40 }}>{item.emoji}</span>
                {item.text}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: The Solution (15-25s = 450-750 frames)
const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowBounce = spring({ fps, frame: frame - 40, config: { damping: 8, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <ParticleField />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>The Solution</GlowText>
        </FadeIn>

        <FadeIn delay={15}>
          <div style={{ textAlign: "center" }}>
            <Subtitle size={38}>
              ZombieYield scans your wallet, identifies zombie assets,
            </Subtitle>
            <Subtitle size={38}>and lets you earn rewards from the undead.</Subtitle>
          </div>
        </FadeIn>

        <FadeIn delay={35}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              marginTop: 32,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 100, height: 100, borderRadius: 28, background: `${COLORS.red}20`, border: `2px solid ${COLORS.red}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                💀
              </div>
              <div style={{ fontSize: 20, color: COLORS.gray, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>Dead Tokens</div>
            </div>

            <div style={{ transform: `translateY(${interpolate(arrowBounce, [0, 1], [-10, 0])}px)`, fontSize: 48, color: COLORS.green }}>
              →
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 100, height: 100, borderRadius: 28, background: `${COLORS.green}20`, border: `2px solid ${COLORS.green}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                🧟
              </div>
              <div style={{ fontSize: 20, color: COLORS.gray, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>ZombieYield</div>
            </div>

            <div style={{ transform: `translateY(${interpolate(arrowBounce, [0, 1], [-10, 0])}px)`, fontSize: 48, color: COLORS.green }}>
              →
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 100, height: 100, borderRadius: 28, background: `${COLORS.yellow}20`, border: `2px solid ${COLORS.yellow}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                🏆
              </div>
              <div style={{ fontSize: 20, color: COLORS.gray, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>Rewards</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Features (25-50s = 750-1500 frames)
const FeaturesScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>Key Features</GlowText>
        </FadeIn>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", maxWidth: 1300 }}>
          <FeatureCard icon="🔍" title="Wallet Scanner" description="Automatically detects zombie tokens and NFTs from dead projects in your wallet" delay={15} />
          <FeatureCard icon="⚡" title="Points Engine" description="Earn points based on your zombie holdings — more undead assets, more rewards" delay={30} />
          <FeatureCard icon="🎯" title="Torque Campaigns" description="Real Torque SDK integration — accept offers, track journeys, claim rewards" delay={45} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Torque Integration (50-70s = 1500-2100 frames)
const TorqueScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <FadeIn delay={0}>
          <GlowText size={56} color={COLORS.purple}>
            Real Torque SDK Integration
          </GlowText>
        </FadeIn>

        <FadeIn delay={15}>
          <Subtitle size={30}>
            Not a mock. Not a wrapper. Real @torque-labs/react hooks.
          </Subtitle>
        </FadeIn>

        <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
          <FadeIn delay={25} direction="up">
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.purple}30`, borderRadius: 16, padding: "28px 32px", width: 340 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.purple, fontFamily: "SF Mono, monospace", marginBottom: 16 }}>
                TorqueProvider
              </div>
              <div style={{ fontSize: 17, color: COLORS.gray, lineHeight: 1.6, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
                SIWS wallet authentication via TorqueProvider wrapping the entire app
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={40} direction="up">
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.purple}30`, borderRadius: 16, padding: "28px 32px", width: 340 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.purple, fontFamily: "SF Mono, monospace", marginBottom: 16 }}>
                useOffers()
              </div>
              <div style={{ fontSize: 17, color: COLORS.gray, lineHeight: 1.6, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
                Fetch live campaigns from Torque — users see real active offers
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={55} direction="up">
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.purple}30`, borderRadius: 16, padding: "28px 32px", width: 340 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.purple, fontFamily: "SF Mono, monospace", marginBottom: 16 }}>
                useStartOffer()
              </div>
              <div style={{ fontSize: 17, color: COLORS.gray, lineHeight: 1.6, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
                Accept campaigns and track journey progress through completion
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={70}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green }} />
            <div style={{ fontSize: 22, color: COLORS.green, fontWeight: 600, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
              Judges: check src/hooks/useTorqueIntegration.ts & src/components/TorqueOffersSection.tsx
            </div>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// Scene 6: How It Works (70-90s = 2100-2700 frames)
const HowItWorksScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>How It Works</GlowText>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 8 }}>
          <StepCard number="1" title="Connect Wallet" description="Phantom or Solflare — Solana devnet supported" delay={15} />
          <StepCard number="2" title="Auto-Scan" description="Wallet scanned for zombie tokens and dead NFTs" delay={35} />
          <StepCard number="3" title="Earn Points" description="Points accumulate based on zombie asset holdings" delay={55} />
          <StepCard number="4" title="Torque Campaigns" description="Sign in to Torque, accept offers, complete journeys" delay={75} />
          <StepCard number="5" title="Claim Rewards" description="Claim your earned rewards from the undead" delay={95} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 7: Tech Stack (90-100s = 2700-3000 frames)
const TechStackScene: React.FC = () => {
  const techs = [
    "React 19",
    "TypeScript",
    "Vite",
    "Tailwind CSS",
    "@solana/web3.js",
    "@solana/wallet-adapter",
    "@torque-labs/react",
    "@torque-labs/sdk",
    "@tanstack/react-query",
    "Zustand",
    "Remotion",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>Tech Stack</GlowText>
        </FadeIn>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 900, marginTop: 8 }}>
          {techs.map((tech, i) => (
            <TechBadge key={tech} label={tech} delay={10 + i * 6} />
          ))}
        </div>

        <FadeIn delay={90}>
          <Subtitle size={26}>Built for the Solana Graveyard Hackathon</Subtitle>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// Scene 8: CTA / Outro (100-120s = 3000-3600 frames)
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.06) * 0.15 + 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <ParticleField />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <FadeIn delay={0}>
          <div style={{ transform: `scale(${pulse})` }}>
            <span style={{ fontSize: 120 }}>🧟</span>
          </div>
        </FadeIn>

        <FadeIn delay={10}>
          <GlowText size={84}>ZombieYield</GlowText>
        </FadeIn>

        <FadeIn delay={25}>
          <Subtitle size={36}>Resurrect your bags. Earn from the undead.</Subtitle>
        </FadeIn>

        <FadeIn delay={40}>
          <div
            style={{
              marginTop: 20,
              padding: "18px 48px",
              borderRadius: 16,
              background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`,
              color: COLORS.bg,
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "SF Pro Display, system-ui, sans-serif",
              boxShadow: `0 0 40px ${COLORS.green}60`,
            }}
          >
            zombieyield.vercel.app
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            <div style={{ padding: "10px 24px", borderRadius: 30, background: `${COLORS.green}15`, border: `1px solid ${COLORS.green}30`, color: COLORS.green, fontSize: 20, fontWeight: 600, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
              github.com/ajanaku1/ZombieYield
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <Subtitle size={22}>
            Powered by Torque SDK | Solana Graveyard Hackathon 2025
          </Subtitle>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Video Composition ───────────────────────────────
export const ZombieYieldVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Title (0-5s) */}
      <Sequence from={0} durationInFrames={180}>
        <TitleScene />
      </Sequence>
      <Sequence from={170} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 2: The Problem (5-15s) */}
      <Sequence from={180} durationInFrames={300}>
        <ProblemScene />
      </Sequence>
      <Sequence from={470} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 3: The Solution (15-25s) */}
      <Sequence from={480} durationInFrames={300}>
        <SolutionScene />
      </Sequence>
      <Sequence from={770} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 4: Features (25-50s) */}
      <Sequence from={780} durationInFrames={720}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={1490} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 5: Torque Integration (50-70s) */}
      <Sequence from={1500} durationInFrames={600}>
        <TorqueScene />
      </Sequence>
      <Sequence from={2090} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 6: How It Works (70-90s) */}
      <Sequence from={2100} durationInFrames={600}>
        <HowItWorksScene />
      </Sequence>
      <Sequence from={2690} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 7: Tech Stack (90-100s) */}
      <Sequence from={2700} durationInFrames={300}>
        <TechStackScene />
      </Sequence>
      <Sequence from={2990} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 8: CTA / Outro (100-120s) */}
      <Sequence from={3000} durationInFrames={600}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
