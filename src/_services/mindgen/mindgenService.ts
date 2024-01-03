const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
// const baseUrl: string = process.env.NEXT_PUBLIC_TEST_API_URL + "/api/mindgen";

export async function fetchGeneratedTSummaryText(
  description: string,
  task: string,
  data: string | undefined,
): Promise<ReadableStream<Uint8Array>> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseSummaryText: Response = await fetch(baseUrl + "/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify({ description, task, data, collaboratorId: "c4a97e6b-cac5-41b1-9d29-4e8da67ec050" }),
    });

    if (responseSummaryText.ok) {
      return responseSummaryText.body as ReadableStream<Uint8Array>;
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

export async function fetchProfile(): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseProfile: Response = await fetch(baseUrl + `/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseProfile.ok) {
      return responseProfile.json();
    } else {
      throw responseProfile;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}
