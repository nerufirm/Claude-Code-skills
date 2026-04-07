"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Consultation, AISummary, User } from "@/types/database";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  aga: { label: "AGA", color: "bg-blue-100 text-blue-800" },
  ed: { label: "ED", color: "bg-purple-100 text-purple-800" },
  diet: { label: "ダイエット", color: "bg-green-100 text-green-800" },
};

const STATUS_LABELS: Record<string, string> = {
  pre_consultation_completed: "問診完了",
  consultation_completed: "診察完了",
  cancelled: "キャンセル",
};

type MockConsultation = Consultation & { patient: User };

const mockConsultations: MockConsultation[] = [
  {
    id: "c1",
    patient_id: "p1",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T09:00:00Z",
    ai_summary: { category: "aga" } as AISummary,
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
  {
    id: "c2",
    patient_id: "p2",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T10:00:00Z",
    ai_summary: { category: "ed" } as AISummary,
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
  {
    id: "c3",
    patient_id: "p3",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T11:30:00Z",
    ai_summary: { category: "diet" } as AISummary,
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
  {
    id: "c4",
    patient_id: "p4",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T13:00:00Z",
    ai_summary: { category: "aga" } as AISummary,
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
  {
    id: "c5",
    patient_id: "p5",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T14:30:00Z",
    ai_summary: { category: "ed" } as AISummary,
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
  {
    id: "c6",
    patient_id: "p6",
    doctor_id: "d1",
    scheduled_at: new Date().toISOString().split("T")[0] + "T16:00:00Z",
    ai_summary: { category: "diet" } as AISummary,
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
];

function formatTime(isoString: string | null): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">本日の予約</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date().toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">予約一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>時間</TableHead>
                <TableHead>患者名</TableHead>
                <TableHead>カテゴリー</TableHead>
                <TableHead>リスク</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockConsultations.map((consultation) => {
                const category =
                  consultation.ai_summary?.category ?? "aga";
                const categoryInfo = CATEGORY_LABELS[category];

                return (
                  <TableRow
                    key={consultation.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/dashboard/consultation/${consultation.id}`
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {formatTime(consultation.scheduled_at)}
                    </TableCell>
                    <TableCell>{consultation.patient.full_name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryInfo.color}`}
                      >
                        {categoryInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {consultation.is_high_risk && (
                        <Badge variant="destructive">高リスク</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {STATUS_LABELS[consultation.status] ??
                          consultation.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
