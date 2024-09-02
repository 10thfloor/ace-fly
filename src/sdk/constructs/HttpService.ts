import { Construct } from "./Construct.js";

export class HttpService extends Construct {
  constructor(
    scope: Construct,
    private config: HttpServiceConfig
  ) {
    super(scope, config.name);

    // The Fly Proxy is not a separate machine, but rather a service
    // that manages routing for the app's machines
  }
}

export interface HttpServiceConfig {
  name: string;
  internalPort?: number;
  forceHttps?: boolean;
  autoStopMachines?: boolean;
  autoStartMachines?: boolean;
  minMachinesRunning?: number;
  concurrency?: {
    type: 'connections' | 'requests';
    softLimit: number;
    hardLimit: number;
  };
  httpOptions?: {
    idleTimeout?: number;
    response?: {
      pristine?: boolean;
      headers?: Record<string, string | boolean | string[]>;
    };
    h2Backend?: boolean;
  };
  tlsOptions?: {
    alpn?: string[];
    versions?: string[];
    defaultSelfSigned?: boolean;
  };
  checks?: Array<{
    gracePeriod?: string;
    interval?: string;
    method?: string;
    timeout?: string;
    path?: string;
    protocol?: 'http' | 'https';
    tlsServerName?: string;
    tlsSkipVerify?: boolean;
    headers?: Record<string, string>;
  }>;
}