import { CustomSession } from "@/_types";

/* eslint-disable prettier/prettier */
const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
// const baseUrl: string = process.env.NEXT_PUBLIC_TEST_API_URL + "/api/mindgen";

/* ======================================================= */  
/* ==================   STREAM CHAT RESPONSE   ================== */
/* ======================================================= */

export async function fetchGeneratedSummaryText(
  { 
    session,
    conversationId,
    mindmapId,
    organizationMemberId,
    description,
    task,
    data,
  }: 
  {
    session: CustomSession | null, 
    conversationId: string,
    mindmapId: string,
    organizationMemberId: string | null,
    description: string,
    task: string,
    data: any,
  }
): Promise<ReadableStream<Uint8Array>> {
  if(session)
    try {
      const bodyData = conversationId ? {
        conversationId,
        mindmapId,
        organizationMemberId,
        description,
        task,
        data,
      } : {
        mindmapId,
        organizationMemberId,
        description,
        task,
        data,
      };

      const responseSummaryText: Response = await fetch(baseUrl + "/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(bodyData),
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

  return new ReadableStream({
    async start(controller) {
      const message = "No active session found.";
      const encoder = new TextEncoder();

      controller.enqueue(encoder.encode(message));
      controller.close();
    },
  }); 
}

/* ================================================= */  
/* ==================   PROFILE   ================== */
/* ================================================= */ 

export async function fetchProfile({ session }: {session: CustomSession | null}): Promise<any> {
  if(session)
    try {
      const responseProfile: Response = await fetch(baseUrl + `/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
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

/* ======================================================= */  
/* ==================   ORGANIZATIONS   ================== */
/* ======================================================= */

export async function fetchOrganization(): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();
    
    const responseOrganization: Response = await fetch(baseUrl + `/organization`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseOrganization.ok) {
      return responseOrganization.json();
    } else {
      throw responseOrganization;
    }
  } catch (error) {
    console.error("Impossible to fetch organization:", error);
  }
}

export async function getOrganizationById({ organizationId }: {organizationId: string}): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseMindMap: Response = await fetch(baseUrl + `/organization/${organizationId}`, {
      next: {
        revalidate: 0,
      },
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseMindMap.ok) {
      return responseMindMap.json();
    } else {
      throw new Error(`HTTP error status: ${responseMindMap.status}`);
    }
  } catch (error: any) {
    throw new Error(`Fetch error: ${error.message}`);
  }
}

export async function createOrganization(organizationObject: any): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseCreatedOrganization: Response = await fetch(baseUrl + `/organization`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(organizationObject),
    });

    if (responseCreatedOrganization.ok) {
      return await responseCreatedOrganization.json();
    } else {
      throw responseCreatedOrganization;
    }
  } catch (error) {
    console.error("Impossible to create organization:", error);
  }
}

export async function updateOrganization({ organizationId, organizationObject }: { organizationId: string, organizationObject: any }): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseUpdateOrganization: Response = await fetch(baseUrl + `/organization/${organizationId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(organizationObject),
    });

    if (responseUpdateOrganization.ok) {
      return await responseUpdateOrganization.json();
    } else {
      throw responseUpdateOrganization;
    }
  } catch (error) {
    console.error("Impossible to update organization:", error);
  }
}

export async function deleteOrganizationById({ organizationId }: { organizationId: string }): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseDeletedOrganization: Response = await fetch(baseUrl + `/organization/${organizationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseDeletedOrganization.ok) {
      return responseDeletedOrganization;
    } else {
      throw responseDeletedOrganization;
    }
  } catch (error) {
    console.error("Impossible to delete organization:", error);
  }
}

/* ================================================== */  
/* ==================   MINDMAPS   ================== */
/* ================================================== */   

export async function fetchMindmaps({ organizationId }: {organizationId: string}): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseMindmap: Response = await fetch(baseUrl + `/mindmap/organization/${organizationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
    console.error("Impossible to fetch mindmaps:", error);
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
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(mindmapObject),
    });

    if (responseCreatedMindMap.ok) {
      return responseCreatedMindMap.body;
    } else {
      throw responseCreatedMindMap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function getMindmapById({ session, mindmapId }: {session: CustomSession | null, mindmapId: string}): Promise<any> {
  if(session)
    try {
      let headers: any = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      };

      if (session?.data.session !== null) headers["Authorization"] = `Bearer ${session.data.session.user.token}`;

      const responseMindMap: Response = await fetch(baseUrl + `/mindmap/${mindmapId}`, {
        next: {
          revalidate: 0,
        },
        method: "GET",
        cache: "no-store",
        headers: headers,
      });

      if (responseMindMap.ok) {
        return responseMindMap.json();
      } else {
        throw new Error(`HTTP error status: ${responseMindMap.status}`);
      }
    } catch (error: any) {
      throw new Error(`Fetch error: ${error.message}`);
    }
}

export async function updateMindmapById({
  session,
  mindmapId,
  mindmapObject,
}: {
  session: CustomSession | null
  mindmapId: string | undefined;
  mindmapObject: any;
}): Promise<any> {
  if(session)
    try {
      const responseUpdatedMindMap: Response = await fetch(baseUrl + `/mindmap/${mindmapId}`, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.data.session.user.token}`,
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

export async function leaveMindmap(collaboratorId: string): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseLeaveMindmap: Response = await fetch(baseUrl + `/mindmap/collaborator/leave/${collaboratorId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseLeaveMindmap.ok) {
      return responseLeaveMindmap;
    } else {
      throw responseLeaveMindmap;
    }
  } catch (error) {
    console.error("Impossible to leave mindmap:", error);
  }
}

/* ======================================================= */  
/* ==================   COLLABORATORS   ================== */
/* ======================================================= */  

export async function fetchCollaborator(): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseMindmap: Response = await fetch(baseUrl + `/mindmap/collaborator/all-collaborations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

/* ===================================================== */  
/* ==================   INVITATIONS   ================== */
/* ===================================================== */  

export async function fetchInvitations({ session }: { session: CustomSession | null }): Promise<any> {
  if(session)
    try {
      const responseInvitations: Response = await fetch(baseUrl + `/mindmap/invitation`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (responseInvitations.ok) {
        return responseInvitations.json();
      } else {
        throw responseInvitations;
      }
    } catch (error) {
      console.error("Impossible to fetch invitations:", error);
    }
}

export async function createInvitations({ session, invitationObject }: { session: CustomSession | null, invitationObject: any }): Promise<any> {
  if(session)
    try {
      const responseInvitations: Response = await fetch(baseUrl + `/organization/invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(invitationObject),
      });

      if (responseInvitations.ok) {
        return responseInvitations.json();
      } else {
        throw responseInvitations;
      }
    } catch (error) {
      console.error("Impossible to fetch invitations:", error);
    }
}

