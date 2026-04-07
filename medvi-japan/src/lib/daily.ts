const DAILY_API_BASE = "https://api.daily.co/v1";

function getApiKey(): string {
  const key = process.env.DAILY_API_KEY;
  if (!key) {
    throw new Error("DAILY_API_KEY environment variable is not set");
  }
  return key;
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };
}

interface DailyRoom {
  url: string;
  name: string;
}

export async function createDailyRoom(
  consultationId: string
): Promise<DailyRoom> {
  const exp = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes

  const response = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: `medvi-${consultationId}`,
      properties: {
        max_participants: 2,
        enable_chat: false,
        exp,
        enable_screenshare: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Daily room: ${error}`);
  }

  const data = await response.json();
  return { url: data.url, name: data.name };
}

export async function createMeetingToken(
  roomName: string,
  isOwner: boolean
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes

  const response = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        exp,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create meeting token: ${error}`);
  }

  const data = await response.json();
  return data.token;
}
