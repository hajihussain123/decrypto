const boxen = (word) => {
  const topLine = `┌${"-".repeat(word.length)}┐`;
  const line = `|${" ".repeat(word.length)}|`;
  const lastLine = `└${"-".repeat(word.length)}┘`;
  const middleLine = `|${word}|`;
  return [topLine, line, middleLine, line, lastLine];
};

const addLines = (line1, line2) => {
  return line1.map((line, i) => {
    const firstLine = line ? line : " ".repeat(10);
    const secondLine = line2[i] ? line2[i] : " ".repeat(10);
    return `${firstLine} ${secondLine}`;
  });
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

const writeHints = async (hints, connection, words) => {
  const encoder = new TextEncoder();
  await connection.write(encoder.encode(JSON.stringify(hints)));
  console.clear();
  displayWords(words);
  hints.forEach((hint) => console.log(hint));
};

const boxenWords = (words) => {
  const topLine = `┌${"-".repeat(8)}┐`;
  const lastLine = `└${"-".repeat(8)}┘`;
  words.unshift(topLine);
  words.push(lastLine);
  return words;
};

const displayHints = (allHints) => {
  const first = boxenWords(allHints[1].map((word) => `|${word.padStart(8)}|`));
  const second = boxenWords(allHints[2].map((word) => `|${word.padStart(8)}|`));
  const third = boxenWords(allHints[3].map((word) => `|${word.padStart(8)}|`));
  const fourth = boxenWords(allHints[4].map((word) => `|${word.padStart(8)}|`));
  console.log(
    [first, second, third, fourth].reduce((a, b) => addLines(a, b)).join("\n"),
  );
};

const displayCategories = (hints, allHints) => {
  console.clear();
  displayHints(allHints);
  hints.forEach((element) => console.log(element));
};

const addHints = (hints, allHints, code) => {
  const [number1, number2, number3] = code.split(" ");
  allHints[number1].push(hints[0]);
  allHints[number2].push(hints[1]);
  allHints[number3].push(hints[2]);
};

const main = async () => {
  const connection = await connect();
  const allHints = { 1: [], 2: [], 3: [], 4: [] };
  await printWelcome(connection);
  const words = JSON.parse((await read(connection))[1]);
  displayWords(words);
  while (true) {
    const [bytesRead, rawData] = await read(connection);
    const data = JSON.parse(rawData);
    if (bytesRead !== null) {
      if (data.turn) {
        console.clear();
        displayWords(words);
        console.log(`CODE : \n==${data.code}==`);
        const hints = readHints();
        await writeHints(hints, connection, words);
        await guess(connection);
      } else if (data.isWon) {
        console.clear();
        if (data.isWon === `yes`) {
          console.log(`YOU WON`);
        } else {
          console.log(`YOU LOST`);
        }
        connection.close();
        break;
      } else {
        displayCategories(data.hints, allHints);
        await guess(connection);
        addHints(data.hints, allHints, data.code);
      }
    }
  }
};

await main();
