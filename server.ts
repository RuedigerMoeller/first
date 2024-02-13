import { Literally, RestServer } from "./lib/RestServer.ts";
import { MyApi } from "./MyApi.ts";
import { DBW } from "./lib/DB.ts";
import { FinVizParse } from "./lib/finvizparse.ts";

const db = DBW();

class MyApiImpl implements MyApi {
  async listDir(pathExt: { path: string }) {
    const cont = [];
    for await (const post of Deno.readDir(pathExt.path || `.`)) {
      cont.push(post);
    }
    return cont;
  }

  async query(query: { ticker: string; rangeDays: number }) {
    let startMS = 0;
    if (!query.rangeDays) {
      startMS = 0;
    } else {
      startMS = new Date().getTime() - query.rangeDays * 24 * 60 * 60 * 1000;
    }

    const res: FinVizParse[] = await db.query(query.ticker, startMS);
    return new Literally(JSON.stringify(
      res.map((x) => {
        return {
          dt: new Date(x.creation),
          ticker: x.ticker,
          price: x.price,
          vol: x.getPCVolRatio(),
          oi: x.getPCOIRatio(),
          activeVol: Number(x.callVol) + Number(x.putVol),
        };
      }),
      null,
      2,
    ));
  }
}

const server: RestServer = new RestServer();
server.start(8080, new MyApiImpl());
