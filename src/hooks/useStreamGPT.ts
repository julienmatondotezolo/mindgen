async function useStreamGPT(stream: Promise<ReadableStream<Uint8Array>>, setMessages: any, setDone: any) {
  const reader = (await stream).getReader();
  let decodedValue = "";

  while (true as const) {
    const { done, value } = await reader.read();

    if (done) {
      setDone((prevDone: any) => !prevDone);
      break;
    }

    let rawData = new TextDecoder("utf-8").decode(value).replaceAll("data:", "");
    let spacesInData = rawData.split("\n");

    for (let i in spacesInData) {
      let splittedData = spacesInData[i];

      decodedValue += splittedData ? JSON.parse(splittedData).choices[0].delta.content : "";
    }

    setMessages((prevMessages: any[]) => {
      const lastServerMessageIndex = prevMessages.map((msg: { sender: any }) => msg.sender).lastIndexOf("server");

      const newMessage = {
        ...prevMessages[lastServerMessageIndex],
        text: decodedValue,
        sender: "server",
      };

      return prevMessages.map((message: any, index: any) => (index === lastServerMessageIndex ? newMessage : message));
    });
  }
}

export { useStreamGPT };
