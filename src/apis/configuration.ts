import { hooks, createConfiguration } from "@midwayjs/hooks";
import { join } from "path";
import bodyParser from "koa-bodyparser";
import * as orm from "@midwayjs/orm";
import { ErrorHandle } from "./middleware/ErrorHandle";

export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser(), ErrorHandle],
    }),
    orm,
  ],
  importConfigs: [join(__dirname, "./config")],
});
