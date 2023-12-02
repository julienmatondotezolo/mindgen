const baseUrl: string = process.env.NEXT_PUBLIC_API_URL + "/api/v1/user/profile";

export async function getUserDetails(session, username): Promise<UserDetails> {
  try {
    if (session.data?.user.token) {
      const response: Response = await fetch(`${baseUrl}/${username}`, {
        method: "GET",
        next: { revalidate: 10 },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.user.token}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch prompt cards");
      }
    }
  } catch (error) {
    console.error(error);
  }
}
