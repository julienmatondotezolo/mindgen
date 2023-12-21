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
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: "Le MindGen App est une plateforme polyvalente",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(500);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " permettant de créer des cartes",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(200);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " mentales pour organiser des idées",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(400);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " et des informations.",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(1000);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " Elle offre une interface",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(500);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " conviviale pour générer des cartes",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(200);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " à partir de nœuds personnalisables,",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(400);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " chacun représentant une tâche",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(1000);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " ou un concept spécifique.",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(500);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " L'application semble offrir plusieurs",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
  await sleep(200);
  yield encoder.encode(
    JSON.stringify({
      id: "chatcmpl-8Y2aGveQxZWi5B2M1wadVZSyFs6B2",
      object: "chat.completion.chunk",
      created: 1703123776,
      model: "gpt-3.5-turbo-0613",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          delta: {
            content: " fonctionnalités clés :",
          },
          logprobs: null,
          finish_reason: null,
        },
      ],
    }),
  );
}

export async function POST() {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
