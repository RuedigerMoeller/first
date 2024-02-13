import { Client, Pool } from "https://deno.land/x/postgres/mod.ts";
import { VolEntry } from "./finvizparse.ts";
import { FinVizParse } from "./finvizparse.ts";

let singleton: DB = null;

export function DBW(): DB {
  if (singleton == null) {
    singleton = new DB();
  }
  return singleton;
}

class DB {
  pool: Pool;

  constructor() {
    this.pool = new Pool({
      hostname: "localhost",
      port: 5432,
      user: "postgres",
      password: "admin",
      database: "quotes",
      tls: {
        enabled: false, // Disable TLS/SSL
      },
    }, 10);
  }

  replaceNamedPlaceholders(query, params) {
    const keys = [];
    const values = [];

    let index = 0;
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      index++;
      keys.push(key);
      values.push(params[key]);
      return `$${index}`;
    });

    return { transformedQuery, values };
  }

  async query(ticker: string, startMS: number, endMS: number = 0) : Promise<FinVizParse[]> {
    const query = "SELECT * FROM public.vol_entry WHERE ticker = '" + ticker.toUpperCase() +
      "' AND creation > " + startMS + " AND creation != 0 ORDER BY creation DESC";
    const client = await this.pool.connect();
    try {
      const rows: any[] = (await client.queryObject(query)).rows;
      return rows.map((row) => {
        const fwp = new FinVizParse(row.ticker, null);
        fwp.price = row.price;
        fwp.callOI = row.calloi;
        fwp.callVol = row.callvol;
        fwp.putOI = row.putoi;
        fwp.putVol = row.putvol;
        fwp.creation = Number(row.creation);
        fwp.ladder = {};
        for (const [key, value] of Object.entries(row.entries)) {
            const val : any = value;
            fwp.ladder[key] = {
                price: val.price,
                vol: val.vol.map( vole => VolEntry.Create(vole)) 
            }
        }
        return fwp;
      });
    } catch (error) {
      throw error;
    } finally {
      client.release(); // Release the client back to the pool, not closing it
    }
  }

  async insertLadder(timestamp: number, parse: any) {
    const query = `
    INSERT INTO vol_entry (creation, ticker, price, entries, putVol, callVol, putOI, callOI )
    VALUES (:creation, :ticker, :price, :entries, :putVol, :callVol, :putOI, :callOI )
    RETURNING id;`;

    const obj = {
      entries: JSON.stringify(parse.ladder),
      ...parse,
      creation: timestamp,
    };
    const { transformedQuery, values } = this.replaceNamedPlaceholders(
      query,
      obj,
    );

    const client = await this.pool.connect();

    try {
      await client.queryObject("BEGIN");

      const result = await client.queryObject(transformedQuery, values);

      await client.queryObject("COMMIT");
    } catch (error) {
      await client.queryObject("ROLLBACK");
      throw error;
    } finally {
      client.release(); // Release the client back to the pool, not closing it
    }
  }

  async disconnect() {
    await this.pool.end();
  }
}
