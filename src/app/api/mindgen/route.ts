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
  yield encoder.encode("One");
  await sleep(1000);
  yield encoder.encode(" Two");
  await sleep(2000);
  yield encoder.encode(" Three");
  await sleep(1000);
  yield encoder.encode(" Four");
}

export async function POST(req, res) {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
