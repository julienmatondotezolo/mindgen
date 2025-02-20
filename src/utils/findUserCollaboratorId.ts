import { Member } from "@/_types";

export function findCollaboratorId(userID: any, array: Member[] | undefined) {
  // Check if array is not undefined before proceeding
  if (!array) {
    return null;
  }

  // Find the object in the array where the userId matches the input userID
  const matchingObject = array.find((item: { userId: any }) => item.userId === userID);

  // If a matching object was found, return its collaboratorId
  if (matchingObject) {
    return matchingObject.memberId;
  } else {
    // If no match was found, return null
    return null;
  }
}
