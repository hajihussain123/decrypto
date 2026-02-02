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

const generateCode = () => {
  return `3 1 2`;
};

const handle = async (player1, player2, encoder, decoder, buffer) => {
  const code = generateCode();
  await player1.write(encoder.encode(`your Turn`));
  await player1.write(encoder.encode(`===== CODE =====\n      ${code}     `));
  const bytes = await player1.read(buffer);
  if (bytes !== null) {
    console.log(decoder.decode(buffer.slice(0, bytes)));
    await player2.write(buffer.slice(0, bytes));
    let byteCount = await player1.read(buffer);
    const player1Guess = decoder.decode(buffer.slice(0, byteCount));
    byteCount = await player2.read(buffer);
    const player2Guess = decoder.decode(buffer.slice(0, byteCount));
    if (player1Guess.length && player2Guess.length);
    console.log(player1Guess, player2Guess);
  }
};

const play = async (player1, player2) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(1024);
  const player1Words = getWords();
  const player2Words = getWords();
  await player1.write(encoder.encode(JSON.stringify(player1Words)));
  await player2.write(encoder.encode(JSON.stringify(player2Words)));
  let player1Points = 0;
  let player2Points = 0;
  let rounds = 0;
  while (rounds<8) {
    await handle(player1, player2, encoder, decoder, buffer);
    await handle(player2, player1, encoder, decoder, buffer);
    rounds++;
  }
};

const main = async () => {
  const [player1, player2] = await getPlayers();
  setTimeout(async () => {
    await play(player1, player2);
  }, 1);
};

await main();
