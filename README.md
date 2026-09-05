# Thetanuts SDK Product

A professional options strategy explorer designed for the **Thetanuts Finance** ecosystem. The platform gives DeFi traders one workspace to analyze markets, explore options strategies, understand volatility, manage positions, and monitor portfolio risk.

Built for the Thetanuts Finance hackathon track.

## Project Description

Thetanuts SDK Product is an options intelligence and strategy-exploration interface for on-chain traders.

Users can:

- Explore options strategies such as Bull Call Spreads, Covered Calls, Bear Put Spreads, and Iron Condors
- Review strategy payoff, premium, strike price, expiry, and implied volatility
- Monitor market price, volume, open interest, put-call ratio, and market sentiment
- Track open positions, unrealized profit and loss, margin use, and risk exposure
- Analyze implied volatility, expected move, Greeks, and volatility structure
- Review activity history and maintain an asset watchlist

The product is designed to make on-chain options feel more understandable and professional for both experienced traders and newer DeFi users.

## Problem Statement

Options are valuable tools for hedging, earning premium, and expressing market views. However, on-chain options can be difficult to use because traders often need to switch between multiple products to answer important questions:

- What is the market currently pricing in?
- Which strategy matches my market view?
- What is the maximum possible profit or loss?
- How does volatility affect the trade?
- What risk do I currently have across my portfolio?
- Which contracts have liquidity and activity?

This fragmented experience makes options feel technical and inaccessible.

Thetanuts SDK Product solves this by bringing market intelligence, options strategy analysis, portfolio risk monitoring, analytics, history, and watchlists into a single trader-focused interface.

## Blockchain Technology Used

This project is built for the **Base** ecosystem and is designed around the Thetanuts Finance on-chain options experience.

### Technologies

- **Base** — Ethereum Layer 2 network used for low-cost, fast on-chain interactions
- **Thetanuts Finance** — Options protocol ecosystem and product inspiration
- **Ethereum-compatible wallets** — Intended for user wallet connection and transaction signing
- **Next.js** — Frontend framework
- **React** — User-interface library
- **TypeScript** — Type-safe application development
- **CSS / Tailwind CSS** — Responsive user-interface styling

## Smart Contract Addresses — Testnet

This submission is currently a frontend and product-experience prototype. No custom smart contracts were deployed by the team for this version.

| Contract | Network | Address |
|---|---|---|
| Thetanuts SDK Product contracts | Base Sepolia Testnet | Not deployed |
| Thetanuts Protocol integration | Base / Base Sepolia | To be connected in a future iteration |

If smart contracts are deployed later, update this table with the verified contract name, network, address, and block explorer link.

## Features

### Dashboard

Build and inspect options strategies with:

- Asset selection
- Strategy selection
- Expiry selection
- Market or custom order price
- Strike price and premium details
- Implied volatility
- Interactive profit-and-loss payoff chart

### Market

Monitor professional market indicators including:

- Live-style asset price
- 24-hour movement
- Options volume
- Open interest
- At-the-money implied volatility
- Put-call ratio
- Max pain
- Funding rate
- Most active contracts

### Positions

Manage portfolio exposure through:

- Portfolio value
- Unrealized profit and loss
- Margin utilization
- Open positions
- Upcoming expiries
- Delta, theta, and vega exposure

### Strategies

Discover trade structures based on a trader’s objective:

- Directional strategies
- Income strategies
- Volatility strategies
- Hedging strategies

### Analytics

Understand options pricing through:

- Implied-volatility term structure
- IV rank
- Expected move
- Greeks snapshot
- Volatility surface

### History and Watchlist

- Review trade activity and realized results
- Track win rate and premium collected
- Monitor selected assets and market signals

## Setup and Installation

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) version 18 or newer
- npm
- Git

### Clone the Repository

```bash
git clone https://github.com/03cyy16/Thetanuts-SDK-Product.git
```

### Enter the Project Folder

```bash
cd Thetanuts-SDK-Product
```

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm.cmd run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

### Create a Production Build

```bash
npm run build
```

### Run the Production Build

```bash
npm run start
```

## Project Structure

```text
app/
  api/market/         Market data route
  dashboard.css       Application and trading workspace styling
  globals.css         Global styling
  icon.svg            Thetanuts browser icon
  layout.tsx          Metadata and root layout
  page.tsx            Dashboard and trading views

components/
  PayoffChart.tsx     Options payoff visualization

lib/
  thetanuts.ts        Thetanuts-related utilities and integrations
```

## Future Improvements

- Connect live Thetanuts Protocol market and options data
- Add wallet connection through Base-compatible wallets
- Integrate Base Sepolia testnet contracts
- Enable real order placement and position management
- Add user-specific portfolio persistence
- Add alerts for volatility, expiry, and price conditions

## Team Members

| Name | Role |
|---|---|
| Chai Yenyit | Product design  frontend developmentn |
| Chua Qin Pei | Backend development and presentation|
| Anson Heng Xan You | Backend development and presentation |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thetanuts Finance
- Base
- The open-source Next.js and React communities
