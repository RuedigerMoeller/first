import { MyApi } from './MyApi.ts';
import { RestClient } from './lib/RestClient.ts';
const ticker = "TSLA";

const api : MyApi = RestClient("http://localhost:8080");

let data = await api.query({ ticker, rangeDays: 0 });

const transformed = data.map( x => {
    return {
        ts: new Date(x.dt).getTime(),
        activeVol: x.activeVol,
        oi: x.oi,
        price: Number(x.price),
        ticker: x.ticker,
        vol:x.vol
    }
});


const grouped = [];

let curDay = -1;
let curArr = null;
transformed.forEach( x => {
    const d = new Date(x.ts).getDay();
    if ( d != curDay ) {
        curDay = d;
        curArr = [];
        grouped.push(curArr);
    }
    curArr.push(x);
});

grouped.forEach( a => a.reverse() );
grouped.reverse();

for (let index = 1; index < grouped.length; index++) {
    const prev = grouped[index];
    const cur = grouped[index];
    const prevPrc = prev[prev.length-1].price;
    const curPrc = cur[0].price;
    console.log( new Date(cur[0].ts)+" "+prevPrc+" "+curPrc+" rate:"+(100*(1-curPrc/prevPrc)).toFixed(2)+"%");
}

console.log(grouped);

console.log(transformed);

