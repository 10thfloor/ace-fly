import { StackConstruct } from "../core/StackConstruct";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
export class FlyApi extends StackConstruct {
    constructor(stack, id, props) {
        super(stack, id);
        this.env = {};
        this.routes = props.routes;
        this.httpService = new FlyHttpService(stack, `${id}-http-service`, {
            name: `${id}-api`,
            internal_port: 3000,
            auto_stop_machines: true,
            auto_start_machines: true,
            min_machines_running: 1,
            processes: ["api"],
            concurrency: {
                type: FlyHttpServiceConcurrencyType.CONNECTIONS,
                soft_limit: 25,
                hard_limit: 30,
            },
        });
        this.initialize();
    }
    getHttpService() {
        return this.httpService;
    }
    addEnv(key, value) {
        this.env[key] = value;
        // this.httpService.addEnv(key, value);
    }
    validate() {
        // Implement validation logic if needed
        return true; // or false based on validation logic
    }
    getName() {
        return this.getName();
    }
    getInternalPort() {
        return this.httpService.getInternalPort();
    }
    synthesize() {
        return {
            type: "fly-api",
            routes: this.routes,
            httpService: this.httpService.synthesize(),
            env: this.env,
        };
    }
}
