"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf } from "lucide-react";
import { GardenShell } from "@/components/garden-shell";
import { GardenScene } from "@/components/garden-scene";
import { useGarden } from "@/components/garden-provider";

export default function Page() {
  const { habits } = useGarden();
  const router = useRouter();
  return <GardenShell><div className="landing-wrap"><span className="eyebrow"><Leaf size={13} /> WELCOME TO TINY HABIT GARDEN</span><h1>Little habits.<br />Lovely things grow.</h1><p>Do something kind for yourself. Water a little plant. Make a tiny world more beautiful, one day at a time.</p><div className="landing-actions"><Link href="/garden" className="pixel-button primary">Enter my guest garden <ArrowRight size={16} /></Link><span className="field-note">Your little preview stays in this browser.</span></div><GardenScene compact habits={habits} onSelect={() => router.push("/garden")} onPlant={() => router.push("/habits/new")} /></div></GardenShell>;
}
