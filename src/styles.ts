import { css } from "lit-element";

export const styles = css`
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

  /* ha-icon-button /deep/ ha-svg-icon {
        animation: rotation 2s infinite linear;
      } */

  .rotate-high {
    animation: rotation 0.5s infinite linear;
  }

  .rotate-medium-high {
    animation: rotation 1s infinite linear;
  }

  .rotate-medium {
    animation: rotation 2s infinite linear;
  }

  .rotate-low {
    animation: rotation 4s infinite linear;
  }

  .rotate-off {
    animation: none;
  }

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;
