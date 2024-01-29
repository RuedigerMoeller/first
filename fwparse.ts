
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { FinVizParse } from './finvizparse.ts';

async function dumpTicker(ticker:string, exp: string) {
    const parse = new FinVizParse(ticker,exp); 
    await parse.initFromData();
    parse.dumpReport(false);
}

// AAPL, SMCI, TSLA, UPS
await dumpTicker("UPS","2024-02-02");
await dumpTicker("AAPL","2024-02-02");
await dumpTicker("SMCI","2024-02-02");
await dumpTicker("FFIV","2024-02-16");
await dumpTicker("GGG","2024-02-16");
