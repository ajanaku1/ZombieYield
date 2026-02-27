/**
 * VideoPage Component
 *
 * Presentation video page for ZombieYield.
 * Shows the Remotion-rendered project overview video.
 */

export function VideoPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Back link */}
      <a
        href="#/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-zombie-green transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </a>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          <span className="text-zombie-green">ZombieYield</span> Presentation
        </h1>
        <p className="text-gray-400 text-lg">
          Solana Graveyard Hackathon — Torque Bounty Submission
        </p>
      </div>

      {/* Video Player */}
      <div className="rounded-2xl overflow-hidden border border-zombie-green/20 bg-zombie-dark/50 shadow-2xl">
        <video
          controls
          autoPlay
          className="w-full aspect-video bg-black"
          poster=""
        >
          <source src="/zombieyield-presentation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Duration</h3>
          <p className="text-2xl font-bold text-white">2:00</p>
        </div>
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Made With</h3>
          <p className="text-2xl font-bold text-zombie-green">Remotion</p>
        </div>
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Resolution</h3>
          <p className="text-2xl font-bold text-white">1080p</p>
        </div>
      </div>

      {/* Sections covered */}
      <div className="mt-8 rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">What's Covered</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { time: "0:00", label: "Introduction & Branding" },
            { time: "0:06", label: "The Problem — Dead Tokens" },
            { time: "0:16", label: "The Solution — ZombieYield" },
            { time: "0:26", label: "Key Features Overview" },
            { time: "0:50", label: "Real Torque SDK Integration" },
            { time: "1:10", label: "How It Works (5 Steps)" },
            { time: "1:30", label: "Tech Stack" },
            { time: "1:40", label: "Try It — CTA" },
          ].map((item) => (
            <div key={item.time} className="flex items-center gap-3 text-gray-400">
              <span className="font-mono text-zombie-green bg-zombie-green/10 px-2 py-1 rounded text-xs">
                {item.time}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <a
          href="https://github.com/ajanaku1/ZombieYield"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-zombie-green/10 text-zombie-green border border-zombie-green/30 hover:bg-zombie-green/20 transition-colors font-semibold text-sm"
        >
          GitHub Repository
        </a>
        <a
          href="#/"
          className="px-6 py-3 rounded-xl bg-zombie-green text-zombie-black hover:shadow-neon transition-all font-semibold text-sm"
        >
          Launch App
        </a>
      </div>
    </div>
  );
}
