"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Pill,
  User,
  Video,
  Truck,
  Calendar,
} from "lucide-react";
import type {
  ConsultationStatus,
  PrescriptionStatus,
  ShippingStatus,
} from "@/types/database";

// --- Mock Data ---

interface MockConsultation {
  id: string;
  category: string;
  status: ConsultationStatus;
  scheduledAt: string | null;
  chiefComplaint: string;
  doctorName: string | null;
}

interface MockPrescription {
  id: string;
  medicationName: string;
  dosage: string;
  prescriptionStatus: PrescriptionStatus;
  shippingStatus: ShippingStatus | null;
  nextDeliveryDate: string | null;
}

const MOCK_CONSULTATIONS: MockConsultation[] = [
  {
    id: "c1",
    category: "AGA",
    status: "consultation_completed",
    scheduledAt: "2026-04-05T10:00:00",
    chiefComplaint: "薄毛が気になる。前頭部が薄くなってきた。",
    doctorName: "田中 太郎",
  },
  {
    id: "c2",
    category: "メディカルダイエット",
    status: "pre_consultation_completed",
    scheduledAt: "2026-04-10T14:30:00",
    chiefComplaint: "体重を減らしたい。GLP-1に興味がある。",
    doctorName: null,
  },
];

const MOCK_PRESCRIPTIONS: MockPrescription[] = [
  {
    id: "p1",
    medicationName: "フィナステリド 1mg",
    dosage: "1日1回 1錠",
    prescriptionStatus: "active",
    shippingStatus: "delivered",
    nextDeliveryDate: "2026-05-05",
  },
  {
    id: "p2",
    medicationName: "ミノキシジル外用 5%",
    dosage: "1日2回 1mLずつ塗布",
    prescriptionStatus: "active",
    shippingStatus: "shipped",
    nextDeliveryDate: "2026-05-05",
  },
];

const MOCK_USER = {
  fullName: "山田 花子",
  email: "hanako@example.com",
  lineId: "@hanako_y",
  phone: "090-1234-5678",
  dateOfBirth: "1990-03-15",
};

// --- Helpers ---

const STATUS_LABELS: Record<ConsultationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pre_consultation_completed: { label: "予診完了", variant: "secondary" },
  consultation_completed: { label: "診察完了", variant: "default" },
  cancelled: { label: "キャンセル", variant: "destructive" },
};

const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "承認待ち", variant: "outline" },
  active: { label: "処方中", variant: "default" },
  paused: { label: "一時停止", variant: "secondary" },
  cancelled: { label: "中止", variant: "destructive" },
};

const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  preparing: "準備中",
  shipped: "配送中",
  delivered: "配達済み",
};

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("consultations");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/30">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">マイページ</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="consultations" className="flex-1 gap-1.5">
              <ClipboardList className="size-3.5" />
              診察履歴
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex-1 gap-1.5">
              <Pill className="size-3.5" />
              処方・配送
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-1 gap-1.5">
              <User className="size-3.5" />
              アカウント
            </TabsTrigger>
          </TabsList>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <div className="space-y-3 mt-4">
              {MOCK_CONSULTATIONS.map((c) => {
                const statusInfo = STATUS_LABELS[c.status];
                return (
                  <Card key={c.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{c.category}</CardTitle>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {c.scheduledAt && (
                        <CardDescription className="flex items-center gap-1.5">
                          <Calendar className="size-3" />
                          {new Date(c.scheduledAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {c.chiefComplaint}
                      </p>
                      {c.doctorName && (
                        <p className="text-sm">
                          担当医: {c.doctorName}
                        </p>
                      )}
                      {c.status === "pre_consultation_completed" &&
                        c.scheduledAt && (
                          <Button size="sm" variant="outline" className="mt-2">
                            <Video className="size-3.5" />
                            診察に参加する
                          </Button>
                        )}
                    </CardContent>
                  </Card>
                );
              })}

              {MOCK_CONSULTATIONS.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    診察履歴はまだありません
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <div className="space-y-3 mt-4">
              {MOCK_PRESCRIPTIONS.map((p) => {
                const statusInfo = PRESCRIPTION_STATUS_LABELS[p.prescriptionStatus];
                return (
                  <Card key={p.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {p.medicationName}
                        </CardTitle>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <CardDescription>{p.dosage}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {p.shippingStatus && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Truck className="size-3.5 text-muted-foreground" />
                          <span>
                            配送状況:{" "}
                            {SHIPPING_STATUS_LABELS[p.shippingStatus]}
                          </span>
                        </div>
                      )}
                      {p.nextDeliveryDate && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>
                            次回配送予定:{" "}
                            {new Date(p.nextDeliveryDate).toLocaleDateString(
                              "ja-JP",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {MOCK_PRESCRIPTIONS.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    処方情報はまだありません
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>プロフィール</CardTitle>
                  <CardDescription>登録情報の確認</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">氏名</dt>
                      <dd className="text-sm font-medium">
                        {MOCK_USER.fullName}
                      </dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        メールアドレス
                      </dt>
                      <dd className="text-sm">{MOCK_USER.email}</dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-xs text-muted-foreground">LINE ID</dt>
                      <dd className="text-sm">{MOCK_USER.lineId}</dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        電話番号
                      </dt>
                      <dd className="text-sm">{MOCK_USER.phone}</dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        生年月日
                      </dt>
                      <dd className="text-sm">
                        {new Date(MOCK_USER.dateOfBirth).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
