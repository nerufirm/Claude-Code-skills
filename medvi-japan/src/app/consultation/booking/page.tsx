"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import type { AISummary } from "@/types/database";

interface StoredSummaryData {
  consultationId: string;
  summary: AISummary;
  isHighRisk: boolean;
  riskFlags: string[];
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 20) {
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
}

function generateNextDays(count: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

const CATEGORY_LABELS: Record<string, string> = {
  aga: "AGA（薄毛治療）",
  ed: "ED（勃起不全）",
  diet: "メディカルダイエット",
};

export default function BookingPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<StoredSummaryData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const days = useMemo(() => generateNextDays(7), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    const stored = sessionStorage.getItem("consultationSummary");
    if (stored) {
      setSummaryData(JSON.parse(stored));
    }
  }, []);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsConfirming(true);

    // Simulate booking confirmation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    sessionStorage.removeItem("consultationSummary");
    router.push("/mypage");
  };

  const formatDate = (date: Date) => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}/${date.getDate()}（${weekdays[date.getDay()]}）`;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/30">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold">診察予約</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ご希望の日時をお選びください
          </p>
        </div>

        {/* AI Summary Card */}
        {summaryData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                予診サマリー
              </CardTitle>
              <CardDescription>
                AIが事前問診の内容をまとめました
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {CATEGORY_LABELS[summaryData.summary.category] ??
                    summaryData.summary.category}
                </Badge>
                {summaryData.isHighRisk && (
                  <Badge variant="destructive">
                    <AlertTriangle className="size-3 mr-1" />
                    要注意
                  </Badge>
                )}
              </div>

              <Separator />

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">主訴</dt>
                <dd>{summaryData.summary.chief_complaint}</dd>

                {summaryData.summary.height_cm && (
                  <>
                    <dt className="text-muted-foreground">身長</dt>
                    <dd>{summaryData.summary.height_cm} cm</dd>
                  </>
                )}
                {summaryData.summary.weight_kg && (
                  <>
                    <dt className="text-muted-foreground">体重</dt>
                    <dd>{summaryData.summary.weight_kg} kg</dd>
                  </>
                )}
                {summaryData.summary.bmi && (
                  <>
                    <dt className="text-muted-foreground">BMI</dt>
                    <dd>{summaryData.summary.bmi}</dd>
                  </>
                )}
                {summaryData.summary.medical_history.length > 0 && (
                  <>
                    <dt className="text-muted-foreground">既往歴</dt>
                    <dd>{summaryData.summary.medical_history.join("、")}</dd>
                  </>
                )}
                {summaryData.summary.current_medications.length > 0 && (
                  <>
                    <dt className="text-muted-foreground">服用中の薬</dt>
                    <dd>
                      {summaryData.summary.current_medications.join("、")}
                    </dd>
                  </>
                )}
                {summaryData.summary.allergies.length > 0 && (
                  <>
                    <dt className="text-muted-foreground">アレルギー</dt>
                    <dd>{summaryData.summary.allergies.join("、")}</dd>
                  </>
                )}
                {summaryData.summary.desired_medication && (
                  <>
                    <dt className="text-muted-foreground">希望薬</dt>
                    <dd>{summaryData.summary.desired_medication}</dd>
                  </>
                )}
              </dl>

              {summaryData.riskFlags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      注意事項
                    </p>
                    <ul className="text-sm text-destructive/80 space-y-1 pl-5 list-disc">
                      {summaryData.riskFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              日付を選択
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {days.map((day) => {
                const isSelected =
                  selectedDate?.toDateString() === day.toDateString();
                const isSunday = day.getDay() === 0;
                return (
                  <Button
                    key={day.toISOString()}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex flex-col gap-0.5 h-auto py-2 ${
                      isSunday && !isSelected ? "text-destructive" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(null);
                    }}
                  >
                    <span className="text-xs">{formatDate(day)}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4" />
                時間を選択
              </CardTitle>
              <CardDescription>
                {formatDate(selectedDate)} の空き枠
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot;
                  // Mock: randomly disable some slots for realism
                  const isAvailable =
                    slot !== "12:00" && slot !== "12:30" && slot !== "13:00";
                  return (
                    <Button
                      key={slot}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={!isAvailable}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirm Button */}
        {selectedDate && selectedTime && (
          <div className="sticky bottom-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm">
                    <p className="font-medium">予約内容</p>
                    <p className="text-muted-foreground">
                      {formatDate(selectedDate)} {selectedTime}〜
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={isConfirming}
                >
                  {isConfirming ? "予約処理中..." : "予約を確定する"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
