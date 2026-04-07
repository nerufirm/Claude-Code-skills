"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
} from "@daily-co/daily-js";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface VideoCallProps {
  roomUrl: string;
  token: string;
  onLeave?: () => void;
  userName?: string;
}

export default function VideoCall({
  roomUrl,
  token,
  onLeave,
  userName,
}: VideoCallProps) {
  const callRef = useRef<DailyCall | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);

  const handleLeave = useCallback(() => {
    if (callRef.current) {
      callRef.current.leave();
      callRef.current.destroy();
      callRef.current = null;
    }
    onLeave?.();
  }, [onLeave]);

  useEffect(() => {
    const callObject = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: true,
    });
    callRef.current = callObject;

    function attachTrack(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participant: any,
      kind: "video" | "audio",
      ref: React.RefObject<HTMLVideoElement | null>
    ) {
      const track = participant?.tracks?.[kind]?.persistentTrack as MediaStreamTrack | undefined;
      if (track && ref.current) {
        const stream = new MediaStream([track]);
        ref.current.srcObject = stream;
      }
    }

    function updateParticipantCount() {
      if (!callRef.current) return;
      const participants = callRef.current.participants();
      setParticipantCount(Object.keys(participants).length);
    }

    callObject.on("joined-meeting", () => {
      setIsJoining(false);
      const local = callObject.participants().local;
      if (local) {
        attachTrack(local, "video", localVideoRef);
      }
      updateParticipantCount();
    });

    callObject.on(
      "participant-joined",
      (event?: DailyEventObjectParticipant) => {
        if (event && !event.participant.local) {
          attachTrack(event.participant, "video", remoteVideoRef);
        }
        updateParticipantCount();
      }
    );

    callObject.on("track-started", (event) => {
      if (!event) return;
      const participant = event.participant;
      if (!participant) return;
      if (participant.local) {
        attachTrack(participant, "video", localVideoRef);
      } else {
        attachTrack(participant, "video", remoteVideoRef);
      }
    });

    callObject.on(
      "participant-left",
      (_event?: DailyEventObjectParticipantLeft) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        updateParticipantCount();
      }
    );

    callObject.on("error", (event) => {
      console.error("Daily error:", event);
      setError("通話中にエラーが発生しました。");
    });

    callObject.on("camera-error", (event) => {
      console.error("Camera error:", event);
      setError(
        "カメラまたはマイクへのアクセスが拒否されました。ブラウザの設定を確認してください。"
      );
    });

    callObject
      .join({
        url: roomUrl,
        token,
        userName: userName ?? "参加者",
      })
      .catch((err: unknown) => {
        console.error("Failed to join call:", err);
        setError("通話への接続に失敗しました。");
        setIsJoining(false);
      });

    return () => {
      callObject.leave().catch(() => {});
      callObject.destroy();
      callRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUrl, token, userName]);

  function toggleMic() {
    if (!callRef.current) return;
    const newState = !isMicOn;
    callRef.current.setLocalAudio(newState);
    setIsMicOn(newState);
  }

  function toggleCamera() {
    if (!callRef.current) return;
    const newState = !isCameraOn;
    callRef.current.setLocalVideo(newState);
    setIsCameraOn(newState);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-gray-900 p-8 text-white">
        <p className="mb-4 text-sm text-red-400">{error}</p>
        <Button variant="outline" onClick={handleLeave} className="text-white">
          閉じる
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-gray-900">
      {/* Video area */}
      <div className="relative aspect-video w-full bg-black">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Joining overlay */}
        {isJoining && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <p className="text-sm text-white">接続中...</p>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-3 right-3 h-28 w-40 overflow-hidden rounded-lg border-2 border-gray-700 bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        </div>

        {/* Participant count */}
        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          参加者: {participantCount}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 bg-gray-900 py-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMic}
          className={`h-12 w-12 rounded-full border-gray-600 ${
            isMicOn
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
          aria-label={isMicOn ? "マイクをオフ" : "マイクをオン"}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleCamera}
          className={`h-12 w-12 rounded-full border-gray-600 ${
            isCameraOn
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
          aria-label={isCameraOn ? "カメラをオフ" : "カメラをオン"}
        >
          {isCameraOn ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleLeave}
          className="h-12 w-12 rounded-full bg-red-600 text-white hover:bg-red-700"
          aria-label="通話終了"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      <p className="pb-2 text-center text-xs text-gray-400">通話終了</p>
    </div>
  );
}
