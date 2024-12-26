import { ApiError } from "next/dist/server/api-utils";

import { CustomSession } from "@/_types";

/* eslint-disable prettier/prettier */
// add url for DEV
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

export async function fetchCreatedPDF({ session, pdfReqObject }: { session: CustomSession | null, pdfReqObject: any }): Promise<any> {
  if(session)
    try {
      const responseCreatePDF: Response = await fetch(baseUrl + `/ai/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(pdfReqObject),
      });

      if (responseCreatePDF.ok) {
        return responseCreatePDF.json();
      } else {
        throw responseCreatePDF;
      }
    } catch (error) {
      console.error("Impossible to create PDF:", error);
    }
}

/* ================================================= */  
/* ==================   PROFILE   ================== */
/* ================================================= */ 

export async function fetchProfile({ session }: { session: CustomSession | null }): Promise<any> {
  if (!session) {
    throw new Error('No session provided');
  }


  const responseProfile: Response = await fetch(baseUrl + `/user/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.data.session.user.token}`,
      "ngrok-skip-browser-warning": "1",
    },
  });

  if (!responseProfile.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Profile fetch",
      statusCode: responseProfile.status,
      message: await responseProfile.text(),
    };

    throw errorData;
  }

  return responseProfile.json();
}

export async function changePassword({ session, passwordBody }: { session: CustomSession | null, passwordBody: any }): Promise<any> {
  if (!session) {
    throw new Error('No session provided');
  }


  const responsePasswordChange: Response = await fetch(baseUrl + `/password/change`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.data.session.user.token}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(passwordBody),
  });

  if (!responsePasswordChange.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Password change",
      statusCode: responsePasswordChange.status,
      message: await responsePasswordChange.text(),
    };

    throw errorData;
  }

  return responsePasswordChange.json();
}

/* ======================================================== */
/* ======================   PAYMENT   ===================== */
/* ======================================================== */

export async function fetchPaymentProducts(): Promise<any> {
  try {
    const responsePaymentProducts: Response = await fetch(baseUrl + `/payment/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responsePaymentProducts.ok) {
      return responsePaymentProducts.json();
    } else {
      throw responsePaymentProducts;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function fetchStripeCheckout({ session, checkoutBody }: {session: CustomSession | null, checkoutBody: any}): Promise<any> {
  if(session)
    try {
      const responseStripeCheckout: Response = await fetch(baseUrl + `/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(checkoutBody),
      });

      if (responseStripeCheckout.ok) {
        return responseStripeCheckout.json();
      } else {
        throw responseStripeCheckout;
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

export async function acceptOrgInvitation({ session, invitationId }: { session: CustomSession | null, invitationId: string }): Promise<any> {
  try {
    const responseAcceptOrgInvitation: Response = await fetch(baseUrl + `/organization/invitation/accept/${invitationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.data.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseAcceptOrgInvitation.ok) {
      return responseAcceptOrgInvitation;
    } else {
      return responseAcceptOrgInvitation.json();
    }
  } catch (error) {
    console.error("Impossible to fetch confirm email:", error);
  }
}

/* ======================================================= */  
/* ==============   ORGANIZATIONS MEMBERS  =============== */
/* ======================================================= */

export async function removeMemberFromOrg({ session, memberId }: {session: CustomSession | null, memberId: string}): Promise<any> {
  if (!session) {
    throw new Error('No session provided');
  }


  const responseRemoveMember: Response = await fetch(baseUrl + `/organization/member/${memberId}/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.data.session.user.token}`,
      "ngrok-skip-browser-warning": "1",
    },
  });

  if (!responseRemoveMember.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Remove member from organization",
      statusCode: responseRemoveMember.status,
      message: await responseRemoveMember.text(),
    };

    throw errorData;
  }

  return responseRemoveMember.json();
}

