import { Response } from "https://deno.land/std/http/server.ts";
import { extname } from "https://deno.land/std/fs/path.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";

export interface APIRequestHandlerOptions {
  encoder: TextEncoder;
  address: string;
  environment: string;
  debug: boolean;
}

/**
 * Handle requests to /api endpoint
 */
export class APIRequestHandler implements RequestHandler {
  private options: APIRequestHandlerOptions;

  constructor(options: APIRequestHandlerOptions) {
    this.options = options;
  }

  async handle(path: string, options: RequestHandlerOptions) {
    if (path.indexOf("/api/") !== 0) return null;
    path = path.substr("/api".length);

    const response: Response = this.server(path, options);
    if (!response) return null;

    const headers = new Headers();
    headers.set("content-type", contentType(extname(path)));
    response.headers = headers;
    return response;
  }

  server(path: string, _options: RequestHandlerOptions) {
    if (path !== "/server") return null;
    const { encoder, address, debug } = this.options;
    return {
      body: encoder.encode(JSON.stringify({ address, debug }))
    };
  }
}
