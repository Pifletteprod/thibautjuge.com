'use client'

import { useEffect, useRef, useState } from 'react'
import { submitLead } from './actions'
import styles from './contact.module.css'

const STEPS = 5

type FormData = {
  type_besoin: string
  budget: string
  message: string
  prenom: string
  nom: string
  entreprise: string
  site_actuel: string
  email: string
  telephone: string
}

const INITIAL: FormData = {
  type_besoin: '', budget: '', message: '',
  prenom: '', nom: '', entreprise: '',
  site_actuel: '', email: '', telephone: '',
}

export default function ContactForm() {
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)
  const [success, setSuccess] = useState(false)
  const [shaking, setShaking] = useState(false)
  const editorLinesEl         = useRef<HTMLDivElement>(null)
  const editorCodeEl          = useRef<HTMLDivElement>(null)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function fs(value: string, maxChars = 8, base = 1, min = 0.55) {
    const scale = Math.max(min, base - Math.max(0, value.length - maxChars) * 0.025)
    return { fontSize: `${scale}em` }
  }

  const canNext = [
    form.type_besoin.trim() !== '' && form.budget.trim() !== '',
    form.message.trim() !== '',
    form.prenom.trim() !== '' && form.nom.trim() !== '',
    form.entreprise.trim() !== '',
    form.email.trim() !== '',
  ][step] ?? false

  function shake() { setShaking(true); setTimeout(() => setShaking(false), 500) }
  function next() { if (!canNext) { shake(); return } if (step < STEPS - 1) setStep(s => s + 1) }
  function back() { if (step > 0) setStep(s => s - 1) }

  async function handleSubmit() {
    setLoading(true)
    setError(false)
    try {
      await submitLead({ ...form, cf_token: '' })
      setSuccess(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // VS Code editor animation
  useEffect(() => {
    const linesEl = editorLinesEl.current
    const codeEl  = editorCodeEl.current
    if (!linesEl || !codeEl) return

    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    const lines: [string, string][][] = [
      [['keyword','import '],['punct','{ '],['attr','useState'],['punct',' } '],['keyword','from '],['string',"'react'"]],
      [],
      [['keyword','const '],['fn','ProjetCard'],['punct',' = '],['punct','({ '],['attr','client'],['punct',', '],['attr','budget'],['punct',' }) => {']],
      [['punct','  '],['keyword','const '],['punct','['],['attr','status'],['punct',', '],['fn','setStatus'],['punct','] = '],['fn','useState'],['punct','('],['string',"'nouveau'"],['punct',')']],
      [],
      [['punct','  '],['keyword','return '],['punct','(']],
      [['punct','    '],['punct','<'],['tag','div '],['attr','className'],['punct','='],['string','"card"'],['punct','>']],
      [['punct','      '],['punct','<'],['tag','h2'],['punct','>'],['punct','{client.nom}'],['punct','</'],['tag','h2'],['punct','>']],
      [['punct','      '],['punct','<'],['tag','Status '],['attr','value'],['punct','={status} />']],
      [['punct','    '],['punct','</'],['tag','div'],['punct','>']],
      [['punct','  )']],
      [['punct','}']],
    ]

    let lineIdx = 0, tokIdx = 0, charIdx = 0
    let renderedLines: string[] = []
    let doneTokensHtml = ''
    let timer: ReturnType<typeof setTimeout>

    const dotsEl = document.createElement('span')
    dotsEl.className = styles.pfDots
    dotsEl.style.color = '#6a9955'

    function renderLineNumbers(extra: boolean) {
      const total = renderedLines.length + (extra ? 1 : 0)
      linesEl!.innerHTML = Array.from({length: total}, (_, i) => i + 1).join('\n')
    }

    function startDots() {
      renderLineNumbers(true)
      codeEl!.innerHTML = renderedLines.join('\n') + '\n'
      dotsEl.textContent = '_'
      codeEl!.appendChild(dotsEl)
    }

    function renderEditor() {
      const line = lines[lineIdx]
      const [cls, text] = line[tokIdx]
      const partial = `<span class="tok-${cls}">${esc(text.slice(0, charIdx))}</span>`
      codeEl!.innerHTML = renderedLines.join('\n') + (renderedLines.length ? '\n' : '') + doneTokensHtml + partial
      renderLineNumbers(true)
    }

    function typeNext() {
      if (lineIdx >= lines.length) {
        startDots()
        timer = setTimeout(() => {
          lineIdx = 0; tokIdx = 0; charIdx = 0
          renderedLines = []; doneTokensHtml = ''
          dotsEl.textContent = ''
          codeEl!.innerHTML = ''
          renderLineNumbers(false)
          typeNext()
        }, 15000)
        return
      }
      const line = lines[lineIdx]
      if (line.length === 0) {
        renderedLines.push(''); doneTokensHtml = ''
        lineIdx++; tokIdx = 0; charIdx = 0
        renderLineNumbers(true)
        codeEl!.innerHTML = renderedLines.join('\n') + '\n'
        timer = setTimeout(typeNext, 80)
        return
      }
      if (tokIdx >= line.length) {
        renderedLines.push(doneTokensHtml); doneTokensHtml = ''
        lineIdx++; tokIdx = 0; charIdx = 0
        timer = setTimeout(typeNext, 60)
        return
      }
      const [cls, text] = line[tokIdx]
      if (charIdx < text.length) {
        charIdx++
        renderEditor()
        timer = setTimeout(typeNext, 28 + Math.random() * 22)
      } else {
        doneTokensHtml += `<span class="tok-${cls}">${esc(text)}</span>`
        tokIdx++; charIdx = 0
        typeNext()
      }
    }

    renderLineNumbers(false)
    timer = setTimeout(typeNext, 600)
    return () => clearTimeout(timer)
  }, [])

  const progress = ((step + 1) / STEPS * 100) + '%'

  return (
    <>
      {success && (
        <div className={`${styles.pfOverlay} ${styles.pfOverlayActive}`}>
          <p className={styles.pfOverlayMsg}>Merci !<br />Je reviens vers vous très rapidement ;)</p>
          <button className={styles.pfOverlayClose} onClick={() => setSuccess(false)}>&times;</button>
        </div>
      )}

      <div className={`${styles.pfWrap} ${styles.pfDark}${shaking ? ' ' + styles.pfShake : ''}`}>

        <span className={step === 0 ? `${styles.pfLabel} ${styles.activeLabel}` : styles.pfLabel}>{'{{-- Étape 1 : Besoin & budget --}}'}</span>
        <div className={step === 0 ? `${styles.pfStep} ${styles.active}` : styles.pfStep}>
          <p className={styles.pfSentence}>
            J'ai besoin d'<input type="text" name="type_besoin" placeholder="un site vitrine" value={form.type_besoin} onChange={set('type_besoin')} style={fs(form.type_besoin, 8)} />
            avec un budget de
            <input type="text" name="budget" placeholder="2 – 3" value={form.budget} onChange={set('budget')} style={fs(form.budget, 3)} /><span className={styles.pfUnit}>€</span>
          </p>
          <div className={styles.pfNav}>
            <button type="button" className={styles.pfBtnNext} onClick={next}  />
          </div>
        </div>

        <span className={step === 1 ? `${styles.pfLabel} ${styles.activeLabel}` : styles.pfLabel}>{'{{-- Étape 2 : Message --}}'}</span>
        <div className={step === 1 ? `${styles.pfStep} ${styles.active}` : styles.pfStep}>
          <p className={styles.pfSentence}>
            En quelques mots, mon projet c'est…
            <textarea name="message" placeholder="Décrivez librement votre projet…" value={form.message} onChange={set('message')} />
          </p>
          <div className={styles.pfNav}>
            <button type="button" className={styles.pfBtnNext} onClick={next}  />
            <button type="button" className={styles.pfBtnBack} onClick={back}>← Retour</button>
          </div>
        </div>

        <span className={step === 2 ? `${styles.pfLabel} ${styles.activeLabel}` : styles.pfLabel}>{'{{-- Étape 3 : Identité --}}'}</span>
        <div className={step === 2 ? `${styles.pfStep} ${styles.active}` : styles.pfStep}>
          <p className={styles.pfSentence}>
            Je m'appelle
            <input type="text" name="prenom" placeholder="Prénom" required value={form.prenom} onChange={set('prenom')} autoComplete="given-name" style={fs(form.prenom)} />
            <input type="text" name="nom" placeholder="Nom" required value={form.nom} onChange={set('nom')} autoComplete="family-name" style={fs(form.nom)} />
          </p>
          <div className={styles.pfNav}>
            <button type="button" className={styles.pfBtnNext} onClick={next}  />
            <button type="button" className={styles.pfBtnBack} onClick={back}>← Retour</button>
          </div>
        </div>

        <span className={step === 3 ? `${styles.pfLabel} ${styles.activeLabel}` : styles.pfLabel}>{'{{-- Étape 4 : Entreprise --}}'}</span>
        <div className={step === 3 ? `${styles.pfStep} ${styles.active}` : styles.pfStep}>
          <p className={styles.pfSentence}>
            Je dirige
            <input type="text" name="entreprise" placeholder="Mon entreprise" value={form.entreprise} onChange={set('entreprise')} style={fs(form.entreprise)} />
            — mon site actuel est
            <input type="url" name="site_actuel" placeholder="https://..." value={form.site_actuel} onChange={set('site_actuel')} style={fs(form.site_actuel, 10)} />
          </p>
          <div className={styles.pfNav}>
            <button type="button" className={styles.pfBtnNext} onClick={next}  />
            <button type="button" className={styles.pfBtnBack} onClick={back}>← Retour</button>
          </div>
        </div>

        <span className={step === 4 ? `${styles.pfLabel} ${styles.activeLabel}` : styles.pfLabel}>{'{{-- Étape 5 : Contact --}}'}</span>
        <div className={step === 4 ? `${styles.pfStep} ${styles.active}` : styles.pfStep}>
          <p className={styles.pfSentence}>
            Mon email est
            <input type="email" name="email" placeholder="votre@email.com" required value={form.email} onChange={set('email')} autoComplete="email" style={fs(form.email, 6)} />
            et mon téléphone
            <input type="tel" name="telephone" placeholder="06 00 00 00 00" value={form.telephone} onChange={set('telephone')} autoComplete="tel" style={fs(form.telephone, 5)} />
          </p>
          <div className={styles.pfNav}>
            <button type="button" className={styles.pfBtnSubmit} onClick={() => { if (!canNext) { shake(); return } handleSubmit() }} disabled={loading} />
            <button type="button" className={styles.pfBtnBack} onClick={back}>← Retour</button>
          </div>
          {error && <p className={styles.pfErrorInline}>Une erreur est survenue, réessayez ou contactez-moi directement.</p>}
        </div>

        <div className={styles.pfEditor}>
          <div className={styles.pfEditorBar}>
            <span className={styles.pfDot} style={{ background: '#ff5f57' }} />
            <span className={styles.pfDot} style={{ background: '#febc2e' }} />
            <span className={styles.pfDot} style={{ background: '#28c840' }} />
            <span className={styles.pfEditorTitle}>projet.jsx</span>
          </div>
          <div className={styles.pfEditorBody}>
            <div className={styles.pfEditorLines} ref={editorLinesEl} />
            <div className={styles.pfEditorCode} ref={editorCodeEl} />
          </div>
        </div>

        <div className={styles.pfProgress}>
          <div className={styles.pfProgressBar} style={{ width: progress }} />
        </div>

      </div>
    </>
  )
}
