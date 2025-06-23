# Budgeting App

A React-based web application for viewing and analyzing CSV transaction data from Wise bank accounts.

## Features

- **Month Selection**: Select and view data for specific months using a dropdown selector
- **Automatic Data Loading**: Automatically loads CSV files from the data directory
- **Raw CSV View**: View all columns from the original CSV using Handsontable
- **Cleaned View**: View only important columns (Target name, Amount, Category, Direction, Date)
- **Financial Summary**: See total spent, total received, and net balance
- **Category Analysis**: View spending by category, sorted by amount or transaction count
- **Target Analysis**: View spending by vendor/target, sorted by amount or transaction count
- **Multi-File Support**: Supports multiple CSV files with individual month analysis
- **Lazy Loading**: CSV data is parsed and cached on demand for performance

## Technology Stack

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Handsontable** for interactive data tables
- **Papa Parse** for CSV parsing
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding CSV Files

1. Place your CSV files in the `public/data/YYYY/M/` directory structure
   - Example: `public/data/2025/5/wise.csv` for Wise data from May 2025
2. Update the `availableDataFiles` array in `src/utils/dataLoader.ts` to include your new files
3. The app will automatically load and combine data from all configured files

### CSV Format

The app expects CSV files with the following columns:
- `ID`: Transaction ID
- `Status`: Transaction status (e.g., COMPLETED)
- `Direction`: IN or OUT
- `Created on`: Transaction date
- `Source name`: Source account name
- `Source amount (after fees)`: USD amount
- `Target name`: Vendor/target name
- `Category`: Transaction category
- Other columns as provided by Wise

### Key Features

1. **Automatic Loading**: Data loads automatically when you start the app
2. **Navigate Tabs**: Use the tabs to switch between different views:
   - Raw CSV: All original data
   - Cleaned: Important columns only
   - Categories by $: Spending categories sorted by total amount
   - Categories by Count: Categories sorted by transaction frequency
   - Targets by $: Vendors sorted by total spending
   - Targets by Count: Vendors sorted by transaction frequency

### Data Analysis

The app automatically calculates:
- Total money spent (OUT transactions)
- Total money received (IN transactions)
- Net balance
- Category summaries with totals, counts, and averages
- Target/vendor summaries with totals, counts, and averages

## Development

### Available Scripts

- `npm start`: Run development server
- `npm build`: Create production build
- `npm test`: Run tests
- `npm eject`: Eject from Create React App (not recommended)

### Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── TransactionTable.tsx
│   └── SummaryTable.tsx
├── data/                # Sample data
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   └── csvUtils.ts      # CSV parsing and data processing
└── App.tsx             # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for personal use and demonstration purposes.

---

## Original Create React App Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).