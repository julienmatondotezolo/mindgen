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
  yield encoder.encode("La MindGen App est une plateforme polyvalente");
  await sleep(500);
  yield encoder.encode(" permettant de créer des cartes");
  await sleep(200);
  yield encoder.encode(" mentales pour organiser des idées");
  await sleep(400);
  yield encoder.encode(" et des informations.");
  await sleep(1000);
  yield encoder.encode("Elle offre une interface");
  await sleep(500);
  yield encoder.encode(" conviviale pour générer des cartes");
  await sleep(200);
  yield encoder.encode(" à partir de nœuds personnalisables,");
  await sleep(400);
  yield encoder.encode(" chacun représentant une tâche");
  await sleep(1000);
  yield encoder.encode(" ou un concept spécifique.");
  await sleep(500);
  yield encoder.encode(" L'application semble offrir plusieurs");
  await sleep(200);
  yield encoder.encode(" fonctionnalités clés :");
  await sleep(400);
  // await sleep(1000);
  // yield encoder.encode(
  //   "<ul><li><strong>Création de cartes mentales:</strong> La première étape semble être la création de cartes mentales. Cela se fait à l'aide de nœuds personnalisables. Chaque nœud représente une entité spécifique dans le processus de création.</li><li><strong>Génération d'emails:</strong> Une fonctionnalité intéressante de la MindGen App est la capacité de générer des emails. Un nœud dédié est présent pour cette tâche spécifique.</li><li><strong>Génération de CV au format PDF:</strong> Elle offre également la possibilité de générer des CV au format PDF. Encore une fois, cela est représenté par un nœud distinct dans la carte mentale.</li><li><strong>Gestion d'équipe:</strong> La plateforme semble intégrer une fonctionnalité de gestion d'équipe. Différents membres de l'équipe sont représentés par des nœuds, tels que Snize, Emji, Backend Developer, et Frontend Developer. Ces nœuds sont reliés entre eux, probablement pour montrer les liens et les connexions au sein de l'équipe.</li></ul>",
  // );
}

export async function POST() {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