export async function memberLeaveOrg({ session, memberId }: {session: CustomSession | null, memberId: string}): Promise<any> {
  if (!session) {
    throw new Error('No session provided');
  }


  const responseLeaveOrganization: Response = await fetch(baseUrl + `/organization/member/${memberId}/leave`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.data.session.user.token}`,
      "ngrok-skip-browser-warning": "1",
    },
  });

  if (!responseLeaveOrganization.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Member leave organization",
      statusCode: responseLeaveOrganization.status,
      message: await responseLeaveOrganization.text(),
    };

    throw errorData;
  }

  return responseLeaveOrganization.json();
}

/* ================================================== */  
/* ==================   MINDMAPS   ================== */
/* ================================================== */ 

export async function generatedMindmap({ session, organizationId, task, layoutType }: { session: CustomSession | null, organizationId: any, task: string, layoutType: string }) {
  if(session)
    try {
      const responseGeneratedMindmap: Response = await fetch(baseUrl + `/ai/${organizationId}/mindmap/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({
          task,
          layoutType,
        }),
      });

      if (responseGeneratedMindmap.ok) {
        return responseGeneratedMindmap.json();
      } else {
        console.error("Failed to post data and stream response");
        // If the response is not okay, return a default ReadableStream<Uint8Array> with a message
        return new ReadableStream<Uint8Array>({
          start(controller) {
          // Convert a string to Uint8Array and enqueue it to the stream
            const message = "An error occurred while gnerating a mindmap.";

            controller.enqueue(new TextEncoder().encode(message));
            controller.close();
          },
        });
      }
    } catch (error) {
      console.error("Impossible to generate Mindmap:", error);
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

export async function reGenerateMindmap({ session, mindmapReqObject }: { session: CustomSession | null, mindmapReqObject: any }): Promise<ReadableStream<Uint8Array>> {
  if(session)
    try {
      const responseReGeneratedMindmap: Response = await fetch(baseUrl + `/ai/mindmap/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(mindmapReqObject),
      });

      if (responseReGeneratedMindmap.ok) {
        return responseReGeneratedMindmap.body as ReadableStream<Uint8Array>;
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
      console.error("Impossible to generate Mindmap:", error);
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

export async function fetchMindmaps({ session, organizationId }: {session: CustomSession | null, organizationId: string}): Promise<any> {
  if(session)
    try {
      const responseMindmap: Response = await fetch(baseUrl + `/mindmap/organization/${organizationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.data.session.user.token}`,
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

export async function createMindmap({ mindmapObject }: {mindmapObject: any}): Promise<any> {
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
      return responseCreatedMindMap.json();
    } else {
      throw responseCreatedMindMap;
    }
  } catch (error) {
    console.error("Impossible to fetch profiles:", error);
  }
}

export async function favoriteMindmap({ mindmapId }: {mindmapId: string}): Promise<any> {
  try {
    const response: Response = await fetch(process.env.NEXT_PUBLIC_URL + "/api/auth/session");
    const session = await response.json();

    const responseFavoriteMindMap: Response = await fetch(baseUrl + `/mindmap/${mindmapId}/favorite`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.session.user.token}`,
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseFavoriteMindMap.ok) {
      return responseFavoriteMindMap.json();
    } else {
      throw responseFavoriteMindMap;
    }
  } catch (error) {
    console.error("Impossible to favorite mindmap:", error);
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

export async function searchBoardQuery({ session, query }: {session: CustomSession | null, query: string}): Promise<any> {
  if (!session) {
    throw new Error('No session provided');
  }

  const responseSearchBoard: Response = await fetch(baseUrl + `/mindmap/search?query=${query}`, {
    next: {
      revalidate: 0,
    },
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.data.session.user.token}`,
      "ngrok-skip-browser-warning": "1",
    },
  });

  if (!responseSearchBoard.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Search Board Query",
      statusCode: responseSearchBoard.status,
      message: await responseSearchBoard.text(),
    };

    throw errorData;
  }

  return responseSearchBoard.json();

}

export async function updateBoardLayersById({
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
      const responseUpdatedMindMap: Response = await fetch(baseUrl + `/mindmap/content/${mindmapId}`, {
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

export async function updateBoardMetadataById({
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
      const responseUpdatedMindMap: Response = await fetch(baseUrl + `/mindmap/metadata/${mindmapId}`, {
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
  if (!session) {
    throw new Error('No session provided');
  }

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

  if (!responseUpdatedCollaborator.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Search Board Query",
      statusCode: responseUpdatedCollaborator.status,
      message: await responseUpdatedCollaborator.text(),
    };

    throw errorData;
  }

  return responseUpdatedCollaborator.json();

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
