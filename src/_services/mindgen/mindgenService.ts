// const baseUrl: string = process.env.NEXT_PUBLIC_API_URL + "/chat/stream";
const baseUrl: string = process.env.NEXT_PUBLIC_TEST_API_URL + "/api/mindgen";

export async function fetchGeneratedTSummaryText(
  description: string,
  task: string,
  data: string | undefined,
): Promise<ReadableStream<Uint8Array>> {
  try {
    const response: Response = await fetch(baseUrl, {
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
      return response.body as ReadableStream<Uint8Array>;
    } else {
      console.error("Failed to post data and stream response");
      // Return a default empty ReadableStream if the response is not okay
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.close();
        },
      });
      // throw new Error("Failed to post data and stream response");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
