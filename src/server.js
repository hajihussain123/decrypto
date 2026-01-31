const listener = Deno.listen({
  port: 8000,
  transport: 'tcp'
});

const encoder = new TextEncoder();
const connections = [];

for await (const conn of listener) {
  console.log(`connected`);
  connections.push(conn);
  conn.write(encoder.encode(`welcome to decrypto`));
  if (connections.length === 2)
    break;
}

const player1 = connections[0];
const player2 = connections[1];

await player1.write(encoder.encode(`let's start the game`));
await player2.write(encoder.encode(`let's start the game`));

console.log(`can begin the game`);

// const player1 = await listener[0];
// await player1.write(encoder.encode('welcome to decrypto'));
// console.log('connected player 1');
// const player2 = await listener[1];
// await player2.write(encoder.encode('welcome to decrypto'));
// console.log('connected player 2');