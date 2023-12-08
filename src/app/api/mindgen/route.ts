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
  await sleep(1000);
  yield encoder.encode("Absolutely!");
  await sleep(500);
  yield encoder.encode(" Here's a sample");
  await sleep(200);
  yield encoder.encode(" response as if someone were asking");
  await sleep(400);
  yield encoder.encode(" for information about a topic:");
}

export async function POST(req, res) {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
