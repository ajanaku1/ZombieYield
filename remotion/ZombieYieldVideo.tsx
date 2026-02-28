import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
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

// Scene 1: Title (0–5s = 0–150 frames)
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 12 } });
  const titleSpring = spring({ fps, frame: frame - 15, config: { damping: 15 } });
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagOpacity = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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

// Scene 2: The Problem (5–12s = 150–360 frames)
const ProblemScene: React.FC = () => {
  const items = [
    { emoji: "💀", text: "Dead tokens sitting in your wallet", delay: 15 },
    { emoji: "📉", text: "Rugged projects with zero value", delay: 30 },
    { emoji: "🪦", text: "NFTs from abandoned collections", delay: 45 },
    { emoji: "😤", text: "No way to extract any value", delay: 60 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <FadeIn delay={0}>
          <GlowText size={64} color={COLORS.red} glow={false}>
            The Problem
          </GlowText>
        </FadeIn>

        <FadeIn delay={8}>
          <Subtitle size={36}>Every Solana wallet has zombie tokens.</Subtitle>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
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

// Scene 3: The Solution (12–20s = 360–600 frames)
const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowBounce = spring({ fps, frame: frame - 30, config: { damping: 8, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <ParticleField />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>The Solution</GlowText>
        </FadeIn>

        <FadeIn delay={12}>
          <div style={{ textAlign: "center" }}>
            <Subtitle size={36}>
              ZombieYield scans your wallet, identifies zombie assets,
            </Subtitle>
            <Subtitle size={36}>and lets you earn rewards from the undead.</Subtitle>
          </div>
        </FadeIn>

        <FadeIn delay={28}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              marginTop: 24,
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

// Scene 4: Features (20–35s = 600–1050 frames)
const FeaturesScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>Key Features</GlowText>
        </FadeIn>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", maxWidth: 1300 }}>
          <FeatureCard icon="🔍" title="Wallet Scanner" description="Automatically detects zombie tokens and NFTs from dead projects in your wallet" delay={12} />
          <FeatureCard icon="⚡" title="Points Engine" description="Earn points based on your zombie holdings — more undead assets, more rewards" delay={24} />
          <FeatureCard icon="🎯" title="Torque Campaigns" description="Real Torque SDK integration — accept offers, track journeys, claim rewards" delay={36} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Torque Integration (35–50s = 1050–1500 frames)
const TorqueScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <FadeIn delay={0}>
          <GlowText size={56} color={COLORS.purple}>
            Real Torque SDK Integration
          </GlowText>
        </FadeIn>

        <FadeIn delay={12}>
          <Subtitle size={30}>
            Not a mock. Not a wrapper. Real @torque-labs/react hooks.
          </Subtitle>
        </FadeIn>

        <div style={{ display: "flex", gap: 32, marginTop: 12 }}>
          <FadeIn delay={22} direction="up">
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.purple}30`, borderRadius: 16, padding: "28px 32px", width: 340 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.purple, fontFamily: "SF Mono, monospace", marginBottom: 16 }}>
                TorqueProvider
              </div>
              <div style={{ fontSize: 17, color: COLORS.gray, lineHeight: 1.6, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
                SIWS wallet authentication via TorqueProvider wrapping the entire app
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={34} direction="up">
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.purple}30`, borderRadius: 16, padding: "28px 32px", width: 340 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.purple, fontFamily: "SF Mono, monospace", marginBottom: 16 }}>
                useOffers()
              </div>
              <div style={{ fontSize: 17, color: COLORS.gray, lineHeight: 1.6, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
                Fetch live campaigns from Torque — users see real active offers
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={46} direction="up">
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

        <FadeIn delay={60}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green }} />
            <div style={{ fontSize: 22, color: COLORS.green, fontWeight: 600, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
              Judges: check src/hooks/useTorqueIntegration.ts
            </div>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// Scene 6: How It Works (50–65s = 1500–1950 frames)
const HowItWorksScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <FadeIn delay={0}>
          <GlowText size={64}>How It Works</GlowText>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 4 }}>
          <StepCard number="1" title="Connect Wallet" description="Phantom or Solflare — Solana devnet supported" delay={12} />
          <StepCard number="2" title="Auto-Scan" description="Wallet scanned for zombie tokens and dead NFTs" delay={28} />
          <StepCard number="3" title="Earn Points" description="Points accumulate based on zombie asset category and score" delay={44} />
          <StepCard number="4" title="Torque Campaigns" description="Sign in to Torque, accept offers, complete journeys" delay={60} />
          <StepCard number="5" title="Claim Daily" description="Claim your earned rewards once every 24 hours" delay={76} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 7: Outro + CTA (65–90s = 1950–2700 frames)
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.06) * 0.15 + 1;

  const techs = [
    "React 19", "TypeScript", "Vite", "Tailwind CSS",
    "@solana/web3.js", "@solana/wallet-adapter",
    "@torque-labs/react", "Zustand", "Remotion",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
      <GridBackground />
      <ParticleField />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <FadeIn delay={0}>
          <div style={{ transform: `scale(${pulse})` }}>
            <span style={{ fontSize: 100 }}>🧟</span>
          </div>
        </FadeIn>

        <FadeIn delay={8}>
          <GlowText size={80}>ZombieYield</GlowText>
        </FadeIn>

        <FadeIn delay={18}>
          <Subtitle size={34}>Resurrect your bags. Earn from the undead.</Subtitle>
        </FadeIn>

        {/* Tech stack strip */}
        <FadeIn delay={30}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 860, marginTop: 4 }}>
            {techs.map((tech, i) => (
              <TechBadge key={tech} label={tech} delay={32 + i * 4} />
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={75}>
          <div
            style={{
              marginTop: 16,
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

        <FadeIn delay={90}>
          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            <div style={{ padding: "10px 24px", borderRadius: 30, background: `${COLORS.green}15`, border: `1px solid ${COLORS.green}30`, color: COLORS.green, fontSize: 20, fontWeight: 600, fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
              github.com/ajanaku1/ZombieYield
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={105}>
          <Subtitle size={22}>
            Powered by Torque SDK | Solana Graveyard Hackathon 2025
          </Subtitle>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Video Composition ───────────────────────────────
// Total: 2700 frames @ 30fps = 90 seconds
export const ZombieYieldVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Title (0–5s) */}
      <Sequence from={0} durationInFrames={150}>
        <TitleScene />
      </Sequence>
      <Sequence from={140} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 2: The Problem (5–12s) */}
      <Sequence from={150} durationInFrames={210}>
        <ProblemScene />
      </Sequence>
      <Sequence from={350} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 3: The Solution (12–20s) */}
      <Sequence from={360} durationInFrames={240}>
        <SolutionScene />
      </Sequence>
      <Sequence from={590} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 4: Features (20–35s) */}
      <Sequence from={600} durationInFrames={450}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={1040} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 5: Torque Integration (35–50s) */}
      <Sequence from={1050} durationInFrames={450}>
        <TorqueScene />
      </Sequence>
      <Sequence from={1490} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 6: How It Works (50–65s) */}
      <Sequence from={1500} durationInFrames={450}>
        <HowItWorksScene />
      </Sequence>
      <Sequence from={1940} durationInFrames={15}>
        <SceneTransition />
      </Sequence>

      {/* Scene 7: Outro + Tech Stack + CTA (65–90s) */}
      <Sequence from={1950} durationInFrames={750}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
