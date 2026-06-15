export const meta = {
  id: 'pulsefit',
  title: 'PulseFit — AI gym booking assistant',
  blurb: 'Chat with an AI front-desk that books sessions, checks coach availability, and tracks member credits. Powered by DeepSeek via n8n.',
  tags: ['n8n', 'DeepSeek', 'Google Sheets', 'Telegram'],
}

export default function PulseFit() {
  return (
    <a
      href="/pulsefit/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-[#0E0F11] text-sm transition-opacity hover:opacity-80"
      style={{ backgroundColor: '#B6F03C' }}
    >
      Open live demo →
    </a>
  )
}
