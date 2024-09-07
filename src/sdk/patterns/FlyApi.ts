import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { HttpService } from "../constructs/HttpService";

export interface ApiRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handlerFile: string;
}

export interface FlyApiProps {
  routes: ApiRoute[];
}

export class FlyApi extends StackConstruct {
  private routes: ApiRoute[];
  private httpService: HttpService;
  private env: Record<string, string> = {};

  constructor(stack: FlyStack, id: string, props: FlyApiProps) {
    super(stack, id);
    this.routes = props.routes;

    this.httpService = new HttpService(stack, `${id}-http-service`, {
      name: `${id}-api`,
      internal_port: 3000, 
      auto_stop_machines: true,
      auto_start_machines: true,
      min_machines_running: 1,
      processes: ["api"],
      concurrency: {
        type: 'connections',
        soft_limit: 25,
        hard_limit: 30,
      },
    });
  }

  getHttpService(): HttpService {
    return this.httpService;
  }

  addEnv(key: string, value: string): void {
    this.env[key] = value;
    // this.httpService.addEnv(key, value);
  }

  validate(): boolean {
    // Implement validation logic if needed
    return true; // or false based on validation logic
  }

  getName(): string {
    return this.getName();
  }

  getInternalPort(): number {
    return this.httpService.getInternalPort();
  }

  synthesize(): Record<string, any> {
    return {
      type: "fly-api",
      routes: this.routes,
      httpService: this.httpService.synthesize(),
      env: this.env,
    };
  }
}