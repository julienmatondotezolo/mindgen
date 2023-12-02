const baseUrl = process.env.NEXT_PUBLIC_API_URL + "/api/v1";

//Use when Next-Auth version fixed (there is an error where it returns status 200 even if the credentials are wrong)
export async function connectUser(credentials: any): Promise<Response> {
  try {
    return await fetch(`${baseUrl}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify({
        username: credentials?.username,
        password: credentials?.password,
      }),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function signUp(body: any): Promise<Response> {
  try {
    return await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res: Response = await fetch(`${baseUrl}/password/validate-reset-token/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (res.ok) {
      return true;
    } else {
      throw new Error("Error validating token");
    }
  } catch (error) {
    console.error(error);
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const res: Response = await fetch(`${baseUrl}/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    return res.ok;
  } catch (error) {
    console.error(error);
  }
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    const res: Response = await fetch(`${baseUrl}/password/reset-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(email),
    });

    return res.ok;
  } catch (error) {
    console.error(error);
  }
}

export async function changePassword(session: any, body: any): Promise<boolean> {
  try {
    const res: Response = await fetch(`${baseUrl}/password/change`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.data?.user?.token}`,
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(body),
    });

    return res.ok;
  } catch (error) {
    console.error(error);
  }
}
