import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Mic, Plus, Save, Trash2 } from 'lucide-react'
import { removeMedia, uploadMedia, useContent } from '../lib/content'
import { Frame } from '../components/Frame'
import { AudioClip } from '../components/AudioClip'
import { FRAME_OPTIONS, type FrameStyle } from '../config/memories'
import type { Content } from '../lib/validation'

type Tab = 'memories' | 'gifts' | 'tabs' | 'words' | 'voice' | 'look'
const TABS: [Tab, string][] = [['memories', 'Memories'], ['gifts', 'Gifts'], ['tabs', 'Tabs'], ['words', 'Words'], ['voice', 'Voice'], ['look', 'Look']]
const SKINS: [Content['skin'], string, string][] = [['blush', 'Blush', '#ff9ec4'], ['lavender', 'Lavender', '#a98bff'], ['rosegold', 'Rose gold', '#e8a598'], ['midnight', 'Midnight', '#2d1b4e']]

/* module-level components so inputs keep focus while typing */
function Field({ label, value, onChange, type = 'text', max = 300 }: { label: string; value: string; onChange: (v: string) => void; type?: string; max?: number }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold">{label}<input className="field font-normal" type={type} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} /></label>
}
function Area({ label, value, onChange, rows = 3, max = 1500 }: { label: string; value: string; onChange: (v: string) => void; rows?: number; max?: number }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold">{label}<textarea className="field font-normal" rows={rows} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} /></label>
}
function FramePicker({ frame, fc, onFrame, onColour }: { frame: FrameStyle; fc: string; onFrame: (f: FrameStyle) => void; onColour: (c: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex flex-col gap-1 text-sm font-semibold">Frame
        <select className="field font-normal" value={frame} onChange={(e) => onFrame(e.target.value as FrameStyle)}>{FRAME_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Frame colour
        <input type="color" value={fc} onChange={(e) => onColour(e.target.value)} className="h-[46px] w-full rounded-2xl border-2 border-lavender bg-transparent p-1" aria-label="Frame colour" />
      </label>
    </div>
  )
}
function PhotoControl({ path, onPath, onError }: { path?: string; onPath: (p?: string) => void; onError: (m: string) => void }) {
  const [busy, setBusy] = useState(false)
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true)
    try { onPath(await uploadMedia(f)) } catch (er) { onError(er instanceof Error ? er.message : 'Upload failed.') } finally { setBusy(false) }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <label className="btn-soft cursor-pointer focus-within:outline focus-within:outline-2">
        <ImagePlus size={18} /> {busy ? 'Uploading…' : path ? 'Replace photo' : 'Add photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} disabled={busy} />
      </label>
      {path && <button className="btn-soft" onClick={() => onPath(undefined)}>Remove photo</button>}
    </div>
  )
}
function AudioControl({ path, onPath, onError }: { path?: string; onPath: (p?: string) => void; onError: (m: string) => void }) {
  const [busy, setBusy] = useState(false)
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true)
    try { onPath(await uploadMedia(f)) } catch (er) { onError(er instanceof Error ? er.message : 'Upload failed.') } finally { setBusy(false) }
  }
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <label className="btn-soft cursor-pointer focus-within:outline focus-within:outline-2">
          <Mic size={18} /> {busy ? 'Uploading…' : path ? 'Replace audio' : 'Add audio'}
          <input type="file" accept="audio/*,.m4a,.mp3" className="sr-only" onChange={pick} disabled={busy} />
        </label>
        {path && <button className="btn-soft" onClick={() => onPath(undefined)}>Remove audio</button>}
      </div>
      {path && <AudioClip path={path} label="Preview audio" />}
    </div>
  )
}

interface MediaItem { title: string; emoji: string; caption?: string; photoPath?: string; audioPath?: string; frame: FrameStyle; fc: string }
/** Photo, frame, caption and audio controls shared by memories, gifts and tab items. */
function MediaFields({ item, set, retire, onError }: { item: MediaItem; set: (fn: (x: MediaItem) => void) => void; retire: (p?: string) => void; onError: (m: string) => void }) {
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <div className="w-28 shrink-0"><Frame path={item.photoPath} emoji={item.emoji} frame={item.frame} fc={item.fc} caption={item.caption} /></div>
        <div className="min-w-[180px] flex-1 space-y-2">
          <PhotoControl path={item.photoPath} onError={onError} onPath={(p) => set((x) => { retire(x.photoPath); x.photoPath = p })} />
          <FramePicker frame={item.frame} fc={item.fc} onFrame={(f) => set((x) => { x.frame = f })} onColour={(c) => set((x) => { x.fc = c })} />
        </div>
      </div>
      <Field label="Caption under the photo" value={item.caption ?? ''} max={200} onChange={(v) => set((x) => { x.caption = v })} />
      <AudioControl path={item.audioPath} onError={onError} onPath={(p) => set((x) => { retire(x.audioPath); x.audioPath = p })} />
    </>
  )
}
function Section({ children }: { children: ReactNode }) { return <section className="card space-y-3 text-left">{children}</section> }

