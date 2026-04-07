"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import VideoCall from "@/components/video-call";

export default function PatientVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    async function joinRoom() {
      try {
        const response = await fetch("/api/video/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultationId: id }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "接続に失敗しました。");
        }

        setRoomUrl(data.roomUrl);
        setToken(data.token);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "接続に失敗しました。"
        );
      } finally {
        setIsLoading(false);
      }
    }

    joinRoom();
  }, [id]);

  const handleLeave = useCallback(() => {
    setCallEnded(true);
    setRoomUrl(null);
    setToken(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <h1 className="text-lg font-semibold text-gray-800">診察室</h1>
          <p className="mt-2 text-sm text-gray-500">準備中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">診察室</h1>
          <p className="mt-2 text-sm text-red-500">{error}</p>
          <Link
            href="/mypage"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
          >
            マイページに戻る
          </Link>
        </div>
      </div>
    );
  }

  // Call ended state
  if (callEnded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">診察室</h1>
          <p className="mt-4 text-sm text-gray-600">
            診察が終了しました
          </p>
          <p className="mt-1 text-xs text-gray-400">
            ご利用ありがとうございました。
          </p>
          <Link
            href="/mypage"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
          >
            マイページに戻る
          </Link>
        </div>
      </div>
    );
  }

  // Active call
  if (roomUrl && token) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-900">
        <header className="flex items-center justify-center bg-gray-800 py-3">
          <h1 className="text-sm font-medium text-white">診察室</h1>
        </header>
        <div className="mx-auto w-full max-w-3xl flex-1 p-4">
          <VideoCall
            roomUrl={roomUrl}
            token={token}
            onLeave={handleLeave}
            userName="患者"
          />
        </div>
      </div>
    );
  }

  return null;
}
