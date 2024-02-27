type ApiResponse = any; 

export function RestClient(basePath: string): any {
  const handler: ProxyHandler<{}> = {
    get(target: {}, property: string | symbol, receiver: any): any {
      return async function(...args: any[]): Promise<ApiResponse> {
        const res = await fetch(`${basePath}/${String(property)}`, {
          method: 'POST', // Specify the method
          headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
          },
          body: JSON.stringify(args[0]) // Convert the data object to a JSON string
        });
        const resJson: ApiResponse = await res.json();
        //console.log("client post res", resJson);
        return resJson;
      }
    },
  };

  return new Proxy({}, handler);
}
