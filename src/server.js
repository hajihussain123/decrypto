import { getWords } from "./words.js";

const createListener = () => {
  return Deno.listen({
    port: 8000,
    transport: "tcp",
  });
};

const getPlayers = async () => {
  const encoder = new TextEncoder();
  const connections = [];
  const listener = createListener();

  for await (const conn of listener) {
    console.log(`player connected`);
    connections.push(conn);
    await conn.write(encoder.encode(`welcome to decrypto`));

    if (connections.length === 2) {
      return connections;
    }
  }
};

const play = async (player1, player2) => {
  const encoder = new TextEncoder();
  const player1Words = getWords();
  const player2Words = getWords();
  await player1.write(encoder.encode(JSON.stringify(player1Words)));
  await player2.write(encoder.encode(JSON.stringify(player2Words)));
  // let player1Points = 0;
  // let player2Points = 0;
  // let Rounds = 0;
  // while (player1Points < 2 && player2Points < 2 && rounds < 8) {

  // }
};

const main = async () => {
  const [player1, player2] = await getPlayers();
  setTimeout(async () => {
    await play(player1, player2);
  }, 1);
};

await main();
