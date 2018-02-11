import { ModelsInterface } from "./ModelsInterface";

export interface BaseModelInterface {
  protoype?;
  associate?(models: ModelsInterface): void;
}