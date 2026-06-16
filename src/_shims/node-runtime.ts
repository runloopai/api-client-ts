/**
 * Disclaimer: modules in _shims aren't intended to be imported by SDK users.
 */
import * as nf from 'node-fetch';
import * as fd from 'formdata-node';
import { type File, type FilePropertyBag } from 'formdata-node';
import KeepAliveAgent from 'agentkeepalive';
import { AbortController as AbortControllerPolyfill } from 'abort-controller';
import { ReadStream as FsReadStream } from 'node:fs';
import { type Agent } from 'node:http';
import { FormDataEncoder } from 'form-data-encoder';
import { Readable } from 'node:stream';
import { type RequestOptions } from '../core';
import { MultipartBody } from './MultipartBody';
import { type Shims } from './registry';
import { ReadableStream } from 'node:stream/web';
import { createH2Fetch } from '../lib/h2-transport';

type FileFromPathOptions = Omit<FilePropertyBag, 'lastModified'>;

let fileFromPathWarned = false;
const DEFAULT_HTTP_AGENT_MAX_SOCKETS = 256;

/**
 * @deprecated use fs.createReadStream('./my/file.txt') instead
 */
async function fileFromPath(path: string): Promise<File>;
async function fileFromPath(path: string, filename?: string): Promise<File>;
async function fileFromPath(path: string, options?: FileFromPathOptions): Promise<File>;
async function fileFromPath(path: string, filename?: string, options?: FileFromPathOptions): Promise<File>;
async function fileFromPath(path: string, ...args: any[]): Promise<File> {
  // this import fails in environments that don't handle export maps correctly, like old versions of Jest
  const { fileFromPath: _fileFromPath } = await import('formdata-node/file-from-path');

  if (!fileFromPathWarned) {
    console.warn(`fileFromPath is deprecated; use fs.createReadStream(${JSON.stringify(path)}) instead`);
    fileFromPathWarned = true;
  }
  // @ts-ignore
  return await _fileFromPath(path, ...args);
}

const defaultHttpAgents = new Map<number, Agent>();
const defaultHttpsAgents = new Map<number, Agent>();

function getOrCreateDefaultAgent(url: string, httpAgentMaxSockets = DEFAULT_HTTP_AGENT_MAX_SOCKETS): Agent {
  const isHttps = url.startsWith('https');
  const cache = isHttps ? defaultHttpsAgents : defaultHttpAgents;
  const cached = cache.get(httpAgentMaxSockets);
  if (cached) return cached;

  const options = {
    keepAlive: true,
    timeout: 10 * 60 * 1000,
    maxSockets: httpAgentMaxSockets,
    maxFreeSockets: httpAgentMaxSockets,
    freeSocketTimeout: 30_000,
  };
  const agent: Agent = isHttps ? new KeepAliveAgent.HttpsAgent(options) : new KeepAliveAgent(options);
  cache.set(httpAgentMaxSockets, agent);
  return agent;
}

async function getMultipartRequestOptions<T = Record<string, unknown>>(
  form: fd.FormData,
  opts: RequestOptions<T>,
): Promise<RequestOptions<T>> {
  const encoder = new FormDataEncoder(form);
  const readable = Readable.from(encoder);
  const body = new MultipartBody(readable);
  const headers = {
    ...opts.headers,
    ...encoder.headers,
    'Content-Length': encoder.contentLength,
  };

  return { ...opts, body: body as any, headers };
}

export function getRuntime(): Shims {
  // Polyfill global object if needed.
  if (typeof AbortController === 'undefined') {
    // @ts-expect-error (the types are subtly different, but compatible in practice)
    globalThis.AbortController = AbortControllerPolyfill;
  }
  return {
    kind: 'node',
    fetch: nf.default,
    makeHttp2Fetch: createH2Fetch,
    Request: nf.Request,
    Response: nf.Response,
    Headers: nf.Headers,
    FormData: fd.FormData,
    Blob: fd.Blob,
    File: fd.File,
    ReadableStream,
    getMultipartRequestOptions,
    getDefaultAgent: getOrCreateDefaultAgent,
    fileFromPath,
    isFsReadStream: (value: any): value is FsReadStream => value instanceof FsReadStream,
  };
}
