import type { Engine } from "./engine";
import { v0Engine } from "./v0.engine";
import { v1Engine as v1CasEngine } from "./v1Cas.engine";
import { v2Engine as v2CasEngine } from "./v2Cas.engine";
import { v1Engine } from "./v1.engine";

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
            case "v1Cas":
                return {
                    name: 'v1-greediest-bot',
                    version: 'v1.0.0',
                    executor: new v1CasEngine()
                };
            case "v2Cas":
                return {
                    name: 'v2-the-alpha-bot',
                    version: 'v2.0.0',
                    executor: new v2CasEngine()
                };
            case "v1":
                return { name: 'v1-greedybot', version: 'v1.0.0', executor: new v1Engine() };

            default:
                throw new Error("Invalid engine version");
        }
    }
}