export default function Studio() {
  const { content, commit } = useContent()
  const [d, setD] = useState<Content>(content)
  const [tab, setTab] = useState<Tab>('memories')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const dirty = useRef(false)
  const orphans = useRef<string[]>([]) // replaced/removed files, deleted from storage only after a successful save

  useEffect(() => { if (!dirty.current) setD(content) }, [content])
  useEffect(() => { document.documentElement.dataset.skin = d.skin; return () => { document.documentElement.dataset.skin = content.skin } }, [d.skin, content.skin])

  const patch = (fn: (c: Content) => void) => { dirty.current = true; setD((p) => { const n = structuredClone(p); fn(n); return n }) }
  const retire = (old?: string) => { if (old) orphans.current.push(old) }
  const err = (text: string) => setMsg({ ok: false, text })

  const save = async () => {
    setBusy(true); setMsg(null)
    try {
      await commit(d)
      if (orphans.current.length) { await removeMedia(orphans.current).catch(() => undefined); orphans.current = [] }
      dirty.current = false
      setMsg({ ok: true, text: 'Saved. Sadiya will see the changes next time the page loads.' })
    } catch (e) { err(e instanceof Error ? e.message : 'Save failed.') } finally { setBusy(false) }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6 animate-rise">
      <h1 className="text-center font-script text-4xl">Studio</h1>
      <p className="text-center">Edit text, photos, frames and voice. Press Save to publish. Photos are shrunk to about 1400 px before upload to save free storage.</p>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Studio sections">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn-soft ${tab === k ? '!bg-petal text-white' : ''}`}>{l}</button>)}
      </div>

      {tab === 'memories' && (
        <div className="space-y-4">
          {d.memories.map((m, i) => (
            <Section key={m.id}>
              <MediaFields item={m} onError={err} retire={retire} set={(fn) => patch((c) => { fn(c.memories[i]) })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Emoji" value={m.emoji} max={8} onChange={(v) => patch((c) => { c.memories[i].emoji = v })} />
                <Field label="Date" value={m.date} max={40} onChange={(v) => patch((c) => { c.memories[i].date = v })} />
              </div>
              <Field label="Title" value={m.title} max={120} onChange={(v) => patch((c) => { c.memories[i].title = v })} />
              <Area label="Story" value={m.description} onChange={(v) => patch((c) => { c.memories[i].description = v })} />
              <div className="flex justify-between">
                <span className="flex gap-1">
                  <button className="btn-soft" aria-label="Move up" disabled={i === 0} onClick={() => patch((c) => { [c.memories[i - 1], c.memories[i]] = [c.memories[i], c.memories[i - 1]] })}><ArrowUp size={18} /></button>
                  <button className="btn-soft" aria-label="Move down" disabled={i === d.memories.length - 1} onClick={() => patch((c) => { [c.memories[i + 1], c.memories[i]] = [c.memories[i], c.memories[i + 1]] })}><ArrowDown size={18} /></button>
                </span>
                <button className="btn-soft" onClick={() => patch((c) => { retire(c.memories[i].photoPath); retire(c.memories[i].audioPath); c.memories.splice(i, 1) })}><Trash2 size={18} /> Delete</button>
              </div>
            </Section>
          ))}
          {d.memories.length < 12
            ? <div className="text-center"><button className="btn" onClick={() => patch((c) => { c.memories.push({ id: crypto.randomUUID().slice(0, 8), emoji: '💗', title: 'New memory', date: '', description: 'Write something here.', frame: 'polaroid', fc: '#ffffff' }) })}><Plus size={18} /> Add a memory</button></div>
            : <p className="text-center text-sm">12 memories is the maximum (one per star).</p>}
        </div>
      )}

      {tab === 'gifts' && (
        <div className="space-y-4">
          {d.gifts.map((g, i) => (
            <Section key={g.id}>
              <h2 className="font-script text-2xl">Gift {g.id}</h2>
              <MediaFields item={g} onError={err} retire={retire} set={(fn) => patch((c) => { fn(c.gifts[i]) })} />
              <div className="grid grid-cols-[5rem_1fr] gap-2">
                <Field label="Emoji" value={g.emoji} max={8} onChange={(v) => patch((c) => { c.gifts[i].emoji = v })} />
                <Field label="Title" value={g.title} max={120} onChange={(v) => patch((c) => { c.gifts[i].title = v })} />
              </div>
              <Area label="Message" value={g.message} max={2000} onChange={(v) => patch((c) => { c.gifts[i].message = v })} />
            </Section>
          ))}
        </div>
      )}

      {tab === 'tabs' && (
        <div className="space-y-4">
          <Section>
            <h2 className="font-script text-2xl">Menu names</h2>
            <p className="text-sm">Rename the buttons in the top menu.</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(d.labels) as (keyof Content['labels'])[]).map((k) => (
                <Field key={k} label={k} value={d.labels[k]} max={20} onChange={(v) => patch((c) => { c.labels[k] = v })} />
              ))}
            </div>
          </Section>
          <Section>
            <h2 className="font-script text-2xl">Memory layout names</h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(d.layouts) as (keyof Content['layouts'])[]).map((k) => (
                <Field key={k} label={k} value={d.layouts[k]} max={20} onChange={(v) => patch((c) => { c.layouts[k] = v })} />
              ))}
            </div>
          </Section>
          {d.pages.map((p, pi) => (
            <Section key={p.id}>
              <h2 className="font-script text-2xl">Your tab: {p.title || p.id}</h2>
              <div className="grid grid-cols-[5rem_1fr] gap-2">
                <Field label="Emoji" value={p.emoji} max={8} onChange={(v) => patch((c) => { c.pages[pi].emoji = v })} />
                <Field label="Tab name" value={p.title} max={24} onChange={(v) => patch((c) => { c.pages[pi].title = v })} />
              </div>
              <Area label="Intro text" rows={3} max={600} value={p.intro} onChange={(v) => patch((c) => { c.pages[pi].intro = v })} />
              {p.items.map((it, ii) => (
                <div key={it.id} className="space-y-2 rounded-2xl border-2 border-lavender p-3">
                  <MediaFields item={it} onError={err} retire={retire} set={(fn) => patch((c) => { fn(c.pages[pi].items[ii]) })} />
                  <div className="grid grid-cols-[5rem_1fr] gap-2">
                    <Field label="Emoji" value={it.emoji} max={8} onChange={(v) => patch((c) => { c.pages[pi].items[ii].emoji = v })} />
                    <Field label="Title" value={it.title} max={120} onChange={(v) => patch((c) => { c.pages[pi].items[ii].title = v })} />
                  </div>
                  <Area label="Text" rows={4} max={2000} value={it.text} onChange={(v) => patch((c) => { c.pages[pi].items[ii].text = v })} />
                  <button className="btn-soft" onClick={() => patch((c) => { const x = c.pages[pi].items[ii]; retire(x.photoPath); retire(x.audioPath); c.pages[pi].items.splice(ii, 1) })}><Trash2 size={18} /> Delete item</button>
                </div>
              ))}
              <div className="flex flex-wrap justify-between gap-2">
                {p.items.length < 24 && <button className="btn" onClick={() => patch((c) => { c.pages[pi].items.push({ id: crypto.randomUUID().slice(0, 8), emoji: '💗', title: 'New item', text: 'Write something here.', frame: 'polaroid', fc: '#ffffff' }) })}><Plus size={18} /> Add item</button>}
                <button className="btn-soft" onClick={() => { if (window.confirm('Delete this whole tab?')) patch((c) => { c.pages[pi].items.forEach((x) => { retire(x.photoPath); retire(x.audioPath) }); c.pages.splice(pi, 1) }) }}><Trash2 size={18} /> Delete tab</button>
              </div>
            </Section>
          ))}
          {d.pages.length < 6
            ? <div className="text-center"><button className="btn" onClick={() => patch((c) => { c.pages.push({ id: 'tab-' + crypto.randomUUID().slice(0, 6), title: 'New tab', emoji: '✨', intro: '', items: [] }) })}><Plus size={18} /> Add a tab</button></div>
            : <p className="text-center text-sm">6 extra tabs is the maximum.</p>}
        </div>
      )}

      {tab === 'words' && (
        <div className="space-y-4">
          <Section>
            <Area label="Main message (home page)" rows={2} max={300} value={d.main} onChange={(v) => patch((c) => { c.main = v })} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Birthday" type="date" value={d.birthday} onChange={(v) => patch((c) => { if (v) c.birthday = v })} />
              <Field label="Together since" type="date" value={d.relationshipStart} onChange={(v) => patch((c) => { c.relationshipStart = v })} />
            </div>
            <Area label="Cake wish message" rows={2} max={300} value={d.wish} onChange={(v) => patch((c) => { c.wish = v })} />
          </Section>
          <Section>
            <h2 className="font-script text-2xl">Love letter</h2>
            <Field label="Greeting" value={d.letter.greeting} max={200} onChange={(v) => patch((c) => { c.letter.greeting = v })} />
            <Area label="Letter text" rows={10} max={6000} value={d.letter.text} onChange={(v) => patch((c) => { c.letter.text = v })} />
            <Field label="Signature" value={d.letter.signature} max={100} onChange={(v) => patch((c) => { c.letter.signature = v })} />
          </Section>
          <Section>
            <h2 className="font-script text-2xl">Date jar</h2>
            <Area label="One idea per line" rows={6} max={2000} value={d.dateIdeas} onChange={(v) => patch((c) => { c.dateIdeas = v })} />
          </Section>
          <Section>
            <h2 className="font-script text-2xl">Hidden secrets</h2>
            <Field label="Moon" value={d.eggs.moon} onChange={(v) => patch((c) => { c.eggs.moon = v })} />
            <Field label="Little heart" value={d.eggs.heart} onChange={(v) => patch((c) => { c.eggs.heart = v })} />
            <Field label="Hidden star" value={d.eggs.star} onChange={(v) => patch((c) => { c.eggs.star = v })} />
            <Field label="Secret key sequence note" value={d.eggs.key} onChange={(v) => patch((c) => { c.eggs.key = v })} />
          </Section>
        </div>
      )}

      {tab === 'voice' && (
        <Section>
          <h2 className="font-script text-2xl">Voice or video message</h2>
          <Area label="Caption" rows={3} max={600} value={d.voice.caption} onChange={(v) => patch((c) => { c.voice.caption = v })} />
          <VoiceUpload path={d.voice.mediaPath} onError={err} onPath={(p, kind) => patch((c) => { retire(c.voice.mediaPath); c.voice.mediaPath = p; if (kind) c.voice.kind = kind })} />
          <p className="text-sm">MP3, M4A, WebM, MP4 up to 50 MB. A one-minute voice note is usually under 1 MB.</p>
        </Section>
      )}

      {tab === 'look' && (
        <Section>
          <h2 className="font-script text-2xl">Colour theme</h2>
          <div className="flex flex-wrap gap-3">
            {SKINS.map(([k, l, col]) => (
              <button key={k} aria-label={`${l} theme`} aria-pressed={d.skin === k} onClick={() => patch((c) => { c.skin = k })}
                className="h-12 w-12 rounded-full border-4 border-white shadow aria-pressed:outline aria-pressed:outline-4 aria-pressed:outline-offset-2 aria-pressed:outline-[#7a4bd1]" style={{ background: col }} />
            ))}
          </div>
        </Section>
      )}

      <div className="sticky bottom-3 z-10 flex flex-col items-center gap-2">
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={`rounded-xl px-3 py-1 text-sm ${msg.ok ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>{msg.text}</p>}
        <button className="btn shadow-xl" onClick={save} disabled={busy}><Save size={18} /> {busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </main>
  )
}

function VoiceUpload({ path, onPath, onError }: { path?: string; onPath: (p?: string, kind?: 'audio' | 'video') => void; onError: (m: string) => void }) {
  const [busy, setBusy] = useState(false)
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true)
    try { onPath(await uploadMedia(f), f.type.startsWith('video') ? 'video' : 'audio') } catch (er) { onError(er instanceof Error ? er.message : 'Upload failed.') } finally { setBusy(false) }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <label className="btn-soft cursor-pointer focus-within:outline focus-within:outline-2">
        {busy ? 'Uploading…' : path ? 'Replace file' : 'Add audio or video'}
        <input type="file" accept="audio/*,video/mp4,video/webm,.m4a,.mp3" className="sr-only" onChange={pick} disabled={busy} />
      </label>
      {path && <button className="btn-soft" onClick={() => onPath(undefined)}>Remove</button>}
    </div>
  )
}
