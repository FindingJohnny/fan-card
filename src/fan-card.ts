import { mdiDotsVertical, mdiFan } from "@mdi/js";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  LovelaceCardEditor,
  getLovelace,
  fireEvent,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types

import { styles } from "./styles";
import './editor';

import type { FanCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  FAN-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'fan-card',
  name: 'fan Card',
  description: 'A template custom card for you to create something awesome',
});

const SpeedDictionary: Record<string, string> = {
  'off': 'Off',
  'low': 'Low',
  'medium': 'Medium',
  'medium_high': 'Medium High',
  'high': 'High'
};

// TODO Name your custom element - DONE
@customElement('fan-card')
export class FanCard extends LitElement {
  private _fanSpeedTimeout?: number;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('fan-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here - OPTIMIZE HERE???
  // https://lit-element.polymer-project.org/guide/properties
  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: FanCardConfig;
  @internalProperty() private currentFanSpeedIndex: number = -1;

  // https://lit-element.polymer-project.org/guide/properties#accessors-custom
  public setConfig(config: FanCardConfig): void {
    // TODO Check for required fields and that they are of the proper format - OPTIMIZE HERE
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Fan',
      ...config,
    };
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | void {
    console.log('RENDERING');
    if (!this.config || !this.hass || !this.config.entity) {
      return;
    }

    const state = this.hass.states[this.config.entity];
    const speedList: string[] = state.attributes.speed_list;
    const speedCount = speedList.length - 1;
    const name = this.config.name;
    let currentSpeedString = state.attributes.speed;
    let localizedChangingSpeed = currentSpeedString;

    if (this.currentFanSpeedIndex === -1) {
      console.log('Update Speed');
      this.currentFanSpeedIndex = speedList.indexOf(state.attributes.speed);
    }

    if (SpeedDictionary[localizedChangingSpeed]) {
      localizedChangingSpeed = SpeedDictionary[localizedChangingSpeed];
    }

    return html`
      <ha-card>
        <mwc-icon-button
          class="more-info"
          label="Open more info"
          @click=${this._handleMoreInfo}
          tabindex="0"
        >
          <ha-svg-icon .path=${mdiDotsVertical}></ha-svg-icon>
        </mwc-icon-button>

        <div class="content">
          <div id="controls" class="container">
            <div id="slider">
              <round-slider class='test' value="${this.currentFanSpeedIndex}" step="1" min="0" max="${speedCount}" valuelabel="Temperature" @value-changing="${this._sliderValueChanging}}" @value-changed="${this._sliderValueChanged}}"></round-slider>
              <!-- <ha-icon-button class="fan-button" icon="hass:fan"></ha-icon-button> -->
              <mwc-icon-button
                label="Open more info"
                @click=${this._handleMoreInfo}
                tabindex="0"
                class="fan-button"
              >
                <ha-svg-icon id="fan-icon" class="${this.getFanAnimationClass(this.currentFanSpeedIndex)}" .path=${mdiFan}></ha-svg-icon>
              </mwc-icon-button>
            </div>
          </div>
          <div id="info">
            <div class="speed">placeholder</div>
            <div>${ name ?? state.attributes.friendly_name}</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _sliderValueChanging(e: any): void {
    const value = e.detail.value;

    if (!this.config || !this.hass || !this.config.entity) {
      return;
    }

    const state = this.hass.states[this.config.entity];
    let selectedSpeed = state.attributes.speed_list[value];

    if (SpeedDictionary[selectedSpeed]) {
      selectedSpeed = SpeedDictionary[selectedSpeed];
    }

    this.shadowRoot!.querySelector(
      ".speed"
    )!.innerHTML = `${selectedSpeed}`;
    this._showSpeed();
    this._hideSpeed();
  }

  private _showSpeed(): void {
    clearTimeout(this._fanSpeedTimeout);
    this.shadowRoot!.querySelector(".speed")!.classList.add(
      "show_speed"
    );
  }

  private _hideSpeed(): void {
    this._fanSpeedTimeout = window.setTimeout(() => {
      this.shadowRoot!.querySelector(".speed")!.classList.remove(
        "show_speed"
      );
    }, 500);
  }

  private _sliderValueChanged(e: any): void {
    console.log(e);
    const sliderValue = e.detail.value;
    const state = this.hass.states[this.config.entity];
    const selectedSpeed = state.attributes.speed_list[sliderValue];

    console.log(`Slider Value: ${sliderValue}`);
    console.log(`this.currentFanSpeedIndex: ${this.currentFanSpeedIndex}`);
    this.currentFanSpeedIndex = sliderValue;
    console.log(`this.currentFanSpeedIndex: ${this.currentFanSpeedIndex}`);

    const payload = {
      //eslint-disable-next-line @typescript-eslint/camelcase
      entity_id: this.config.entity,
      speed: selectedSpeed
    }
    this.hass.callService("fan", "set_speed", payload);
  }

  private getFanAnimationClass(fanSpeedIndex: number): string {
    console.log(`Fan Speed Index: ${fanSpeedIndex}`);
    if (!this.config.should_animate) {
      return 'rotate-off';
    }
    switch (fanSpeedIndex) {
      case 0: { // OFF
        console.log('Off');
        return 'rotate-off';
      }
      case 1: { // LOW
        console.log('Low');
        return 'rotate-low';
      }
      case 2: { // MEDIUM
        console.log('Medium');
        return 'rotate-medium';
      }
      case 3: { // MEDIUM_HIGH
        console.log('Medium_high')
        return 'rotate-medium-high';
      }
      case 4: { // HIGH
        console.log('High');
        return 'rotate-high';
      }
      default: {
        console.log('Default');
        return 'rotate-off'
      }
    }
  }

  private _handleMoreInfo(): void {
    fireEvent(this, "hass-more-info", {
      entityId: this.config!.entity!,
    });
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResult {
    return styles;
  }
}
