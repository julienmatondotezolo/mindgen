const baseUrl: string = process.env.NEXT_PUBLIC_API_URL + "/chat/stream";

export async function fetchGeneratedTSummaryText(
  description: string,
  task: string,
  data: string,
): Promise<ReadableStream<Uint8Array> | null> {
  try {
    const response: Response = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${session.data.user.token}`,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify({ description, task, data }),
    });

    if (response.ok) {
      return response.body;
    } else {
      throw new Error("Failed to post data and stream response");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
