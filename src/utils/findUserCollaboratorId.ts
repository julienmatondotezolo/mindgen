import { Collaborator } from "@/_types";

export function findCollaboratorId(userID: any, array: Collaborator[] | undefined) {
  // Check if array is not undefined before proceeding
  if (!array) {
    return null;
  }

  // Find the object in the array where the userId matches the input userID
  const matchingObject = array.find((item: { userId: any }) => item.userId === userID);

  // If a matching object was found, return its collaboratorId
  if (matchingObject) {
    return matchingObject.collaboratorId;
  } else {
    // If no match was found, return null
    return null;
  }
}
