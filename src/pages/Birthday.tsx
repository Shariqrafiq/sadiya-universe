import { Countdown } from '../components/Countdown'
import { LoveCounter } from '../components/LoveCounter'
import { BirthdayCake } from '../components/BirthdayCake'
import { DigitalHug } from '../components/DigitalHug'
import { FutureDateJar } from '../components/FutureDateJar'
import { EasterEggs } from '../components/EasterEggs'
import { birthday } from '../config/birthday'
import { useContent } from '../lib/content'

export default function Birthday() {
  const { content } = useContent()
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <header className="text-center">
        <h1 className="font-script text-4xl">Welcome home, {birthday.name} 💗</h1>
        <p className="mt-1 text-lg">{content.main}</p>
      </header>
      <Countdown />
      <LoveCounter />
      <BirthdayCake />
      <DigitalHug />
      <FutureDateJar />
      <EasterEggs />
    </main>
  )
}
