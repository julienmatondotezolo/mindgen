import { ApiError } from "next/dist/server/api-utils";

import { CustomSession, Edge } from "@/_types";

/* eslint-disable prettier/prettier */
// add url for DEV
const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
// const baseUrl: string = process.env.NEXT_PUBLIC_TEST_API_URL + "/api/mindgen";

export async function addEdgeCommand({
  session,
  boardId,
  edge,
}: {
  session: CustomSession | null;
  boardId: string;
  edge: Edge;
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseAddEdge: Response = await fetch(baseUrl + `/mindmap/${boardId}/edge`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(edge),
  });

  if (!responseAddEdge.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Add edge",
      statusCode: responseAddEdge.status,
      message: await responseAddEdge.text(),
    };

    throw errorData;
  }

  return responseAddEdge.json();
}

export async function updateEdgeCommand({
  session,
  boardId,
  edge,
}: {
  session: CustomSession | null;
  boardId: string;
  edge: Edge;
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseUpdateEdge: Response = await fetch(baseUrl + `/mindmap/${boardId}/edge/${edge.id}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(edge),
  });

  if (!responseUpdateEdge.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Update edge",
      statusCode: responseUpdateEdge.status,
      message: await responseUpdateEdge.text(),
    };

    throw errorData;
  }

  return responseUpdateEdge.json();
}

export async function deleteEdgeCommand({
  session,
  boardId,
  edgeId,
}: {
  session: CustomSession | null;
  boardId: string;
  edgeId: string;
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseDeleteEdge: Response = await fetch(baseUrl + `/mindmap/${boardId}/edge/${edgeId}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
  });

  if (!responseDeleteEdge.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Delete edge",
      statusCode: responseDeleteEdge.status,
      message: await responseDeleteEdge.text(),
    };

    throw errorData;
  }

  return responseDeleteEdge.ok;
}