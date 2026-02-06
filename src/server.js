import { getWords } from "./words.js";

const CODES = [
  "1 2 3", "1 3 2", "2 1 3", "2 3 1", "3 1 2", "3 2 1",
  "1 2 4", "1 4 2", "2 1 4", "2 4 1", "4 1 2", "4 2 1",
  "1 3 4", "1 4 3", "3 1 4", "3 4 1", "4 1 3", "4 3 1",
  "2 3 4", "2 4 3", "3 2 4", "3 4 2", "4 2 3", "4 3 2"
];

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

const generateCode = () => CODES[Math.floor(Math.random()*CODES.length)];

const getHints = async (player, code) => {
  const encoder = new TextEncoder();
  const buffer = new Uint8Array(1024);
  await player.conn.write(encoder.encode(JSON.stringify({turn:true, code:code})));
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
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const code = generateCode();
  const [bytes, buffer] = await getHints(player1, code);
  if (bytes !== null) {
    const data = JSON.parse(decoder.decode(buffer.slice(0, bytes)));
    await player2.conn.write(encoder.encode(JSON.stringify({hints:data, code:code})));
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
  if (firstPlayer.points >= 2) {
    player1.write(new TextEncoder().encode(JSON.stringify({ isWon: `yes` })));
    player2.write(new TextEncoder().encode(JSON.stringify({ isWon: `no` })));
  }
  if (secondPlayer.points >= 2) {
    player2.write(new TextEncoder().encode(JSON.stringify({ isWon: `yes` })));
    player1.write(new TextEncoder().encode(JSON.stringify({ isWon: `no` })));
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
