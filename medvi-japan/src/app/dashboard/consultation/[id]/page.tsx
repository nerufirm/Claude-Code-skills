"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import VideoCall from "@/components/video-call";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Consultation, AISummary, User, MedicationType } from "@/types/database";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  aga: { label: "AGA", color: "bg-blue-100 text-blue-800" },
  ed: { label: "ED", color: "bg-purple-100 text-purple-800" },
  diet: { label: "ダイエット", color: "bg-green-100 text-green-800" },
};

const MEDICATION_OPTIONS: Record<
  string,
  { value: MedicationType; label: string }[]
> = {
  aga: [
    { value: "aga_finasteride", label: "フィナステリド" },
    { value: "aga_dutasteride", label: "デュタステリド" },
    { value: "aga_minoxidil", label: "ミノキシジル" },
  ],
  ed: [
    { value: "ed_sildenafil", label: "シルデナフィル" },
    { value: "ed_tadalafil", label: "タダラフィル" },
  ],
  diet: [{ value: "diet_glp1", label: "GLP-1" }],
};

const PLAN_OPTIONS = [
  { value: "1", label: "1ヶ月" },
  { value: "3", label: "3ヶ月" },
  { value: "6", label: "6ヶ月" },
];

type MockConsultation = Consultation & { patient: User };

const mockConsultations: Record<string, MockConsultation> = {
  c1: {
    id: "c1",
    patient_id: "p1",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T09:00:00Z",
    ai_summary: {
      chief_complaint: "頭頂部の薄毛が気になる。半年前から進行している。",
      category: "aga",
      height_cm: 172,
      weight_kg: 68,
      bmi: 23.0,
      medical_history: ["特になし"],
      current_medications: [],
      allergies: [],
      contraindications: [],
      desired_medication: "フィナステリド",
      lifestyle_notes: "デスクワーク中心、睡眠6時間程度",
      additional_notes: null,
    },
    is_high_risk: false,
    risk_flags: [],
    status: "pre_consultation_completed",
    video_room_url: null,
    notes: null,
    created_at: "",
    updated_at: "",
    patient: {
      id: "p1",
      line_id: null,
      email: "sato@example.com",
      full_name: "佐藤 一郎",
      full_name_kana: "サトウ イチロウ",
      date_of_birth: "1990-05-12",
      gender: "male",
      phone: null,
      role: "patient",
      identity_document_url: null,
      created_at: "",
      updated_at: "",
    },
  },
  c2: {
    id: "c2",
    patient_id: "p2",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T10:00:00Z",
    ai_summary: {
      chief_complaint: "ED症状があり、パートナーとの関係に悩んでいる。",
      category: "ed",
      height_cm: 175,
      weight_kg: 82,
      bmi: 26.8,
      medical_history: ["心臓疾患の既往歴", "高血圧（治療中）"],
      current_medications: ["アムロジピン 5mg"],
      allergies: ["ペニシリン"],
      contraindications: ["硝酸薬との併用禁忌"],
      desired_medication: "タダラフィル",
      lifestyle_notes: "営業職、飲酒週3回",
      additional_notes: "心臓疾患の既往があるため慎重投与が必要",
    },
    is_high_risk: true,
    risk_flags: ["心臓疾患の既往歴"],
    status: "pre_consultation_completed",
    video_room_url: null,
    notes: null,
    created_at: "",
    updated_at: "",
    patient: {
      id: "p2",
      line_id: null,
      email: "yamada@example.com",
      full_name: "山田 健二",
      full_name_kana: "ヤマダ ケンジ",
      date_of_birth: "1985-03-20",
      gender: "male",
      phone: null,
      role: "patient",
      identity_document_url: null,
      created_at: "",
      updated_at: "",
    },
  },
  c3: {
    id: "c3",
    patient_id: "p3",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T11:30:00Z",
    ai_summary: {
      chief_complaint: "ダイエット目的。食事制限と運動では効果が出ない。",
      category: "diet",
      height_cm: 158,
      weight_kg: 72,
      bmi: 28.8,
      medical_history: ["2型糖尿病（境界型）"],
      current_medications: [],
      allergies: [],
      contraindications: [],
      desired_medication: "GLP-1",
      lifestyle_notes: "事務職、運動は週1回ヨガ",
      additional_notes: null,
    },
    is_high_risk: false,
    risk_flags: [],
    status: "pre_consultation_completed",
    video_room_url: null,
    notes: null,
    created_at: "",
    updated_at: "",
    patient: {
      id: "p3",
      line_id: null,
      email: "tanaka@example.com",
      full_name: "田中 花子",
      full_name_kana: "タナカ ハナコ",
      date_of_birth: "1992-08-15",
      gender: "female",
      phone: null,
      role: "patient",
      identity_document_url: null,
      created_at: "",
      updated_at: "",
    },
  },
  c4: {
    id: "c4",
    patient_id: "p4",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T13:00:00Z",
    ai_summary: {
      chief_complaint: "AGA治療を希望。前頭部の後退が顕著。",
      category: "aga",
      height_cm: 168,
      weight_kg: 73,
      bmi: 25.9,
      medical_history: ["肝機能異常（脂肪肝）"],
      current_medications: ["ウルソデオキシコール酸 100mg"],
      allergies: [],
      contraindications: ["肝機能障害時のフィナステリド慎重投与"],
      desired_medication: "デュタステリド",
      lifestyle_notes: "飲酒毎日、喫煙20本/日",
      additional_notes: "肝機能検査値の確認が必要",
    },
    is_high_risk: true,
    risk_flags: ["肝機能異常"],
    status: "pre_consultation_completed",
    video_room_url: null,
    notes: null,
    created_at: "",
    updated_at: "",
    patient: {
      id: "p4",
      line_id: null,
      email: "suzuki@example.com",
      full_name: "鈴木 大輔",
      full_name_kana: "スズキ ダイスケ",
      date_of_birth: "1978-11-03",
      gender: "male",
      phone: null,
      role: "patient",
      identity_document_url: null,
      created_at: "",
      updated_at: "",
    },
  },
  c5: {
    id: "c5",
    patient_id: "p5",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T14:30:00Z",
    ai_summary: {
      chief_complaint: "ED治療継続希望。前回処方のシルデナフィルで効果あり。",
      category: "ed",
      height_cm: 180,
      weight_kg: 75,
      bmi: 23.1,
      medical_history: [],
      current_medications: [],
      allergies: [],
      contraindications: [],
      desired_medication: "シルデナフィル",
      lifestyle_notes: "IT企業勤務、運動習慣あり",
      additional_notes: null,
    },
    is_high_risk: false,
    risk_flags: [],
    status: "consultation_completed",
    video_room_url: null,
    notes: null,
    created_at: "",
    updated_at: "",
    patient: {
      id: "p5",
      line_id: null,
      email: "watanabe@example.com",
      full_name: "渡辺 誠",
      full_name_kana: "ワタナベ マコト",
      date_of_birth: "1995-01-28",
      gender: "male",
      phone: null,
      role: "patient",
      identity_document_url: null,
      created_at: "",
      updated_at: "",
    },
  },
  c6: {
    id: "c6",
    patient_id: "p6",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T16:00:00Z",
    ai_summary: {
      chief_complaint: "GLP-1ダイエットに興味あり。BMI30超え。",
      category: "diet",
      height_cm: 162,
      weight_kg: 80,
      bmi: 30.5,
      medical_history: [],
      current_medications: ["ロキソプロフェン（頓用）"],
      allergies: ["スギ花粉"],
      contraindications: [],
      desired_medication: "GLP-1",
      lifestyle_notes: "在宅勤務、運動不足",
      additional_notes: null,
    },
    is_high_risk: false,
    risk_flags: [],
    status: "cancelled",
    video_room_url: null,
    notes: null,
    created_at: "",
    updated_at: "",
    patient: {
      id: "p6",
      line_id: null,
      email: "ito@example.com",
      full_name: "伊藤 美咲",
      full_name_kana: "イトウ ミサキ",
      date_of_birth: "1988-07-22",
      gender: "female",
      phone: null,
      role: "patient",
      identity_document_url: null,
      created_at: "",
      updated_at: "",
    },
  },
};

