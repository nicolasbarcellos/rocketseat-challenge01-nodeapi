import { randomUUID } from "node:crypto";
import { client } from "./database/client.js";

export class Database {
  #database = new Map();

  async select(search) {
    //   const tasksList = Array.from(this.#database.entries())
    //     .map((item) => {
    //       const id = item[0];
    //       const data = item[1];

    //       // colocar em um banco de dados
    //       // patch
    //       // stream

    //       return {
    //         id,
    //         ...data,
    //       };
    //     })
    //     .reduce((arr, task) => {
    //       const valuesArr = Object.values(task);
    //       const map = valuesArr.map((v) => String(v));

    //       const regex = new RegExp(search, "gi");

    //       if (map.some((v) => regex.test(v))) {
    //         arr.push(task);
    //       }

    //       return arr;
    //     }, []);

    //   return tasksList;

    let tasks = await client.tasks.findMany();

    if (search) {
      tasks = await client.tasks.findMany({
        where: {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              AND: {
                description: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
      });
    }

    return tasks;
  }

  async insert(data) {
    const taskId = randomUUID();

    await client.tasks.create({
      data: {
        ...data,
      },
    });

    return this.#database.set(taskId, data);
  }

  async delete(id) {
    // return this.#database.delete(id);

    await client.tasks.delete({
      where: {
        id: id,
      },
    });
  }

  async update(id, data) {
    await client.tasks.update({
      where: {
        id: id,
      },
      data: {
        ...data,
      },
    });

    // return this.#database.set(id, data);
  }
}
