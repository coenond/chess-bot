import type { Engine } from "./engine";
import { v0Engine } from "./v0.engine";
import { v1Engine } from "./v1.engine";
import { v2Engine } from "./v2/v2.engine";

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
    { name: 'v2-smarter-greedy', version: 'v2', construct: v2Engine }
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
