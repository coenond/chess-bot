import type { Engine } from "./engine";
import { v0Engine } from "./v0.engine";

export type EngineType = {
    name: string;
    version: string
    executor: Engine;
}

export class EngineFactory {
    static create(version: string): EngineType {
        switch (version) {
            case "v0":
                return {
                    name: 'v0-bogobot',
                    version: 'v0.0.0',
                    executor: new v0Engine()
                };
            default:
                throw new Error("Invalid engine version");
        }
    }
}