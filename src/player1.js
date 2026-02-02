const boxen = (word) => {
  const topLine = `┌${"-".repeat(word.length)}┐`;
  const line = `|${" ".repeat(word.length)}|`;
  const lastLine = `└${"-".repeat(word.length)}┘`;
  const middleLine = `|${word}|`;
  return [topLine, line, middleLine, line, lastLine];
};

const addLines = (line1, line2) => {
  return line1.map((line, i) => `${line} ${line2[i]}`);
};

const connect = async () => {
  return await Deno.connect({
    port: 8000,
    transport: "tcp",
  });
};

const displayWords = (data) => {
  const cards = data.map((word) => boxen(word));
  const board = cards.reduce((line1, line2) => addLines(line1, line2));
  console.log(board.join("\n"));
};

const read = async (connection) => {
  const buffer = new Uint8Array(1024);
  const decoder = new TextDecoder();
  const bytesRead = await connection.read(buffer);
  const data = decoder.decode(buffer.slice(0, bytesRead));
  return [bytesRead, data];
};

const printWelcome = async (connection) => {
  const msg = (await read(connection))[1];
  console.clear();
  console.log(msg);
};

const readHints = () => {
  const hint1 = prompt(`hint 1: `);
  const hint2 = prompt(`hint 2: `);
  const hint3 = prompt(`hint 3: `);
  return [hint1, hint2, hint3];
};

const guess = async (connection) => {
  const encoder = new TextEncoder();
  const code = prompt(`enter the code`);
  console.log(`sending data....`);
  await connection.write(encoder.encode(code));
};

const displayCode = (data) => console.log(data.slice(9));

const writeHints = async (hints, connection, words) => {
  const encoder = new TextEncoder();
  await connection.write(encoder.encode(JSON.stringify(hints)));
  console.clear();
  displayWords(words);
  hints.forEach((hint) => console.log(hint));
};

const main = async () => {
  const connection = await connect();
  await printWelcome(connection);
  const words = JSON.parse((await read(connection))[1]);
  displayWords(words);
  while (true) {
    const [bytesRead, data] = await read(connection);
    if (bytesRead !== null) {

      if (data.startsWith("your Turn")) {
        displayCode(data);
        const hints = readHints();
        await writeHints(hints, connection, words);
        await guess(connection);
      } else {
        const hints = JSON.parse(data);
        hints.forEach((element) => console.log(element));
        await guess(connection);
      }
      
    }
  }
};

await main();
