const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
// const baseUrl: string = process.env.NEXT_PUBLIC_TEST_API_URL + "/api/mindgen";

export async function fetchGeneratedTSummaryText(
  description: string,
  task: string,
  data: string | undefined,
  collaboratorId: string | null,
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
      body: JSON.stringify({ description, task, data, collaboratorId: collaboratorId }),
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

export async function fetchApi(): Promise<any> {
  try {
    const responseProfile: Response = await fetch(baseUrl + `/user/ping`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseProfile.ok) {
      return responseProfile;
    } else {
      throw responseProfile;
    }
  } catch (error) {
    console.error("Impossible to ACCESS MINDGEN API:", error);
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

export async function fetchMindmaps(): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseMindmap: Response = await fetch(baseUrl + `/mindmap`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseMindmap.ok) {
      return responseMindmap.json();
    } else {
      throw responseMindmap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function createMindmap(mindmapObject: any): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseCreatedMindMap: Response = await fetch(baseUrl + `/mindmap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(mindmapObject),
    });

    if (responseCreatedMindMap.ok) {
      return responseCreatedMindMap;
    } else {
      throw responseCreatedMindMap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function getMindmapById(mindmapId: string): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseMindMap: Response = await fetch(baseUrl + `/mindmap/${mindmapId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseMindMap.ok) {
      return responseMindMap.json();
    } else {
      throw responseMindMap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function updateMindmapById({
  mindmapId,
  mindmapObject,
}: {
  mindmapId: string | undefined;
  mindmapObject: any;
}): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseUpdatedMindMap: Response = await fetch(baseUrl + `/mindmap/${mindmapId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(mindmapObject),
    });

    if (responseUpdatedMindMap.ok) {
      return responseUpdatedMindMap;
    } else {
      throw responseUpdatedMindMap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function deleteMindmapById(mindmapId: string): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseDeletedMindMap: Response = await fetch(baseUrl + `/mindmap/${mindmapId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseDeletedMindMap.ok) {
      return responseDeletedMindMap;
    } else {
      throw responseDeletedMindMap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}
