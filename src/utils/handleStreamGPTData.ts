export async function handleStreamGPTData(
  stream: Promise<ReadableStream<Uint8Array>>,
  setAnswerMessages: any,
  setDone: any,
) {
  try {
    const reader = (await stream).getReader();
    let decodedValue = "";

    setDone(false);

    while (true as const) {
      const { done, value } = await reader.read();

      if (done) {
        setDone(true);
        break;
      }

      let rawData = new TextDecoder("utf-8").decode(value).replaceAll("data:", "");
      let spacesInData = rawData.split("\n");

      for (let i in spacesInData) {
        let splittedData = spacesInData[i];

        decodedValue += splittedData ? JSON.parse(splittedData).choices[0].delta.content : "";
      }

      setAnswerMessages((prevMessages: any[]) => {
        const lastServerMessageIndex = prevMessages.map((msg: { sender: any }) => msg.sender).lastIndexOf("server");

        const newMessage = {
          ...prevMessages[lastServerMessageIndex],
          text: decodedValue,
          sender: "server",
        };

        return prevMessages.map((message: any, index: any) =>
          index === lastServerMessageIndex ? newMessage : message,
        );
      });
    }
  } catch (error) {
    console.error("An error occurred while handling the stream:", error);
    // Handle the error appropriately, e.g., show an error message to the user
  }
}
