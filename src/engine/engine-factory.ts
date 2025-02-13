import type { Engine } from "./engine";
import { v0Engine } from "./v0.engine";
import { v1Engine as v1CasEngine } from "./v1Cas.engine";
import { v2Engine as v2CasEngine } from "./v2Cas.engine";
import { v1Engine } from "./v1.engine";

export type EngineType = {
    name: string;
    version: string
    executor: Engine|null;
}

type EngineConstructor = new () => Engine;
export type EngineOption = {
    name: string;
    version: string;
    construct: EngineConstructor|null
}

export const engines: { [key: string]: EngineOption } = {
    human: { name: 'manual', version: 'human', construct: null },
    v0: { name: 'v0-bogobot', version: 'v0', construct: v0Engine },
    v1: { name: 'v1-greedybot', version: 'v1', construct: v1Engine },
    v1Cas: { name: 'v1-cas-greedy-bot', version: 'v1-cas', construct: v1CasEngine },
    v2Cas: { name: 'v1-cas-alpha-bot', version: 'v2-cas', construct: v2CasEngine }
}

export class EngineFactory {
    static create(version: string): EngineType {

      const engine = engines[version];
      console.log(engine);
      return { name: engine.name, version, executor: engine.construct !== null ? new engine.construct() : null };

    }

    static getEngines(): { [key: string]: EngineOption } {
      return engines;
    }
}
