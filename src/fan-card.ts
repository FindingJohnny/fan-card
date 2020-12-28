import { mdiDotsVertical } from "@mdi/js";
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
  private _brightnessTimeout?: number;

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
  @internalProperty() private changingSpeed = '';

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
    // TODO Check for stateObj or other necessary things and render a warning if missing - OPTIMIZE HERE
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    if (!this.config || !this.hass || !this.config.entity) {
      return;
    }

    console.log(this.config.entity);
    const state = this.hass.states[this.config.entity];
    console.log(state)

    let speedList: string[] = state.attributes.speed_list;
    const speedCount = speedList.length - 1;
    let currentSpeedString = state.attributes.speed;
    console.log(`current speed string: ${currentSpeedString}`)
    console.log(`current speed list: ${speedList}`)
    let currentSpeedIndex = speedList.indexOf(currentSpeedString);
    console.log(`current speed index: ${currentSpeedIndex}`)
    if (SpeedDictionary[currentSpeedString]) {
      currentSpeedString = SpeedDictionary[currentSpeedString];
    }

    const name = this.config.name;
    let localizedChangingSpeed = this.changingSpeed;
    if (SpeedDictionary[localizedChangingSpeed]) {
      localizedChangingSpeed = SpeedDictionary[localizedChangingSpeed];
    }
    console.log('currentSpeedIndex');
    console.log(currentSpeedIndex);

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
              <round-slider class='test' value="${currentSpeedIndex}" step="1" min="0" max="${speedCount}" valuelabel="Temperature" @value-changing="${this._sliderValueChanging}}" @value-changed="${this._sliderValueChanged}}"></round-slider>
              <ha-icon-button class="fan-button" icon="hass:fan"></ha-icon-button>
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

    if (this.changingSpeed !== selectedSpeed) {
      if (SpeedDictionary[selectedSpeed]) {
        selectedSpeed = SpeedDictionary[selectedSpeed];
      }
      this.changingSpeed = selectedSpeed;
      console.log(selectedSpeed);
      console.log(e);
      console.log(value);
    }

    this.shadowRoot!.querySelector(
      ".speed"
    )!.innerHTML = `${this.changingSpeed}`;
    this._showSpeed();
    this._hideSpeed();
  }

  private _showSpeed(): void {
    clearTimeout(this._brightnessTimeout);
    this.shadowRoot!.querySelector(".speed")!.classList.add(
      "show_speed"
    );
  }

  private _hideSpeed(): void {
    this._brightnessTimeout = window.setTimeout(() => {
      this.shadowRoot!.querySelector(".speed")!.classList.remove(
        "show_speed"
      );
    }, 500);
  }

  private _sliderValueChanged(e: any): void {
    console.log(e);
    const value = e.detail.value;
    console.log(value);

    if (!this.config || !this.hass || !this.config.entity) {
      return;
    }

    const state = this.hass.states[this.config.entity];

    const selectedSpeed = state.attributes.speed_list[value];
    console.log(selectedSpeed);

    const payload = {
      //eslint-disable-next-line @typescript-eslint/camelcase
      entity_id: "fan.office_ceiling",
      speed: selectedSpeed
    }
    this.hass.callService("fan", "set_speed", payload);
  }

  private _handleMoreInfo(): void {
    fireEvent(this, "hass-more-info", {
      entityId: this.config!.entity!,
    });
  }


  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResult {
    return css`
      ha-card {
        height: 100%;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        text-align: center;
        --name-font-size: 1.2rem;
        --brightness-font-size: 1.2rem;
      }

      .more-info {
        position: absolute;
        cursor: pointer;
        top: 0;
        right: 0;
        border-radius: 100%;
        color: var(--secondary-text-color);
        z-index: 1;
      }

      .content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      #controls {
        display: flex;
        justify-content: center;
        padding: 16px;
        position: relative;
      }

      #slider {
        height: 100%;
        width: 100%;
        position: relative;
        max-width: 200px;
        min-width: 100px;
      }

      round-slider {
        --round-slider-path-color: var(--disabled-text-color);
        --round-slider-bar-color: var(--primary-color);
        padding-bottom: 10%;
      }

      .fan-button {
        color: var(--paper-item-icon-color, #44739e);
        width: 60%;
        height: auto;
        position: absolute;
        max-width: calc(100% - 40px);
        box-sizing: border-box;
        border-radius: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        --mdc-icon-button-size: 100%;
        --mdc-icon-size: 100%;
      }

      #info {
        text-align: center;
        margin-top: -56px;
        padding: 16px;
        font-size: var(--name-font-size);
      }

      .speed {
        font-size: var(--brightness-font-size);
        opacity: 0;
        transition: opacity 0.5s ease-in-out 0s;
      }

      .show_speed {
        opacity: 1;
      }
    `;
  }
}
