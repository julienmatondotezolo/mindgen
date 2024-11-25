const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//Use when Next-Auth version fixed (there is an error where it returns status 200 even if the credentials are wrong)
export async function connectUser(credentials: any): Promise<Response> {
  try {
    const response = await fetch(`${baseUrl}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify({
        username: credentials?.username,
        password: credentials?.password,
        preferredLanguage: "ENGLISH",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    return response; // Directly return the response
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

export async function signUp({ signUpBody }: { signUpBody: any }) {
  try {
    const response = await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(signUpBody),
    });

    if (!response.ok) {
      console.error(`HTTP error status: ${response.status}`);
      return response.json();
    }

    return response; // Directly return the response
  } catch (error) {
    console.error(error);
  }
}

export async function validateToken(token: string) {
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

export async function resetPassword({ token, newPassword }: { token: string; newPassword: string }) {
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

export async function requestPasswordReset({ passwordResetBody }: { passwordResetBody: any }) {
  try {
    const res: Response = await fetch(`${baseUrl}/password/reset-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(passwordResetBody),
    });

    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function changePassword(session: any, body: any) {
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

export async function confirmEmail({ tokenId }: { tokenId: string }): Promise<any> {
  try {
    const responseConfirmEmail: Response = await fetch(baseUrl + `/auth/confirm-email/${tokenId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (responseConfirmEmail.ok) {
      return responseConfirmEmail;
    } else {
      return responseConfirmEmail;
    }
  } catch (error) {
    console.error("Impossible to fetch confirm email:", error);
  }
}
