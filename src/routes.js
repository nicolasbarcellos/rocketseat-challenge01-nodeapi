import moment from "moment/moment.js";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { client } from "./database/client.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { search } = req.query;

      const tasks = await database.select(search);

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      // if (!req.body) {
      //   return res
      //     .writeHead(400)
      //     .end(
      //       JSON.stringify({ message: "title or description are required" })
      //     );
      // }

      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title and description are required" })
          );
      }

      const tasks = {
        title,
        description,
        completed_at: null,
        created_at: moment(new Date()),
        updated_at: moment(new Date()),
      };

      database.insert(tasks);
      return res.writeHead(204).end(JSON.stringify({ message: "sucess" }));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;

      // const tasks = database.select();
      // const selectedTask = tasks.filter((task) => task.id === id);

      // if (selectedTask.length) {
      //   database.delete(id);
      // } else {
      //   return res
      //     .writeHead(400)
      //     .end(JSON.stringify({ message: "incorrect id" }));
      // }
      try {
        await database.delete(id);
      } catch (error) {
        return res.writeHead(400).end(JSON.stringify({ message: error }));
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;

      try {
        await database.update(id, {
          ...req.body,
          updated_at: moment(new Date()),
        });
      } catch (error) {
        return res.writeHead(400).end(JSON.stringify({ message: error }));
      }

      // const tasks = database.select();
      // const selectedTask = tasks.filter((task) => task.id === id);

      // if (selectedTask.length) {
      //   database.update(id, {
      //     ...selectedTask[0],
      //     title,
      //     description,
      //     updated_at: moment(new Date()),
      //   });
      // } else {
      //   return res
      //     .writeHead(400)
      //     .end(JSON.stringify({ message: "incorrect id" }));
      // }

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params;

      const dateNow = moment(new Date());

      const task = await client.tasks.findUnique({
        where: {
          id: id,
        },
      });

      if (!task) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "incorrect id" }));
      }

      const completed_at = !task.completed_at ? dateNow : null;

      try {
        await database.update(id, { completed_at });
      } catch (error) {
        return res.writeHead(400).end(JSON.stringify({ message: error }));
      }

      return res.writeHead(204).end();
    },
  },
];
