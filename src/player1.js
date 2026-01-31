const connection = await Deno.connect({
  hostname: "192.168.1.59",
  port: 8000,
  transport: "tcp",
});

const decoder = new TextDecoder();
const buffer = new Uint8Array(1024);
const bytesRead = await connection.read(buffer);
const data = buffer.slice(0, bytesRead);
console.log(decoder.decode(data));

while (true) {
  const bytesRead = await connection.read(buffer);
  const data = buffer.slice(0, bytesRead);
  if (bytesRead !== null)
  console.log(decoder.decode(data));
}
