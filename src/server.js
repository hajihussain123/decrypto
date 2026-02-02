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

const generateCode = () => `3 1 2`;

const getHints = async (player, code) => {
  const encoder = new TextEncoder();
  const buffer = new Uint8Array(1024);
  await player.conn.write(encoder.encode(`your Turn`));
  await player.conn.write(
    encoder.encode(`===== CODE =====\n      ${code}     `),
  );
  const bytes = await player.conn.read(buffer);
  return [bytes, buffer];
};

const readGuess = async (player) => {
  const buffer = new Uint8Array(1024);
  const decoder = new TextDecoder();
  const byteCount = await player.conn.read(buffer);
  const playerGuess = decoder.decode(buffer.slice(0, byteCount));
  return playerGuess;
};

const handle = async (player1, player2) => {
  const code = generateCode();
  const [bytes, buffer] = await getHints(player1, code);
  if (bytes !== null) {
    await player2.conn.write(buffer.slice(0, bytes));
    const player1Guess = await readGuess(player1);
    const player2Guess = await readGuess(player2);
    player1.points += player1Guess === code ? 0 : -1;
    player2.points += player2Guess === code ? 1 : 0;
  }
};

const sendWords = async (player1, player2) => {
  const encoder = new TextEncoder();
  const [player1Words, player2Words] = getWords();
  await player1.write(encoder.encode(JSON.stringify(player1Words)));
  await player2.write(encoder.encode(JSON.stringify(player2Words)));
};

const play = async (player1, player2) => {
  await sendWords(player1, player2);
  const firstPlayer = { conn: player1, points: 0 };
  const secondPlayer = { conn: player2, points: 0 };
  let rounds = 0;
  while (rounds < 16 && firstPlayer.points < 2 && secondPlayer.points < 2) {
    const players = rounds & 1
      ? [firstPlayer, secondPlayer]
      : [secondPlayer, firstPlayer];
    await handle(...players);
    rounds++;
  }
  player1.close();
  player2.close();
};

const main = async () => {
  const [player1, player2] = await getPlayers();
  setTimeout(async () => {
    await play(player1, player2);
  }, 1);
};

await main();
