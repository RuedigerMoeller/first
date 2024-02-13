export class Literally {
  content: string;

  constructor(s:string) {
    this.content = s;
  }
}

export class RestServer {

    api: any;
  
    urlSearchParams2JSON(str:string) {
      const searchParams = new URLSearchParams(str);
      const object : Record<string,any> = {};
      searchParams.forEach((value, key) => {
        let keys: string[] = key.split('.');
        let last: string = keys.pop() as string;
        keys.reduce((r, a) => r[a] = r[a] || {}, object)[last] = value;
      });
      return object;
    }
  
    async invokeApiMethod(path: string, args: Record<string,any>) : Promise<Response> {
      path = path.split("/")[1];
      const pt = Object.getPrototypeOf(this.api);
      let fun = pt[path];
      if ( fun === undefined ) {
        return new Response( JSON.stringify( { message: "cannot find api method '"+path+"'" }), { status: 404 } );
      }
      try {
        const res = await fun.call(this.api, args);
        if ( res instanceof Literally ) {
          return new Response(res.content,{ status: 200 });
        }
        return new Response(JSON.stringify(res),{ status: 200 });
      } catch (e) {
        console.log(e);
        const body = JSON.stringify( { message: e.message });
        return new Response(body,{ status: 500 });
      }
    }
    
    async handler(request: Request): Promise<Response> {
      // const headers = new Headers();

      // headers.set("Access-Control-Allow-Origin", "*"); // Allow all domains
      // headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      // headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
      // // Handle preflight requests
      // if (request.method === "OPTIONS") {
      //   return new Response(null, {
      //     status: 204, // No content
      //     headers,
      //   });
      // }
    
      if( request.method === "GET" ) {
        let url = new URL(request.url);
        const path = url.pathname;
        const query = url.search;
        const resp: Response = await this.invokeApiMethod( path, this.urlSearchParams2JSON(query) );
        return resp;
      } else if ( request.method === 'POST' ) {
        let url = new URL(request.url);
        const path = url.pathname;
        const data = await request.json();
        const resp: Response = await this.invokeApiMethod( path, data );
        return resp;
      }
      return new Response("unhandled request", { status: 404 });
    };  
  
    start( port: number, api: any ) {
      this.api = api;
      console.log(`HTTP server running. Access it at: http://localhost:8080/`);
      Deno.serve({ port }, this.handler.bind(this) );
    }
  
  }
  