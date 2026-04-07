import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Smartphone } from "lucide-react";

const FEATURES = [
  {
    emoji: "💊",
    title: "AGA治療（薄毛）",
    description:
      "フィナステリド・デュタステリド・ミノキシジルなど、医学的根拠に基づいた治療薬をオンライン診療で処方。自宅に届きます。",
  },
  {
    emoji: "💪",
    title: "ED治療",
    description:
      "シルデナフィル・タダラフィルなどのED治療薬を、プライバシーに配慮したオンライン診療で処方いたします。",
  },
  {
    emoji: "🏃",
    title: "メディカルダイエット（GLP-1）",
    description:
      "GLP-1受容体作動薬を用いた医療ダイエット。医師の管理のもと、安全に体重管理をサポートします。",
  },
];

const BENEFITS = [
  {
    icon: Smartphone,
    title: "スマホで完結",
    description: "予診から処方まで、すべてオンラインで完結",
  },
  {
    icon: Clock,
    title: "最短当日発送",
    description: "診察後すぐに処方。最短で当日発送いたします",
  },
  {
    icon: Shield,
    title: "安心の医師診察",
    description: "AI予診のあと、必ず医師がビデオ診察を行います",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            オンライン診療で、
            <br />
            <span className="text-primary">もっと手軽に</span>健康管理
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AGA・ED・メディカルダイエットの専門オンライン診療。
            AIによる事前問診で、スムーズに医師の診察を受けられます。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/consultation/chat">
              <Button size="lg" className="text-base px-6">
                無料で相談する
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Treatment Cards */}
      <section className="px-4 py-12 sm:py-16 bg-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">
            診療メニュー
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="hover:ring-primary/30 transition-shadow">
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.emoji}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">
            Medvi Japanの特徴
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center space-y-2">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <benefit.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 sm:py-16 bg-background">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold">まずは無料で相談してみませんか？</h2>
          <p className="text-sm text-muted-foreground">
            AIが事前に症状をお伺いし、スムーズに医師の診察につなげます。
          </p>
          <Link href="/consultation/chat">
            <Button size="lg" className="text-base px-6">
              無料で相談する
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        <p>&copy; 2026 Medvi Japan. All rights reserved.</p>
      </footer>
    </div>
  );
}
