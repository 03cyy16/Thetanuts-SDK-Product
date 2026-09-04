# Thetanuts Finance Options Strategy Explorer

A professional options strategy explorer built for the **Thetanuts Finance** hackathon track.

The application helps traders explore options strategies, monitor market conditions, understand risk exposure, analyze implied volatility, and track portfolio activity through one focused trading workspace.

## Features

- **Strategy Dashboard**  
  Build and compare options strategies including Bull Call Spreads, Covered Calls, Bear Put Spreads, and Iron Condors.

- **Market Overview**  
  View spot price, implied volatility, options volume, open interest, put-call ratio, max pain, funding rate, and active contracts.

- **Positions Workspace**  
  Monitor portfolio value, unrealized profit and loss, open positions, upcoming expiries, margin usage, and risk exposure.

- **Strategy Scanner**  
  Explore structured trading ideas across directional, income, volatility, and hedging strategies.

- **Options Analytics**  
  Review implied-volatility term structure, IV rank, expected move, Greeks, and a volatility surface across strikes and expiries.

- **History**  
  Track openings, closings, expiries, deposits, realized P&L, win rate, and premium collected.

- **Watchlist**  
  Follow assets including BTC, ETH, SOL, and BNB with live-style prices, volatility, volume, open interest, and market signals.

- **Responsive Interface**  
  Designed to work across desktop and mobile screens.

## Tech Stack

- Next.js
- React
- TypeScript
- CSS
- Tailwind CSS
- Thetanuts Finance / Base ecosystem

## Getting Started

### Prerequisites

Install the following first:

- Node.js 18 or newer
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/03cyy16/Thetanuts-SDK-Product.git
```

Go into the project folder:

```bash
cd Thetanuts-SDK-Product
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

```bash
npm run dev
```

Starts the app locally in development mode.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Runs the production build locally after `npm run build`.

## Product Flow

1. Select an asset and options strategy on the Dashboard.
2. Review the strategy payoff chart, strike price, premium, expiry, and implied volatility.
3. Use Market to understand liquidity, sentiment, and active contracts.
4. Use Strategies to discover trade structures suited to a market view.
5. Use Analytics to study volatility, expected move, and Greeks.
6. Use Positions to manage open exposure and expiry risk.
7. Use History to review outcomes and trading activity.
8. Use Watchlist to monitor assets and potential opportunities.

## Project Structure

```text
app/
  api/market/         Market data route
  dashboard.css       Main application styling
  globals.css         Global styling
  icon.svg            Thetanuts browser icon
  layout.tsx          App metadata and root layout
  page.tsx            Main application and trading views

components/
  PayoffChart.tsx     Payoff chart component

lib/
  thetanuts.ts        Thetanuts-related utilities and integrations
```

## Note on Market Data

The current prototype includes dynamic, live-style market presentation for demonstration purposes. It is structured to support live Thetanuts Protocol and Base ecosystem data integrations.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Built For

Thetanuts Finance hackathon track.

Built to make on-chain options feel more transparent, professional, and approachable.
