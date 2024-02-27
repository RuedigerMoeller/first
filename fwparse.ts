import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { FinVizParse } from "./lib/finvizparse.ts";
import { DBW } from "./lib/DB.ts";

const db = DBW();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//const res = await db.query("AAPL", 1706698804941 );
//res.forEach( fwp => console.log( new Date(fwp.creation) + " PRICE"+fwp.price+" PC:"+fwp.getPCVolRatio().toFixed(2)+" IOR:" + fwp.getPCOIRatio().toFixed(2) ));

async function dumpTicker(ticker: string, exp: string, ins: boolean = true) {
  const parse = new FinVizParse(ticker, exp);
  await parse.initFromData();
  if (ins) {
    await db.insertLadder(new Date().getTime(), parse);
  }
  parse.dumpReport(false);
}

async function poll(ins: boolean = true) {
  const expiry = "2024-03-01";
  const slowExpiry = "2024-03-15";
  let syms = [
    "WDAY",
    "BKNG",
    "CVNA",
    "LEN",
    "SQ",
    "TSLA",
    "AMZN",
    "ADBE",
    "ASML",
    "ABNB",
    "DKNG",
    "TTD",
    "TDOC",
    "AAPL",
    "DBX",
    "AMAT",
    "DASH",
    "TWLO",
    "AMD",
    "META",
    "MSFT",
    "GOOG",
    "CSCO",
    "NVDA",
    "BABA",
    "SOFI",
    "TOST",
    "SNAP",
    "SMCI",
    "ELF",
    "Z",
    "DIS",
    "PYPL",
    "SHOP",
    "WMT",
    "DDOG",
    "SPY",
    "QQQ",
  ];
  syms = [...new Set(syms)];

  let slowSyms = [
    "TXRH",
    "CDNS",
    "HUBS",
  ];
  slowSyms = [...new Set(slowSyms)];

  for (let index = 0; index < syms.length; index++) {
    const sym = syms[index];
    dumpTicker(sym, expiry, ins);
    await sleep(3000);
  }
  for (let index = 0; index < slowSyms.length; index++) {
    const sym = slowSyms[index];
    dumpTicker(sym, slowExpiry, ins);
    await sleep(3000);
  }
}

function executeWithinTimeFrame() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  // Set the start time (15:30)
  start.setHours(15, 30, 0, 0);

  // Set the end time (24:00, which is technically 00:00 of the next day)
  end.setHours(22, 30, 0, 0);

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
