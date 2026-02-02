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
    hostname: "10.132.125.26",
    port: 8000,
    transport: "tcp",
  });
};

const displayWords = (data) => {
  const cards = data.map((word) => boxen(word));
  const board = cards.reduce((line1, line2) => addLines(line1, line2));
  console.log(board.join("\n"));
};

const printWelcome = async (connection, buffer, decoder) => {
  const bytesRead = await connection.read(buffer);
  const msg = decoder.decode(buffer.slice(0, bytesRead));
  console.clear();
  console.log(msg);
};

const readWords = async (connection, buffer, decoder) => {
  const bytesRead = await connection.read(buffer);
  const words = decoder.decode(buffer.slice(0, bytesRead));
  return JSON.parse(words);
};

const read = async (connection, decoder, buffer) => {
  const bytesRead = await connection.read(buffer);
  const data = decoder.decode(buffer.slice(0, bytesRead));
  return [bytesRead, data];
};

const readHints = () => {
  const hint1 = prompt(`hint 1: `);
  const hint2 = prompt(`hint 2: `);
  const hint3 = prompt(`hint 3: `);
  return [hint1, hint2, hint3];
};

const main = async () => {
  const connection = await connect();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const buffer = new Uint8Array(1024);
  await printWelcome(connection, buffer, decoder);
  const words = await readWords(connection, buffer, decoder);
  displayWords(words);
  while (true) {
    const [bytesRead, data] = await read(connection, decoder, buffer);
    if (bytesRead !== null) {
      if (data.startsWith("your Turn")) {
        console.log(data.slice(9));
        const hints = readHints();
        await connection.write(encoder.encode(JSON.stringify(hints)));
        console.clear();
        displayWords(words);
        hints.forEach((hint) => console.log(hint));
        const code = prompt(`enter the code`);
        console.log(`sending data....`);
        await connection.write(encoder.encode(code));
      } else {
        const hints = JSON.parse(data);
        hints.forEach((element) => console.log(element));
        const code = prompt(`enter the code`);
        console.log(`sending data....`);
        await connection.write(encoder.encode(code));
      }
    }
  }
};

await main();
