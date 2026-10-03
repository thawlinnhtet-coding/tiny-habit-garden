"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Heart, Leaf, Sparkles } from "lucide-react";
import { GardenShell } from "@/components/garden-shell";
import { GardenScene } from "@/components/garden-scene";
import { useGarden } from "@/components/garden-provider";

export default function Page() {
  const { habits, mode } = useGarden();
  const router = useRouter();

  return (
    <GardenShell>
      <div className="landing-wrap">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <span className="eyebrow landing-eyebrow">
              <span className="landing-seed">✦</span> A LITTLE GARDEN FOR YOUR
              EVERYDAY WINS
            </span>
            <h1 id="landing-title">
              Good things grow
              <br />
              <span>one day at a time.</span>
            </h1>
            <p className="landing-description">
              Show up for one small habit. Give your pixel garden a little love.
              Before long, those tiny moments become a world of your own.
            </p>
            <div className="landing-actions">
              <Link
                href="/signup"
                className="pixel-button primary landing-start"
              >
                Grow your garden <ArrowRight size={16} />
              </Link>
              <Link href="/garden" className="landing-preview-link">
                {mode === "private" ? "Visit your garden" : "Wander the garden"}
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="landing-kindness">
              <span className="kindness-icon">
                <Heart size={15} fill="currentColor" />
              </span>
              <span>
                <strong>No perfect streaks required.</strong>
                <br />
                Your garden keeps growing at your pace.
              </span>
            </div>
          </div>

          <div className="landing-world">
            <div className="world-label">
              <Sparkles size={13} /> A WORLD THAT GROWS WITH YOU
            </div>
            <GardenScene
              compact
              habits={habits}
              onSelect={() => router.push("/garden")}
              onPlant={() => router.push("/habits/new")}
            />
            <div className="world-note">
              <span className="world-note-dot" /> YOUR NEXT LITTLE WIN IS
              WAITING
            </div>
          </div>
        </section>

        <section className="landing-steps" aria-label="How your garden grows">
          <div className="landing-step">
            <span className="step-number">01</span>
            <span>
              <strong>Pick a tiny habit</strong>
              <small>Something kind for you</small>
            </span>
          </div>
          <span className="step-connector" aria-hidden="true">
            ···
          </span>
          <div className="landing-step">
            <span className="step-number">02</span>
            <span>
              <strong>Water it each day</strong>
              <small>One check-in at a time</small>
            </span>
          </div>
          <span className="step-connector" aria-hidden="true">
            ···
          </span>
          <div className="landing-step">
            <span className="step-number">03</span>
            <span>
              <strong>Watch it bloom</strong>
              <small>Your real life, in pixels</small>
            </span>
            <Check className="step-check" size={15} />
          </div>
        </section>

        <section
          id="your-garden"
          className="landing-join"
          aria-label="Start your garden"
        >
          <div className="join-heading">
            <span className="eyebrow">
              <Leaf size={13} /> YOUR OWN LITTLE WORLD
            </span>
            <h2>Ready to plant your first seed?</h2>
            <p>Make a private garden, sign in, or try the guest patch first.</p>
          </div>
          <div className="landing-account-actions">
            <Link href="/signup" className="pixel-button primary">
              Create your garden
            </Link>
            <Link href="/login" className="text-link">
              Sign in
            </Link>
            {mode === "guest" ? (
              <Link href="/garden" className="text-link">
                Try a guest garden
              </Link>
            ) : mode === "private" ? (
              <Link href="/garden" className="text-link">
                Visit your garden
              </Link>
            ) : null}
          </div>
          <p className="landing-signoff">
            Small steps. Soft soil. A little more you. <span>✿</span>
          </p>
        </section>
      </div>
    </GardenShell>
  );
}
