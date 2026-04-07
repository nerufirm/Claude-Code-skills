"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DateRange = "today" | "week" | "month" | "custom";

const summaryCards = [
  { label: "総売上", value: "¥4,826,400" },
  { label: "AGA売上", value: "¥2,145,600" },
  { label: "ED売上", value: "¥1,582,800" },
  { label: "ダイエット売上", value: "¥1,098,000" },
];

interface RevenueRow {
  id: string;
  date: string;
  category: string;
  count: number;
  amount: number;
}

const mockRevenueData: RevenueRow[] = [
  { id: "r1", date: "2026-04-07", category: "AGA", count: 8, amount: 156800 },
  { id: "r2", date: "2026-04-07", category: "ED", count: 5, amount: 98500 },
  { id: "r3", date: "2026-04-07", category: "ダイエット", count: 3, amount: 72000 },
  { id: "r4", date: "2026-04-06", category: "AGA", count: 6, amount: 117600 },
  { id: "r5", date: "2026-04-06", category: "ED", count: 7, amount: 137900 },
  { id: "r6", date: "2026-04-05", category: "ダイエット", count: 4, amount: 96000 },
  { id: "r7", date: "2026-04-05", category: "AGA", count: 9, amount: 176400 },
  { id: "r8", date: "2026-04-04", category: "ED", count: 4, amount: 78800 },
  { id: "r9", date: "2026-04-04", category: "AGA", count: 5, amount: 98000 },
  { id: "r10", date: "2026-04-03", category: "ダイエット", count: 6, amount: 144000 },
  { id: "r11", date: "2026-04-03", category: "ED", count: 3, amount: 59100 },
  { id: "r12", date: "2026-04-02", category: "AGA", count: 7, amount: 137200 },
  { id: "r13", date: "2026-04-01", category: "ダイエット", count: 5, amount: 120000 },
  { id: "r14", date: "2026-03-31", category: "AGA", count: 8, amount: 156800 },
  { id: "r15", date: "2026-03-30", category: "ED", count: 6, amount: 118200 },
];

const CATEGORY_COLORS: Record<string, string> = {
  AGA: "bg-blue-100 text-blue-800",
  ED: "bg-purple-100 text-purple-800",
  "ダイエット": "bg-green-100 text-green-800",
};

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">売上レポート</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        売上データの確認と分析
      </p>

      {/* Date Range Tabs */}
      <Tabs
        value={dateRange}
        onValueChange={(val) => setDateRange(val as DateRange)}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="today">今日</TabsTrigger>
          <TabsTrigger value="week">今週</TabsTrigger>
          <TabsTrigger value="month">今月</TabsTrigger>
          <TabsTrigger value="custom">カスタム</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <p className="text-sm text-muted-foreground">本日の売上データを表示中</p>
        </TabsContent>
        <TabsContent value="week">
          <p className="text-sm text-muted-foreground">今週の売上データを表示中</p>
        </TabsContent>
        <TabsContent value="month">
          <p className="text-sm text-muted-foreground">今月の売上データを表示中</p>
        </TabsContent>
        <TabsContent value="custom">
          <p className="text-sm text-muted-foreground">カスタム期間を選択してください</p>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">売上明細</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>カテゴリー</TableHead>
                <TableHead>件数</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRevenueData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[row.category]}`}
                    >
                      {row.category}
                    </span>
                  </TableCell>
                  <TableCell>{row.count}件</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total */}
          <div className="mt-4 flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">合計</p>
              <p className="text-xl font-bold">
                {formatCurrency(
                  mockRevenueData.reduce((sum, row) => sum + row.amount, 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
