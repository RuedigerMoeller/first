import { MyApi } from "./MyApi.ts";
import { RestClient } from "./lib/RestClient.ts";

const api:MyApi = RestClient("http://localhost:8080");


const res = await api.listDir({path:"."});
console.log(JSON.stringify(res,null,2));