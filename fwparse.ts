import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { FinVizParse } from "./lib/finvizparse.ts";
import { DBW } from "./lib/DB.ts";

const db = DBW();

//const res = await db.query("AAPL", 1706698804941 );
//res.forEach( fwp => console.log( new Date(fwp.creation) + " PRICE"+fwp.price+" PC:"+fwp.getPCVolRatio().toFixed(2)+" IOR:" + fwp.getPCOIRatio().toFixed(2) ));

async function dumpTicker(ticker: string, exp: string, ins: boolean = true) {
  const parse = new FinVizParse(ticker, exp);
  await parse.initFromData();
  if ( ins )
    await db.insertLadder(new Date().getTime(), parse);
  parse.dumpReport(false);
}

async function poll(ins: boolean = true) {
const expiry = "2024-02-16";
  await dumpTicker("TSLA", expiry, ins);
  await dumpTicker("AMZN", expiry, ins);
  await dumpTicker("ASML", expiry, ins);
  await dumpTicker("ABNB", expiry, ins);
  await dumpTicker("AAPL", expiry, ins);
  await dumpTicker("AMD", expiry, ins);
  await dumpTicker("META", expiry,ins);
  await dumpTicker("MSFT", expiry,ins);
  await dumpTicker("GOOG", expiry,ins);
  await dumpTicker("BABA", expiry,ins);
  await dumpTicker("SOFI", expiry,ins);
  await dumpTicker("SNAP", expiry,ins);
  await dumpTicker("ELF", expiry,ins);
  await dumpTicker("Z", expiry,ins);
  await dumpTicker("DIS", expiry,ins);
  await dumpTicker("PYPL", expiry,ins);
  await dumpTicker("CDNS", expiry,ins);
  await dumpTicker("SHOP", expiry,ins);
  await dumpTicker("DDOG", expiry,ins);
  await dumpTicker("SPY", expiry,ins);
  await dumpTicker("QQQ", expiry,ins);
}

function executeWithinTimeFrame() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  // Set the start time (15:30)
  start.setHours(14, 0, 0, 0);

  // Set the end time (24:00, which is technically 00:00 of the next day)
  end.setHours(22, 17, 0, 0);

  // Check if current time is within the range
  if (now >= start && now <= end) {
    poll();
  } else {
    console.log("Outside of time frame:", new Date().toLocaleTimeString());
  }
}

poll(false);
// Set an interval to check and execute the function every 15 minutes
setInterval(executeWithinTimeFrame, 10 * 60 * 1000);
