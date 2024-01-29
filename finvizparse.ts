
export function fileExists(filePath: string): boolean {
    try {
      Deno.readTextFileSync(filePath);
      const fileInfo = Deno.statSync(filePath);
      return new Date().getTime() - fileInfo.mtime.getTime() < 1000*60*5;
    } catch (error) {
      return false;
    }
}

export class VolEntry { 
    traded: number;
    open: number;
    bid: number;
    ask: number;

    constructor() {
        this.traded = 0;
        this.open = 0;
        this.bid = 0;
        this.ask = 0;
    }

    getVolPrice() {
        return this.bid * this.traded;
    }

    getOpenPrice() {
        return this.bid * this.open;
    }
};


export class FinVizParse {
    ticker: string;
    json;
    price:number;
    ladder :  Record<number, { price: number, vol : VolEntry[]}> = {};
    callVol: number = 0;
    putVol: number = 0;
    expiry: string;

    constructor(ticker: string, exp = "2024-02-02") {
        this.ticker = ticker;
        this.expiry = exp;
    }

    async initFromData() {
        if ( fileExists(this.ticker+".json") ) {
            this.json = JSON.parse(Deno.readTextFileSync(this.ticker+".json"));
            console.log("read cached file ..");
        } else {
            const resp = await fetch("https://finviz.com/api/options/"+this.ticker+"?expiry="+this.expiry);
            this.json = await resp.json();
            Deno.writeTextFileSync(this.ticker+".json",JSON.stringify(this.json));
        }
        this.price = this.json.lastClose as number;
        this.json.options.forEach(element => {
            //console.log(element);
            if ( !this.ladder[element.strike] ) {
                this.ladder[element.strike] = { price: element.strike, vol: [ new VolEntry(), new VolEntry() ] };
            }
            const entry = this.ladder[element.strike];
            const index = element.type == 'put' ? 1 : 0;
            entry.vol[index].traded = element.lastVolume; 
            entry.vol[index].open = element.openInterest; 
            entry.vol[index].bid = element.bidPrice; 
            entry.vol[index].ask = element.askPrice; 
        });
    }

    computeVolume(openInterest: boolean = false) {
        this.callVol = 0;
        this.putVol = 0;

        let pricePrint = false;
        Object.values(this.ladder).toSorted( (a,b) => a.price-b.price ).forEach( rec => {
            const cw = openInterest ? rec.vol[0].getOpenPrice() : rec.vol[0].getVolPrice();
            const pw = openInterest ? rec.vol[1].getOpenPrice() : rec.vol[1].getVolPrice();

            this.callVol += cw;
            this.putVol += pw;
        })

    }

    dumpReport(openInterest: boolean = false ) {
        this.computeVolume(openInterest);
        const fullVol = this.callVol+this.putVol;
        let pricePrint = false;
        console.log("Ticker: "+this.ticker+" ====================================================")
        Object.values(this.ladder).toSorted( (a,b) => a.price-b.price ).forEach( rec => {
            const cw = openInterest ? rec.vol[0].getOpenPrice() : rec.vol[0].getVolPrice();
            const pw = openInterest ? rec.vol[1].getOpenPrice() : rec.vol[1].getVolPrice();

            if ( rec.price > this.price && !pricePrint ) {
                console.log( "CURRENT "+this.price);
                pricePrint = true;
            }
            if ( (cw+pw)/fullVol > .01  )
                console.log("Price "+rec.price+" \t"+cw.toFixed(2).padStart(20," ")+" \t"+pw.toFixed(2).padStart(20," "))
        })
        
        console.log("");
        console.log("Call Volume "+this.callVol.toFixed(2));
        console.log("Put Volume "+this.putVol.toFixed(2));
        console.log("PC Ratio "+ (this.putVol/this.callVol).toFixed(2));
        console.log("");
        
    }    
    
}