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

const displayWords = (data, points) => {
  const cards = data.map((word) => boxen(word));
  const board = cards.reduce((line1, line2) => addLines(line1, line2)).join(
    "\n",
  );
  console.clear();
  console.log(`POINTS\n${points}`);
  console.log(board);
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

const guess = async (connection, code) => {
  const encoder = new TextEncoder();
  const userCode = prompt(`enter the code`);
  setTimeout(() => {
    console.clear();
    if (code === userCode) console.log(`you guessed correct`);
    else console.log(`sorry its incorrect`);
  }, 200);
  await connection.write(encoder.encode(userCode));
};

const writeHints = async (hints, connection, words, points) => {
  const encoder = new TextEncoder();
  await connection.write(encoder.encode(JSON.stringify(hints)));
  console.clear();
  displayWords(words, points);
  hints.forEach((hint) => console.log(`--> ${hint}`));
};

const boxenWords = (words) => {
  const topLine = `┌${"-".repeat(8)}┐`;
  const lastLine = `└${"-".repeat(8)}┘`;
  words.unshift(topLine);
  words.push(lastLine);
  return words;
};

const displayHints = (allHints) => {
  const formattedHints = Object.values(allHints).map((hints) =>
    boxenWords(hints.map((word) => `|${word.padStart(8)}|`))
  );
  console.log(
    formattedHints.reduce((a, b) => addLines(a, b)).join("\n"),
  );
};

const displayCategories = (hints, allHints, points) => {
  console.clear();
  console.log(`POINTS\n${points}`);
  displayHints(allHints);
  hints.forEach((hint) => console.log(`--> ${hint}`));
};

const addHints = (hints, allHints, code) => {
  const [number1, number2, number3] = code.split(" ");
  allHints[number1].push(hints[0]);
  allHints[number2].push(hints[1]);
  allHints[number3].push(hints[2]);
};

const write = async (connection, words, code, points) => {
  console.clear();
  displayWords(words, points);
  console.log(`CODE : \n==${code}==`);
  const hints = readHints();
  await writeHints(hints, connection, words, points);
  await guess(connection, code);
};

const makeDecision = (connection, data) => {
  console.clear();
  if (data.isWon === `yes`) {
    console.log(`YOU WON`);
  } else {
    console.log(`YOU LOST`);
  }
  connection.close();
};

const handleGame = async (connection, allHints, words) => {
  const [bytesRead, rawData] = await read(connection);
  const data = JSON.parse(rawData);
  if (bytesRead !== null) {
    if (data.turn) {
      await write(connection, words, data.code, data.points);
    } else if (data.isWon) {
      makeDecision(connection, data);
      Deno.exit();
    } else {
      displayCategories(data.hints, allHints, data.points);
      await guess(connection, data.code);
      addHints(data.hints, allHints, data.code);
    }
  }
};

const main = async () => {
  const connection = await connect();
  const allHints = { 1: [], 2: [], 3: [], 4: [] };
  await printWelcome(connection);
  const data = JSON.parse((await read(connection))[1]);
  displayWords(data.words, data.points);
  while (true) {
    await handleGame(connection, allHints, data.words);
  }
};

await main();
