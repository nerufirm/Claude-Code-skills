"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MockDoctor {
  id: string;
  name: string;
  specialty: string;
  todayAppointments: number;
  monthlyConsultations: number;
  status: "active" | "inactive";
}

const mockDoctors: MockDoctor[] = [
  {
    id: "d1",
    name: "田中 太郎",
    specialty: "AGA",
    todayAppointments: 8,
    monthlyConsultations: 142,
    status: "active",
  },
  {
    id: "d2",
    name: "鈴木 花子",
    specialty: "ED",
    todayAppointments: 6,
    monthlyConsultations: 118,
    status: "active",
  },
  {
    id: "d3",
    name: "伊藤 直樹",
    specialty: "ダイエット",
    todayAppointments: 5,
    monthlyConsultations: 95,
    status: "active",
  },
  {
    id: "d4",
    name: "山本 恵理",
    specialty: "全般",
    todayAppointments: 0,
    monthlyConsultations: 67,
    status: "inactive",
  },
  {
    id: "d5",
    name: "佐々木 健一",
    specialty: "AGA",
    todayAppointments: 7,
    monthlyConsultations: 130,
    status: "active",
  },
];

export default function DoctorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    specialty: "",
    licenseNumber: "",
  });

  const handleSubmit = () => {
    alert(
      `新規医師を追加:\n名前: ${newDoctor.name}\nメール: ${newDoctor.email}\n専門: ${newDoctor.specialty}\n医師免許番号: ${newDoctor.licenseNumber}`
    );
    setDialogOpen(false);
    setNewDoctor({ name: "", email: "", specialty: "", licenseNumber: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">医師管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            登録医師の一覧と管理
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>新規医師を追加</DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>新規医師を追加</DialogTitle>
              <DialogDescription>
                新しい医師の情報を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="doctor-name">氏名</Label>
                <Input
                  id="doctor-name"
                  placeholder="例: 山田 太郎"
                  value={newDoctor.name}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doctor-email">メールアドレス</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  placeholder="例: yamada@example.com"
                  value={newDoctor.email}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>専門分野</Label>
                <Select
                  value={newDoctor.specialty}
                  onValueChange={(val) =>
                    setNewDoctor({ ...newDoctor, specialty: val ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="専門分野を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGA">AGA</SelectItem>
                    <SelectItem value="ED">ED</SelectItem>
                    <SelectItem value="ダイエット">ダイエット</SelectItem>
                    <SelectItem value="全般">全般</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doctor-license">医師免許番号</Label>
                <Input
                  id="doctor-license"
                  placeholder="例: 123456"
                  value={newDoctor.licenseNumber}
                  onChange={(e) =>
                    setNewDoctor({
                      ...newDoctor,
                      licenseNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit}>追加する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctors Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">医師一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>医師名</TableHead>
                <TableHead>専門分野</TableHead>
                <TableHead>本日の予約数</TableHead>
                <TableHead>今月の診察数</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {doctor.specialty}
                    </span>
                  </TableCell>
                  <TableCell>{doctor.todayAppointments}件</TableCell>
                  <TableCell>{doctor.monthlyConsultations}件</TableCell>
                  <TableCell>
                    {doctor.status === "active" ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        アクティブ
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600"
                      >
                        休止中
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
