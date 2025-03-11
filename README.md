# SpreadThem - Interactive Spreadsheet Application

SpreadThem is a feature-rich, web-based spreadsheet application built with Next.js, React, and Tailwind CSS. It provides a familiar spreadsheet experience directly in your browser with a clean, modern interface.

## Features

- **Full Spreadsheet Functionality**: Cell editing, formatting, and navigation
- **Rich Text Formatting**: Apply bold, italic, underline, and text alignment
- **Number Formatting**: Support for currency, percentage, and date formats
- **Selection Tools**: Select individual cells or ranges with keyboard and mouse
- **Clipboard Operations**: Cut, copy, and paste cells and ranges
- **AI Assistant**: Get help creating and modifying spreadsheets
- **Color Formatting**: Apply colors to text and cell backgrounds

## Technology Stack

- **Next.js 15**: Modern React framework with App Router
- **React 19**: For building a responsive UI
- **Tailwind CSS**: For styling and responsive design
- **TypeScript**: For type safety and better developer experience
- **Lucide Icons**: For beautiful, consistent UI icons

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Keyboard Shortcuts

- **Arrow Keys**: Navigate between cells
- **Shift + Arrow Keys**: Extend selection
- **Ctrl + B**: Toggle bold text
- **Ctrl + I**: Toggle italic text
- **Ctrl + U**: Toggle underlined text
- **Ctrl + C**: Copy selected cells
- **Ctrl + X**: Cut selected cells
- **Ctrl + V**: Paste from clipboard
- **Ctrl + A**: Select all cells
- **Delete**: Clear selected cells
- **Enter**: Confirm cell edit
- **Escape**: Cancel cell edit

## Development

This project is structured as follows:

- `src/components/SpreadsheetPreview.tsx`: The main spreadsheet component
- `src/app/page.tsx`: The main application page

## License

This project is MIT licensed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
