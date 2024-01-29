
import { RestServer } from "./lib/RestServer.ts";
import { MyApi } from "./MyApi.ts";

class MyApiImpl implements MyApi {

  async listDir(pathExt: { path: string }) {
    const cont = [];
    for await (const post of Deno.readDir( pathExt.path || `.`)) {
      cont.push(post);
    }
    return cont;
  }

}

const server: RestServer = new RestServer();
server.start( 8080, new MyApiImpl() );