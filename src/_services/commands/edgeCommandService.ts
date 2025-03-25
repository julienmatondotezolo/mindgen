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
  edges,
}: {
  session: CustomSession | null;
  boardId: string;
  edges: Edge[];
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseUpdateEdge: Response = await fetch(baseUrl + `/mindmap/${boardId}/edge`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(edges),
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
  edgeIdsToDelete,
}: {
  session: CustomSession | null;
  boardId: string;
  edgeIdsToDelete: string[];
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseDeleteEdge: Response = await fetch(baseUrl + `/mindmap/${boardId}/edge`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(edgeIdsToDelete),
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