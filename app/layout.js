import './globals.css'

export const metadata = {
  title: 'Voting System',
  description: 'Voting list and polling station management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
