const baseUrl: string = process.env.NEXT_PUBLIC_API_URL + "/api/mindgen";

export async function fetchGeneratedTSummaryText(
  // Description: string,
  Task: string,
  // body: Record<string, any>,
): Promise<any> {
  try {
    const response: Response = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${session.data.user.token}`,
        // "ngrok-skip-browser-warning": "1",
      },
      // body: JSON.stringify({ Description, Task, ...body }),
      body: JSON.stringify({ Task }),
    });

    if (response.ok) {
      const reader = response.body.getReader();
      let result = "";

      reader.read().then(function process({ done, value }) {
        if (done) {
          return;
        }
        result += new TextDecoder("utf-8").decode(value);
        console.log("result:", result);
        return reader.read().then(process);
      });
    } else {
      throw new Error("Failed to post data and stream response");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
