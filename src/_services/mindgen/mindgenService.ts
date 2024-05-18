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
      body: JSON.stringify({ description, task, data, collaboratorId }),
    });

    if (responseSummaryText.ok) {
      // If the response is okay, return the response body as a ReadableStream<Uint8Array>
      return responseSummaryText.body as ReadableStream<Uint8Array>;
    } else {
      console.error("Failed to post data and stream response");
      // If the response is not okay, return a default ReadableStream<Uint8Array> with a message
      return new ReadableStream<Uint8Array>({
        start(controller) {
          // Convert a string to Uint8Array and enqueue it to the stream
          const message = "An error occurred while fetching the summary text.";

          controller.enqueue(new TextEncoder().encode(message));
          controller.close();
        },
      });
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
      cache: "no-store",
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
      next: {
        revalidate: 0,
      },
      method: "GET",
      cache: "no-store",
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
      cache: "no-store",
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

export async function fetchCollaborator(): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseMindmap: Response = await fetch(baseUrl + `/mindmap/collaborator/all-collaborations`, {
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
    console.error("Impossible to fetch collaborators:", error);
  }
}

export async function addNewCollaborator(collaboratorObject: any): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseAddCollaborator: Response = await fetch(baseUrl + `/mindmap/collaborator`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(collaboratorObject),
    });

    if (responseAddCollaborator.ok) {
      return responseAddCollaborator;
    } else {
      throw responseAddCollaborator;
    }
  } catch (error) {
    console.error("Impossible to create collaborator:", error);
  }
}

export async function inviteAllCollaborators(collaboratorsObject: any): Promise<any> {
  const { mindmapId, invitedCollaborators } = collaboratorsObject;

  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseInvitedCollaborator: Response = await fetch(baseUrl + `/mindmap/invitation/invite/${mindmapId}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(invitedCollaborators),
    });

    if (responseInvitedCollaborator.ok) {
      return responseInvitedCollaborator;
    } else {
      throw responseInvitedCollaborator;
    }
  } catch (error) {
    console.error("Impossible to invite collaborator(s):", error);
  }
}

export async function removeCollaboratorById(collaboratorId: string): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseRemoveCollaborator: Response = await fetch(baseUrl + `/mindmap/collaborator/${collaboratorId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line prettier/prettier
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseRemoveCollaborator.ok) {
      return responseRemoveCollaborator;
    } else {
      throw responseRemoveCollaborator;
    }
  } catch (error) {
    console.error("Impossible to remove collaborator:", error);
  }
}
