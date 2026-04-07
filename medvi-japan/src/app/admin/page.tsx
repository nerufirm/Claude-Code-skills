"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const kpiCards = [
  { label: "本日の予約数", value: "24", sub: "前日比 +3" },
  { label: "本日の売上", value: "¥387,200", sub: "前日比 +12%" },
  { label: "登録患者数", value: "1,847", sub: "今月 +58" },
  { label: "アクティブ処方数", value: "312", sub: "継続率 89%" },
];

const recentConsultations = [
  {
    id: "c1",
    patient: "佐藤 一郎",
    doctor: "田中 太郎",
    category: "AGA",
    time: "09:00",
    status: "完了",
  },
  {
    id: "c2",
    patient: "山田 健二",
    doctor: "鈴木 花子",
    category: "ED",
    time: "10:30",
    status: "進行中",
  },
  {
    id: "c3",
    patient: "高橋 美咲",
    doctor: "田中 太郎",
    category: "ダイエット",
    time: "11:00",
    status: "待機中",
  },
  {
    id: "c4",
    patient: "渡辺 誠",
    doctor: "伊藤 直樹",
    category: "AGA",
    time: "13:00",
    status: "完了",
  },
  {
    id: "c5",
    patient: "中村 大輔",
    doctor: "鈴木 花子",
    category: "ED",
    time: "14:30",
    status: "待機中",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  AGA: "bg-blue-100 text-blue-800",
  ED: "bg-purple-100 text-purple-800",
  "ダイエット": "bg-green-100 text-green-800",
};

const STATUS_COLORS: Record<string, string> = {
  "完了": "bg-gray-100 text-gray-700",
  "進行中": "bg-yellow-100 text-yellow-800",
  "待機中": "bg-blue-50 text-blue-700",
};

const weeklyRevenue = [
  { day: "月", amount: 52000, max: 85000 },
  { day: "火", amount: 68000, max: 85000 },
  { day: "水", amount: 45000, max: 85000 },
  { day: "木", amount: 85000, max: 85000 },
  { day: "金", amount: 72000, max: 85000 },
  { day: "土", amount: 38000, max: 85000 },
  { day: "日", amount: 27200, max: 85000 },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">管理ダッシュボード</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date().toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Consultations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">最近の診察</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>患者名</TableHead>
                  <TableHead>担当医</TableHead>
                  <TableHead>カテゴリー</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentConsultations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.time}</TableCell>
                    <TableCell>{c.patient}</TableCell>
                    <TableCell>{c.doctor}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[c.category]}`}
                      >
                        {c.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={STATUS_COLORS[c.status]}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">週間売上</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2" style={{ height: 180 }}>
              {weeklyRevenue.map((d) => (
                <div
                  key={d.day}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs text-muted-foreground">
                    ¥{(d.amount / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{
                      height: `${(d.amount / d.max) * 140}px`,
                    }}
                  />
                  <span className="text-xs font-medium">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <Button>新規医師を追加</Button>
        <Button variant="outline">レポートを出力</Button>
      </div>
    </div>
  );
}
