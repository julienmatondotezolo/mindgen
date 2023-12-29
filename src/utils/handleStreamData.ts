export async function handleStreamData(stream: ReadableStream<Uint8Array> | null) {
  let streamData = "";
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    if (stream) {
      reader = stream.getReader();
      const chunks: Uint8Array[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        chunks.push(value);
      }

      // Concatenate Uint8Array chunks into a single Uint8Array
      const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;

      for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert concatenated Uint8Array to string (change encoding if needed)
      streamData = new TextDecoder().decode(concatenatedChunks);
    }
  } catch (error) {
    console.error("Error reading stream:", error);
  } finally {
    if (reader) {
      reader.cancel();
    }
  }

  return streamData;
}
