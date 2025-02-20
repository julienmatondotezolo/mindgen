interface User {
  id: string;
  token: string; // Assuming the token is a string
  username: string;
  // Add other user properties here as needed
}

export type CustomSession = {
  data: {
    session: {
      user: User;
      // Add other session properties here as needed
    };
  };
};
