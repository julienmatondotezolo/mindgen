import { ApiError } from "next/dist/server/api-utils";

import { CustomSession, Layer } from "@/_types";

/* eslint-disable prettier/prettier */
// add url for DEV
const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
// const baseUrl: string = process.env.NEXT_PUBLIC_TEST_API_URL + "/api/mindgen";

export async function addLayerCommand({
  session,
  boardId,
  layer,
}: {
  session: CustomSession | null;
  boardId: string;
  layer: Layer;
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseAddLayer: Response = await fetch(baseUrl + `/mindmap/${boardId}/layer`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(layer),
  });

  if (!responseAddLayer.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Add layer",
      statusCode: responseAddLayer.status,
      message: await responseAddLayer.text(),
    };

    throw errorData;
  }

  return responseAddLayer.json();
}

export async function updateLayerCommand({
  session,
  boardId,
  layers,
}: {
  session: CustomSession | null;
  boardId: string;
  layers: Layer[];
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseUpdateLayer: Response = await fetch(baseUrl + `/mindmap/${boardId}/layer`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(layers),
  });

  if (!responseUpdateLayer.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Update layer",
      statusCode: responseUpdateLayer.status,
      message: await responseUpdateLayer.text(),
    };

    throw errorData;
  }

  return responseUpdateLayer.json();
}

export async function deleteLayerCommand({
  session,
  boardId,
  layerIdsToDelete,
}: {
  session: CustomSession | null;
  boardId: string;
  layerIdsToDelete: string[];
}): Promise<any> {
  if (!session?.data.session) {
    const noSession: ApiError = {
      name: "No session provided",
      statusCode: 401,
      message: "No session provided",
    };

    throw noSession;
  }

  const responseDeleteLayer: Response = await fetch(baseUrl + `/mindmap/${boardId}/layer`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.user.token}}`,
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(layerIdsToDelete),
  });

  if (!responseDeleteLayer.ok) {
    // Create a structured error object
    const errorData: ApiError = {
      name: "Delete layer",
      statusCode: responseDeleteLayer.status,
      message: await responseDeleteLayer.text(),
    };

    throw errorData;
  }

  return responseDeleteLayer.ok;
}