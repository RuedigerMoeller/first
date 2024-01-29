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
        return new Response(JSON.stringify(res),{ status: 200 });
      } catch (e) {
        console.log(e);
        const body = JSON.stringify( { message: e.message });
        return new Response(body,{ status: 500 });
      }
    }
    
    async handler(request: Request): Promise<Response> {
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
  