export async function acceptInvitation(invitationId: string): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseInvitations: Response = await fetch(baseUrl + `/mindmap/invitation/accept/${invitationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseInvitations.ok) {
      return responseInvitations;
    } else {
      throw responseInvitations;
    }
  } catch (error) {
    console.error("Impossible to accept invitations:", error);
  }
}

/* ========================================================= */  
/* ==================   MEMBERS & ROLES   ================== */
/* ========================================================= */  

export async function inviteAllMembers(membersObject: any): Promise<any> {
  const { mindmapId, invitedMembers } = membersObject;

  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseInvitedMembers: Response = await fetch(baseUrl + `/mindmap/invitation/invite/${mindmapId}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(invitedMembers),
    });

    if (responseInvitedMembers.ok) {
      return responseInvitedMembers.json();
    } else {
      throw responseInvitedMembers;
    }
  } catch (error) {
    console.error("Impossible to invite Member(s):", error);
  }
}

export async function updateMembers({ session, mindmapId, membersToUpdate }: {session: CustomSession | null, mindmapId: string, membersToUpdate: any}): Promise<any> {
  if (session)
    try {
      const responseUpdatedCollaborator: Response = await fetch(baseUrl + `/mindmap/${mindmapId}/member-roles`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(membersToUpdate),
      });

      if (responseUpdatedCollaborator.ok) {
        return responseUpdatedCollaborator.json();
      } else {
        throw responseUpdatedCollaborator;
      }
    } catch (error) {
      console.error("Impossible to invite collaborator(s):", error);
    }
}

export async function transferOwnership(collaboratorId: any): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responsetransferOwnership: Response = await fetch(
      baseUrl + `/mindmap/collaborator/ownership/${collaboratorId}`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
      },
    );

    if (responsetransferOwnership.ok) {
      return responsetransferOwnership;
    } else {
      throw responsetransferOwnership;
    }
  } catch (error) {
    console.error("Impossible to transfer ownership:", error);
  }
}

export async function removeMemberById({ session, mindmapId, membersToDelete }: {session: CustomSession | null, mindmapId: string, membersToDelete: any}): Promise<any> {
  if(session)
    try {
      const responseRemoveCollaborator: Response = await fetch(baseUrl + `/mindmap/${mindmapId}/member-roles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(membersToDelete),
      });

      if (responseRemoveCollaborator.ok) {
        return responseRemoveCollaborator.json();
      } else {
        throw responseRemoveCollaborator;
      }
    } catch (error) {
      console.error("Impossible to remove collaborator:", error);
    }
}
