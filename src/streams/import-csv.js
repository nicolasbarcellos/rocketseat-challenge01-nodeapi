import csvParser from "csv-parser";
import fs from "node:fs";

// csvParser({
//   separator:
// })

const csvPath = new URL("./tasks.csv", import.meta.url);

async function run() {
  const parser = csvParser({
    separator: ",",
    headers: ["title", "description"],
  });

  fs.createReadStream(csvPath).pipe(parser);

  for await (const line of parser) {
    const { title, description } = line;

    await fetch("http://localhost:3334/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });
  }
}

run();
