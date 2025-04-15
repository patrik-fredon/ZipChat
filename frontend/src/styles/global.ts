import { createGlobalStyle } from 'styled-components';
import { colors, typography } from './design-system';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${typography.fontFamily};
    background-color: ${colors.background.default};
    color: ${colors.text.primary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${colors.primary.main};
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: ${colors.primary.dark};
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.background.default};
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.text.disabled};
    border-radius: 4px;

    &:hover {
      background: ${colors.text.secondary};
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`; 