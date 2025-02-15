import type { Engine } from "./engine";
import { v0Engine } from "./v0.engine";
import { v1Engine as v1CasEngine } from "./v1Cas.engine";
import { v2Engine as v2CasEngine } from "./v2Cas.engine";
import { v1Engine } from "./v1.engine";
//import { v1point2Engine } from "./v1point2.engine";

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

export const engines = [
    { name: 'manual', version: 'human', construct: null },
    { name: 'v0-bogobot', version: 'v0', construct: v0Engine },
    { name: 'v1-greedybot', version: 'v1', construct: v1Engine },
    //{ name: 'v1.2-smarter-greedybot', version: 'v1.2', construct: v1point2Engine },
    { name: 'v2-cas-alpha-bot', version: 'v2Cas', construct: v2CasEngine },
];

export class EngineFactory {
    static create(version: string): EngineType {
      let engine = engines.find((engine) => engine.version === version);
      if (!engine) engine = engines[0];
      return { name: engine.name, version, executor: engine.construct !== null ? new engine.construct() : null };

    }

    static getEngines(): EngineOption[] {
      return engines;
    }
}
