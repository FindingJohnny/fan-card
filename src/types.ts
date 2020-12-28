import {
  ActionConfig,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor
} from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";

declare global {
  interface HTMLElementTagNameMap {
    "fan-card-editor": LovelaceCardEditor;
    "hui-error-card": LovelaceCard;
  }
}

// TODO Add your configuration elements here for type-checking - OPTIMIZE HERE
export interface FanCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  name?: string;
  should_animate: boolean;
}
