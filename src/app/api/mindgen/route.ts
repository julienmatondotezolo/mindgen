import { NextResponse } from "next/server";
import { Readable } from "stream";

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const encoder = new TextEncoder();

async function* makeIterator() {
  yield encoder.encode("<p>One</p>");
  await sleep(1000);
  yield encoder.encode("<p>Two</p>");
  await sleep(3000);
  yield encoder.encode("<p>Three</p>");
  await sleep(1000);
  yield encoder.encode("<p>Four</p>");
}

export async function POST(req, res) {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new Response(stream);
  // const messages = ["Wake up, Neo...\n", "The Matrix has you...\n", "..."];
  // const readable = new Readable({
  //   read() {
  //     for (const message of messages) {
  //       this.push(message);
  //       // Wait for 1 second before sending the next message
  //       new Promise((resolve) => setTimeout(resolve, 1000));
  //     }
  //     new Promise((resolve) => setTimeout(resolve, 5000));
  //     this.push("All data received");
  //     this.push(null); // Indicates that no more data will be provided
  //   },
  // });
  // return new NextResponse(readable);
}