const GENDER_LABELS: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const consultation = mockConsultations[id];
  const [notes, setNotes] = useState(consultation?.notes ?? "");
  const [callStatus, setCallStatus] = useState<"待機中" | "通話中" | "終了">("待機中");
  const [videoRoomUrl, setVideoRoomUrl] = useState<string | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [dosage, setDosage] = useState("");
  const [planMonths, setPlanMonths] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!consultation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">診察データが見つかりません。</p>
      </div>
    );
  }

  const summary = consultation.ai_summary;
  const patient = consultation.patient;
  const category = summary?.category ?? "aga";
  const categoryInfo = CATEGORY_LABELS[category];
  const age = calculateAge(patient.date_of_birth);
  const medications = MEDICATION_OPTIONS[category] ?? [];

  async function handlePrescribe() {
    if (!selectedMedication || !dosage || !planMonths) return;

    setIsSubmitting(true);
    try {
      const selectedMed = medications.find((m) => m.value === selectedMedication);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          patientId: consultation.patient_id,
          medicationType: selectedMedication,
          medicationName: selectedMed?.label ?? "",
          dosage,
          planMonths: parseInt(planMonths, 10),
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
      setPrescriptionOpen(false);
    } catch {
      // Error handling would go here in production
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartCall() {
    setIsStartingCall(true);
    try {
      const response = await fetch("/api/video/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: consultation.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "ビデオルームの作成に失敗しました。");
      }

      setVideoRoomUrl(data.roomUrl);
      setVideoToken(data.token);
      setCallStatus("通話中");
    } catch (error) {
      console.error("Failed to start video call:", error);
    } finally {
      setIsStartingCall(false);
    }
  }

  const handleVideoLeave = useCallback(() => {
    setVideoRoomUrl(null);
    setVideoToken(null);
    setCallStatus("待機中");
  }, []);

  function handleCompleteConsultation() {
    router.push("/dashboard");
  }

  return (
    <div className="flex h-full gap-6">
      {/* LEFT PANEL - Patient Summary */}
      <div className="flex-[3] space-y-6 overflow-y-auto pr-2">
        {/* Patient Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {patient.full_name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {patient.full_name_kana}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {age !== null && (
              <span className="text-sm text-muted-foreground">{age}歳</span>
            )}
            {patient.gender && (
              <span className="text-sm text-muted-foreground">
                {GENDER_LABELS[patient.gender] ?? patient.gender}
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryInfo.color}`}
            >
              {categoryInfo.label}
            </span>
          </div>
        </div>

        {/* High Risk Alert */}
        {consultation.is_high_risk && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">高リスク</Badge>
              <span className="text-sm font-medium text-red-800">
                注意が必要な患者です
              </span>
            </div>
            {consultation.risk_flags.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                {consultation.risk_flags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* AI Summary */}
        {summary && (
          <>
            {/* Chief Complaint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">主訴</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{summary.chief_complaint}</p>
              </CardContent>
            </Card>

            {/* BMI & Physical */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">身体情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">身長</p>
                    <p className="text-sm font-medium">
                      {summary.height_cm ? `${summary.height_cm} cm` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">体重</p>
                    <p className="text-sm font-medium">
                      {summary.weight_kg ? `${summary.weight_kg} kg` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="text-sm font-medium">
                      {summary.bmi ? summary.bmi.toFixed(1) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">既往歴</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.medical_history.length > 0 ? (
                  <ul className="list-inside list-disc text-sm">
                    {summary.medical_history.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">特になし</p>
                )}
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">現在の服用薬</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.current_medications.length > 0 ? (
                  <ul className="list-inside list-disc text-sm">
                    {summary.current_medications.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">なし</p>
                )}
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">アレルギー</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.allergies.length > 0 ? (
                  <ul className="list-inside list-disc text-sm">
                    {summary.allergies.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">なし</p>
                )}
              </CardContent>
            </Card>

            {/* Contraindications */}
            {summary.contraindications.length > 0 && (
              <Card className="border-red-300">
                <CardHeader>
                  <CardTitle className="text-base text-red-700">
                    禁忌・注意事項
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc text-sm text-red-700">
                    {summary.contraindications.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Desired Medication */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">希望薬剤</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {summary.desired_medication ?? "特に希望なし"}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Identity Document Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">本人確認書類</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-sm text-muted-foreground">
                {patient.identity_document_url
                  ? "本人確認書類を表示"
                  : "未アップロード"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor's Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">医師メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="診察メモを入力してください..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL - Actions */}
      <div className="flex-[2] space-y-6">
        {/* Video Call */}
        {videoRoomUrl && videoToken ? (
          <VideoCall
            roomUrl={videoRoomUrl}
            token={videoToken}
            onLeave={handleVideoLeave}
            userName="医師"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ビデオ通話</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    callStatus === "待機中"
                      ? "bg-yellow-400"
                      : callStatus === "通話中"
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-400"
                  }`}
                />
                <span className="text-sm font-medium">{callStatus}</span>
              </div>
              <Button
                onClick={handleStartCall}
                disabled={callStatus === "通話中" || isStartingCall}
                className="w-full bg-green-600 text-white hover:bg-green-700"
                size="lg"
              >
                {isStartingCall
                  ? "接続中..."
                  : callStatus === "通話中"
                    ? "通話中..."
                    : "ビデオ通話を開始"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* After Consultation Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">診察後アクション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Prescription Dialog */}
            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
              <DialogTrigger
                render={
                  <Button variant="default" className="w-full" size="lg" />
                }
              >
                処方する
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>処方箋の作成</DialogTitle>
                  <DialogDescription>
                    {patient.full_name}さんへの処方内容を入力してください。
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Medication Type Select */}
                  <div className="space-y-2">
                    <Label>薬剤</Label>
                    <Select
                      value={selectedMedication}
                      onValueChange={(v) => setSelectedMedication(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="薬剤を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {medications.map((med) => (
                          <SelectItem key={med.value} value={med.value}>
                            {med.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dosage Input */}
                  <div className="space-y-2">
                    <Label>用量</Label>
                    <Input
                      placeholder="例: 1mg 1日1回"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>

                  {/* Subscription Plan Select */}
                  <div className="space-y-2">
                    <Label>定期配送プラン</Label>
                    <Select value={planMonths} onValueChange={(v) => setPlanMonths(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="プランを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_OPTIONS.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handlePrescribe}
                    disabled={
                      !selectedMedication ||
                      !dosage ||
                      !planMonths ||
                      isSubmitting
                    }
                    className="w-full"
                  >
                    {isSubmitting
                      ? "処理中..."
                      : "処方を確定し決済リンクを発行"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Complete Consultation */}
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleCompleteConsultation}
            >
              診察完了
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
