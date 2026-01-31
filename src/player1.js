const boxen = (word) => {
  const topLine = `┌${'-'.repeat(word.length)}┐`;
  const line = `|${' '.repeat(word.length)}|`
  const lastLine = `└${'-'.repeat(word.length)}┘`;
  const middleLine = `|${word}|`;
  return [topLine, line, middleLine, line, lastLine];
}

const addLines = (line1, line2) => {
  return line1.map((line, i) => `${line} ${line2[i]}`);
}

const connection = await Deno.connect({
  hostname: "192.168.1.59",
  port: 8000,
  transport: "tcp",
});

const displayWords = (data) => {
  const cards = data.map(word => boxen(word));
  const board = cards.reduce((line1, line2) => addLines(line1, line2));
  console.log(board.join('\n'));
}

const decoder = new TextDecoder();
const buffer = new Uint8Array(1024);
let bytesRead = await connection.read(buffer);
let data = buffer.slice(0, bytesRead);
console.log(decoder.decode(data));

bytesRead = await connection.read(buffer);
data = buffer.slice(0, bytesRead);  
displayWords(JSON.parse(decoder.decode(data)));

while (true) {
  const bytesRead = await connection.read(buffer);
  const data = buffer.slice(0, bytesRead);
  if (bytesRead !== null)
  console.log(decoder.decode(data));
}
