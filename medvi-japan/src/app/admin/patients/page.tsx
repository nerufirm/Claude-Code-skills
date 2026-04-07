"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MockPatient {
  id: string;
  name: string;
  email: string;
  lineLinked: boolean;
  registeredAt: string;
  consultationCount: number;
  status: "active" | "inactive";
}

const mockPatients: MockPatient[] = [
  {
    id: "p1",
    name: "佐藤 一郎",
    email: "sato.ichiro@example.com",
    lineLinked: true,
    registeredAt: "2025-08-12",
    consultationCount: 5,
    status: "active",
  },
  {
    id: "p2",
    name: "山田 健二",
    email: "yamada.kenji@example.com",
    lineLinked: false,
    registeredAt: "2025-09-03",
    consultationCount: 3,
    status: "active",
  },
  {
    id: "p3",
    name: "田中 花子",
    email: "tanaka.hanako@example.com",
    lineLinked: true,
    registeredAt: "2025-07-20",
    consultationCount: 8,
    status: "active",
  },
  {
    id: "p4",
    name: "鈴木 大輔",
    email: "suzuki.daisuke@example.com",
    lineLinked: true,
    registeredAt: "2025-10-15",
    consultationCount: 2,
    status: "active",
  },
  {
    id: "p5",
    name: "渡辺 誠",
    email: "watanabe.makoto@example.com",
    lineLinked: false,
    registeredAt: "2025-11-01",
    consultationCount: 1,
    status: "inactive",
  },
  {
    id: "p6",
    name: "伊藤 美咲",
    email: "ito.misaki@example.com",
    lineLinked: true,
    registeredAt: "2025-06-18",
    consultationCount: 12,
    status: "active",
  },
  {
    id: "p7",
    name: "高橋 翔太",
    email: "takahashi.shota@example.com",
    lineLinked: false,
    registeredAt: "2025-12-05",
    consultationCount: 0,
    status: "active",
  },
  {
    id: "p8",
    name: "中村 裕子",
    email: "nakamura.yuko@example.com",
    lineLinked: true,
    registeredAt: "2025-05-22",
    consultationCount: 15,
    status: "active",
  },
  {
    id: "p9",
    name: "小林 拓也",
    email: "kobayashi.takuya@example.com",
    lineLinked: true,
    registeredAt: "2026-01-10",
    consultationCount: 4,
    status: "inactive",
  },
  {
    id: "p10",
    name: "加藤 恵",
    email: "kato.megumi@example.com",
    lineLinked: false,
    registeredAt: "2026-02-28",
    consultationCount: 2,
    status: "active",
  },
];

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.name.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">患者管理</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        登録患者の一覧と管理
      </p>

      {/* Search */}
      <div className="mt-6 max-w-sm">
        <Input
          placeholder="名前またはメールで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Patient Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">患者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>患者名</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>LINE連携</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead>診察回数</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer"
                  onClick={() => alert(`患者ID: ${patient.id}`)}
                >
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.email}
                  </TableCell>
                  <TableCell>
                    {patient.lineLinked ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        連携済み
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600"
                      >
                        未連携
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{patient.registeredAt}</TableCell>
                  <TableCell>{patient.consultationCount}回</TableCell>
                  <TableCell>
                    {patient.status === "active" ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        アクティブ
                      </Badge>
                    ) : (
                      <Badge variant="destructive">停止</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              全30件中 1-10件を表示
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                前へ
              </Button>
              <Button variant="outline" size="sm">
                次へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
