import { RawJob } from "./collector.types.js";

export interface IJobCollector {
  readonly sourceName: string;
  collect(): Promise<RawJob[]>;
}
