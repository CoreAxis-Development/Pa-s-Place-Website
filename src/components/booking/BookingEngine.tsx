// The booking form: choose an option, pick dates against live availability,
// see the price, enter details, send the request. The request is stored and
// the dates are held; staff confirm and the deposit is paid by EFT.
import { useEffect, useMemo, useRef, useState } from 'react';
import { quote, formatRand, type PricingPolicy } from '../../server/lib/pricing';

export interface EngineOption {
  slug: string;
  name: string;
  blurb: string;
  capacityLabel: string;
  minPeople: number;
  maxPeople: number;
  rate: number;
  rateLabel: string;
  kind: 'stay' | 'venue';
  image: { src: string; alt: string; color: string } | null;
}

interface Props {
  options: EngineOption[];
  policy: PricingPolicy;
  /** which kinds this page offers; the other kind links to its own page */
  kinds?: ('stay' | 'venue')[];
  defaultOption?: string;
  phone?: string;
  phoneLink?: string;
  checkIn?: string;
  checkOut?: string;
}

interface Confirmation {
  ref: string;
  option: string;
  when: string;
  people: number;
  total: number;
  deposit: number;
  balance: number;
  paymentInstructions: string;
}

/* ---------- dates: plain YYYY-MM-DD strings, no time zones ---------- */

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parts = (s: string) => s.split('-').map(Number) as [number, number, number];
const utc = (s: string) => {
  const [y, m, d] = parts(s);
  return Date.UTC(y, m - 1, d);
};
const addDays = (s: string, n: number) => new Date(utc(s) + n * 86_400_000).toISOString().slice(0, 10);
const nightsBetween = (a: string, b: string) => Math.round((utc(b) - utc(a)) / 86_400_000);
const isDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const fmt = (s: string) =>
  new Date(utc(s)).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const STEPS = ['Choose', 'Dates', 'Your details', 'Review'];

/* ---------- one month of the calendar ---------- */

function Month(props: {
  year: number;
  month: number;
  today: string;
  start: string | null;
  end: string | null;
  taken: Set<string>;
  isStay: boolean;
  onPick: (s: string) => void;
}) {
  const { year, month, today, start, end, taken, isStay, onPick } = props;
  const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const daysIn = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysIn }, (_, i) => iso(year, month, i + 1)),
  ];

  return (
    <div>
      <p className="text-center text-[0.9375rem] font-bold text-ink">{label}</p>
      <div className="mt-3 grid grid-cols-7 text-center text-xs font-semibold text-ink-muted" aria-hidden="true">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((s, i) => {
          if (!s) return <span key={`blank-${i}`} />;
          const past = s < today;
          const booked = taken.has(s);
          // a departure day may fall on a night someone else arrives
          const canEndHere = isStay && start && !end && s > start && booked;
          const disabled = past || (booked && !canEndHere);
          const isEdge = s === start || s === end;
          const inRange = start && end && s > start && s < end;
          let cls = 'text-ink hover:bg-canopy-50';
          if (disabled) cls = booked && !past ? 'bg-sunken text-ink-muted line-through' : 'text-line-strong';
          else if (isEdge) cls = 'bg-canopy-600 font-bold text-white';
          else if (inRange) cls = 'bg-canopy-100 text-ink';
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => onPick(s)}
              aria-label={`${fmt(s)}${booked && !past ? ', unavailable' : ''}`}
              aria-pressed={isEdge}
              className={`tnum relative mx-auto grid h-11 w-full max-w-11 place-items-center rounded-[10px] text-[0.9375rem] transition-colors ${cls} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {Number(s.slice(8))}
              {s === today && <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-sun-500" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the form ---------- */

export default function BookingEngine({ options, policy, kinds = ['stay', 'venue'], defaultOption, phone, phoneLink, checkIn, checkOut }: Props) {
  const shown = useMemo(() => options.filter((o) => kinds.includes(o.kind)), [options, kinds]);

  const [slug, setSlug] = useState<string | null>(defaultOption ?? (shown.length === 1 ? shown[0].slug : null));
  const option = shown.find((o) => o.slug === slug) ?? null;
  const isStay = option?.kind !== 'venue';

  const [step, setStep] = useState(defaultOption || shown.length === 1 ? 1 : 0);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [people, setPeople] = useState(option?.minPeople ?? 4);
  const [monthOffset, setMonthOffset] = useState(0);

  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');

  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Confirmation | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // pick up a search from the home page booking bar: ?option=&from=&to=&people=
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const o = shown.find((x) => x.slug === q.get('option'));
    if (!o) return;
    setSlug(o.slug);
    setStep(1);
    const from = q.get('from');
    const to = q.get('to');
    if (isDate(from)) {
      setStart(from);
      if (o.kind === 'venue') setEnd(from);
      else if (isDate(to) && to > from) setEnd(to);
      const [y, m] = parts(from);
      const now = new Date();
      setMonthOffset(Math.max(0, (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth())));
    }
    const n = Number(q.get('people'));
    setPeople(Math.min(Math.max(n || o.minPeople, o.minPeople), o.maxPeople));
  }, [shown]);

  // live availability for the chosen option
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoadState('loading');
    fetch(`/api/availability?option=${encodeURIComponent(slug)}&days=400`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data: { today: string; unavailable: string[] }) => {
        if (cancelled) return;
        setToday(data.today);
        setTaken(new Set(data.unavailable));
        setLoadState('idle');
      })
      .catch(() => !cancelled && setLoadState('error'));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const nights = isStay && start && end ? nightsBetween(start, end) : 0;
  const price = option ? quote({ kind: option.kind, rate: option.rate, people, nights }, policy) : null;
  const datesDone = isStay ? Boolean(start && end && nights > 0) : Boolean(start);

  // a selection made before availability loaded may clash with it
  const clash = useMemo(() => {
    if (!start || !option) return false;
    if (!isStay) return taken.has(start);
    if (!end) return taken.has(start);
    for (let d = start; d < end; d = addDays(d, 1)) if (taken.has(d)) return true;
    return false;
  }, [start, end, taken, option, isStay]);

  const goTo = (n: number) => {
    setNotice('');
    setStep(n);
    top.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  const chooseOption = (o: EngineOption) => {
    if (o.slug !== slug) {
      setStart(null);
      setEnd(null);
      setTaken(new Set());
    }
    setSlug(o.slug);
    setPeople((p) => Math.min(Math.max(p, o.minPeople), o.maxPeople));
    setNotice('');
  };

  const pick = (s: string) => {
    setNotice('');
    if (!isStay) {
      setStart(s);
      setEnd(s);
      return;
    }
    if (!start || end || s <= start) {
      if (taken.has(s)) return;
      setStart(s);
      setEnd(null);
      return;
    }
    for (let d = start; d < s; d = addDays(d, 1)) {
      if (taken.has(d)) {
        setNotice('Those dates include nights that are already booked. Please choose a clear stretch.');
        return;
      }
    }
    setEnd(s);
  };

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (guestName.trim().length < 2) errs.guestName = 'Please tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'That email address does not look right.';
    if (guestPhone.replace(/\D/g, '').length < 9) errs.phone = 'Please give a phone number we can reach you on.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!option || !start) return;
    setSending(true);
    setNotice('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option: option.slug,
          startDate: start,
          endDate: isStay ? end : start,
          people,
          guestName,
          email,
          phone: guestPhone,
          notes,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDone(data as Confirmation);
        top.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
        return;
      }
      if (data.fields) {
        setFieldErrors(data.fields);
        setStep(2);
      }
      if (res.status === 409) {
        // someone else took the dates: refresh the calendar and go back to it
        setStart(null);
        setEnd(null);
        setStep(1);
        fetch(`/api/availability?option=${encodeURIComponent(option.slug)}&days=400`)
          .then((r) => r.json())
          .then((d) => setTaken(new Set(d.unavailable)))
          .catch(() => {});
      }
      setNotice(data.error || 'We could not save your booking. Please try again, or call us.');
    } catch {
      setNotice('We could not reach the server. Check your connection and try again, or call us.');
    } finally {
      setSending(false);
    }
  };

  const now = parts(today);
  const base = new Date(Date.UTC(now[0], now[1] - 1 + monthOffset, 1));
  const next = new Date(Date.UTC(now[0], now[1] + monthOffset, 1));
  const tel = phoneLink || phone;

  /* ---------- confirmation ---------- */
  if (done) {
    return (
      <div ref={top} className="card relative mx-auto max-w-2xl scroll-mt-28 overflow-hidden p-6 sm:p-10" role="status">
        <span className="ring ring-done h-12 w-12" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.500L19 7.500" />
          </svg>
        </span>
        <h2 className="t-h2 mt-5">Request received</h2>
        <p className="mt-3 max-w-prose">
          Thank you, {guestName.split(' ')[0]}. We are holding your dates and will confirm with you shortly by phone or email.
        </p>

        <dl className="mt-6 grid gap-x-8 gap-y-4 rounded-[14px] bg-sunken p-5 sm:grid-cols-2">
          <div>
            <dt className="t-caption">Reference</dt>
            <dd className="tnum text-lg font-bold text-ink">{done.ref}</dd>
          </div>
          <div>
            <dt className="t-caption">Booking</dt>
            <dd className="font-semibold text-ink">{done.option}</dd>
          </div>
          <div>
            <dt className="t-caption">{isStay ? 'Dates' : 'Date'}</dt>
            <dd className="tnum font-semibold text-ink">{done.when}</dd>
          </div>
          <div>
            <dt className="t-caption">People</dt>
            <dd className="tnum font-semibold text-ink">{done.people}</dd>
          </div>
          <div>
            <dt className="t-caption">Total</dt>
            <dd className="tnum font-semibold text-ink">{formatRand(done.total)}</dd>
          </div>
          <div>
            <dt className="t-caption">Deposit to secure it</dt>
            <dd className="tnum font-semibold text-ink">{formatRand(done.deposit)}</dd>
          </div>
        </dl>

        <h3 className="t-h4 mt-7">What happens next</h3>
        <ol className="mt-3 space-y-2 text-[0.9375rem]">
          <li>1. We check your request and confirm it with you.</li>
          <li>2. You pay the deposit of {formatRand(done.deposit)} by EFT, using {done.ref} as the reference.</li>
          <li>3. The balance of {formatRand(done.balance)} is paid {isStay ? 'on arrival' : 'on the day'}.</li>
        </ol>
        {done.paymentInstructions && (
          <div className="mt-5 rounded-[10px] border border-line bg-sun-50 p-4 text-[0.9375rem]">
            <p className="font-bold text-ink">Paying the deposit</p>
            <p className="mt-1 whitespace-pre-line">{done.paymentInstructions}</p>
          </div>
        )}
        <p className="mt-5 text-[0.9375rem]">
          A copy has been sent to <strong className="text-ink">{email}</strong>.
          {phone && (
            <> Need to change something? Call <a className="link tnum" href={`tel:${tel}`}>{phone}</a> and quote your reference.</>
          )}
        </p>
        <a href="/" className="btn btn-tertiary mt-7">Back to the home page</a>
      </div>
    );
  }

  /* ---------- quote panel ---------- */
  const summary = (
    <aside className="rounded-[14px] bg-sunken p-5 lg:sticky lg:top-24" aria-label="Your booking">
      <h3 className="t-h4">Your booking</h3>
      <dl className="mt-4 space-y-2.5 text-[0.9375rem]">
        <div className="flex justify-between gap-4">
          <dt>Option</dt>
          <dd className="text-right font-semibold text-ink">{option?.name ?? 'Not chosen yet'}</dd>
        </div>
        {isStay ? (
          <>
            <div className="flex justify-between gap-4">
              <dt>Check-in</dt>
              <dd className="tnum text-right font-semibold text-ink">{start ? fmt(start) : 'Choose a date'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Check-out</dt>
              <dd className="tnum text-right font-semibold text-ink">{end ? fmt(end) : 'Choose a date'}</dd>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-4">
            <dt>Date</dt>
            <dd className="tnum text-right font-semibold text-ink">{start ? fmt(start) : 'Choose a date'}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>{isStay ? 'People' : 'Guests'}</dt>
          <dd className="tnum font-semibold text-ink">{option ? people : 0}</dd>
        </div>
      </dl>

      {option && price && datesDone ? (
        <div className="mt-4 border-t border-line-strong pt-4 text-[0.9375rem]">
          <div className="flex justify-between gap-4">
            <span className="tnum">
              {isStay
                ? `${people} × ${nights} night${nights === 1 ? '' : 's'} × ${formatRand(option.rate)}`
                : `${people} × ${formatRand(option.rate)}`}
            </span>
            <span className="tnum text-xl font-extrabold text-ink">{formatRand(price.total)}</span>
          </div>
          <div className="-mx-2 mt-3 flex justify-between gap-4 rounded-[6px] bg-sun-100 px-2 py-1.5 font-semibold text-ink">
            <span>Deposit to secure it</span>
            <span className="tnum">{formatRand(price.deposit)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <span>Balance {isStay ? 'on arrival' : 'on the day'}</span>
            <span className="tnum">{formatRand(price.balance)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 border-t border-line-strong pt-4 text-[0.9375rem]">
          {option ? `${option.rateLabel}. Choose your dates to see the total.` : 'Choose an option to see the price.'}
        </p>
      )}
      <p className="t-caption mt-4">No payment is taken online. Every booking helps fund a child&rsquo;s first seaside holiday.</p>
    </aside>
  );

  return (
    <div ref={top} className="grid scroll-mt-28 items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="card p-5 sm:p-8">
        {/* steps */}
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2" aria-current={i === step ? 'step' : undefined}>
              <span className={`ring ${i < step ? 'ring-done' : ''} ${i > step ? '!border-line-strong !text-ink-muted' : ''}`}>
                {i < step ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="done">
                    <path d="m5 12.5 4.5 4.500L19 7.500" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={`text-sm font-semibold ${i === step ? 'text-ink' : 'text-ink-muted'} ${i === step ? '' : 'hidden sm:inline'}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="hidden h-px w-5 bg-line-strong sm:block" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        {notice && (
          <p className="alert alert-danger mt-5" role="alert">
            {notice}
          </p>
        )}

        {/* ---- 1: choose ---- */}
        {step === 0 && (
          <div className="mt-6">
            <h2 className="t-h3">What would you like to book?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {shown.map((o) => {
                const active = slug === o.slug;
                return (
                  <button
                    key={o.slug}
                    type="button"
                    onClick={() => chooseOption(o)}
                    aria-pressed={active}
                    className={`overflow-hidden rounded-[14px] text-left transition-colors ${
                      active ? 'bg-canopy-50 outline outline-2 outline-canopy-600' : 'border border-line bg-white hover:border-line-strong'
                    }`}
                  >
                    {o.image ? (
                      <img src={o.image.src} alt={o.image.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" style={{ backgroundColor: o.image.color }} />
                    ) : (
                      <span className="grid aspect-[4/3] w-full place-items-center bg-sunken text-sm font-semibold text-ink-muted">Photo coming soon</span>
                    )}
                    <span className="block p-4">
                      <span className="flex items-start justify-between gap-3">
                        <span className="t-h4">{o.name}</span>
                        {active && (
                          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 flex-none text-canopy-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="selected">
                            <path d="m5 12.5 4.5 4.500L19 7.500" />
                          </svg>
                        )}
                      </span>
                      <span className="mt-1 block text-[0.9375rem]">{o.blurb}</span>
                      <span className="mt-3 flex flex-wrap gap-2">
                        <span className="tag tag-price">{o.rateLabel}</span>
                        {o.capacityLabel && <span className="tag">{o.capacityLabel}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" disabled={!option} onClick={() => goTo(1)} className="btn btn-primary w-full sm:w-auto">
                Choose dates
              </button>
            </div>
          </div>
        )}

        {/* ---- 2: dates ---- */}
        {step === 1 && option && (
          <div className="mt-6">
            <h2 className="t-h3">{isStay ? 'When are you coming?' : 'Which day is your event?'}</h2>
            <p className="mt-1 text-[0.9375rem]">
              {option.name} &middot; {isStay ? 'choose your check-in date, then your check-out date' : 'choose one day'}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={() => setMonthOffset((m) => Math.max(0, m - 1))} disabled={monthOffset === 0} className="btn btn-tertiary btn-sm !px-3" aria-label="Earlier months">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
              </button>
              <span className="t-caption" aria-live="polite">
                {loadState === 'loading' ? 'Checking availability…' : loadState === 'error' ? 'Could not load availability' : ''}
              </span>
              <button type="button" onClick={() => setMonthOffset((m) => Math.min(12, m + 1))} className="btn btn-tertiary btn-sm !px-3" aria-label="Later months">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
              </button>
            </div>

            <div className="mt-4 grid gap-8 sm:grid-cols-2">
              <Month year={base.getUTCFullYear()} month={base.getUTCMonth()} today={today} start={start} end={end} taken={taken} isStay={isStay} onPick={pick} />
              <div className="hidden sm:block">
                <Month year={next.getUTCFullYear()} month={next.getUTCMonth()} today={today} start={start} end={end} taken={taken} isStay={isStay} onPick={pick} />
              </div>
            </div>

            <p className="t-caption mt-4 flex flex-wrap gap-x-5 gap-y-1">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-canopy-600" /> Your dates</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-line-strong bg-sunken" /> Unavailable</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-sun-500" /> Today</span>
            </p>

            {loadState === 'error' && (
              <p className="alert alert-warning mt-4">
                We could not load the calendar. You can still send your dates and we will confirm them, or call us{phone ? ` on ${phone}` : ''}.
              </p>
            )}
            {clash && <p className="alert alert-danger mt-4" role="alert">Some of those dates are no longer available. Please choose again.</p>}

            <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-t border-line pt-6">
              <div>
                <span className="label" id="people-label">
                  {isStay ? 'People' : 'Guests'} <span className="font-normal text-ink-muted">({option.minPeople} to {option.maxPeople})</span>
                </span>
                <div className="flex items-center gap-3" role="group" aria-labelledby="people-label">
                  <button type="button" onClick={() => setPeople((p) => Math.max(option.minPeople, p - 1))} disabled={people <= option.minPeople} className="btn btn-tertiary !h-11 !w-11 !p-0 text-xl" aria-label="Fewer people">−</button>
                  <span className="tnum w-9 text-center text-lg font-bold text-ink" aria-live="polite">{people}</span>
                  <button type="button" onClick={() => setPeople((p) => Math.min(option.maxPeople, p + 1))} disabled={people >= option.maxPeople} className="btn btn-tertiary !h-11 !w-11 !p-0 text-xl" aria-label="More people">+</button>
                </div>
              </div>
              <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                {shown.length > 1 && <button type="button" onClick={() => goTo(0)} className="btn btn-tertiary">Back</button>}
                <button type="button" disabled={!datesDone || clash} onClick={() => goTo(2)} className="btn btn-primary">
                  Continue{price && datesDone ? ` · ${formatRand(price.total)}` : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---- 3: details ---- */}
        {step === 2 && (
          <form
            className="mt-6"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (validateDetails()) goTo(3);
            }}
          >
            <h2 className="t-h3">Your details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bk-name">Full name</label>
                <input id="bk-name" className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} autoComplete="name" aria-invalid={!!fieldErrors.guestName} aria-describedby={fieldErrors.guestName ? 'bk-name-err' : undefined} />
                {fieldErrors.guestName && <p id="bk-name-err" className="field-error">{fieldErrors.guestName}</p>}
              </div>
              <div>
                <label className="label" htmlFor="bk-email">Email</label>
                <input id="bk-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'bk-email-err' : undefined} />
                {fieldErrors.email && <p id="bk-email-err" className="field-error">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="label" htmlFor="bk-phone">Phone</label>
                <input id="bk-phone" type="tel" className="input" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} autoComplete="tel" aria-invalid={!!fieldErrors.phone} aria-describedby={fieldErrors.phone ? 'bk-phone-err' : undefined} />
                {fieldErrors.phone && <p id="bk-phone-err" className="field-error">{fieldErrors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bk-notes">Anything we should know? <span className="font-normal text-ink-muted">(optional)</span></label>
                <textarea id="bk-notes" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
              </div>
              {/* hidden from people; bots fill it in */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="bk-website">Website</label>
                <input id="bk-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => goTo(1)} className="btn btn-tertiary">Back</button>
              <button type="submit" className="btn btn-primary">Review request</button>
            </div>
          </form>
        )}

        {/* ---- 4: review ---- */}
        {step === 3 && option && price && start && (
          <div className="mt-6">
            <h2 className="t-h3">Check your request</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line text-[0.9375rem]">
              {[
                ['Booking', option.name],
                [isStay ? 'Dates' : 'Date', isStay && end ? `${fmt(start)} to ${fmt(end)} (${nights} night${nights === 1 ? '' : 's'})` : fmt(start)],
                [isStay ? 'People' : 'Guests', String(people)],
                ['Name', guestName],
                ['Contact', `${email} · ${guestPhone}`],
                ...(notes ? [['Notes', notes]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="flex-none">{k}</dt>
                  <dd className="tnum text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {isStay && (checkIn || checkOut) && (
              <p className="t-caption mt-3">Check-in from {checkIn}, check-out by {checkOut}.</p>
            )}
            <p className="mt-5 text-[0.9375rem]">
              Sending this request holds your dates. Nothing is charged now: we confirm with you first, then you pay the
              deposit of <strong className="tnum text-ink">{formatRand(price.deposit)}</strong> by EFT.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => goTo(2)} className="btn btn-tertiary" disabled={sending}>Back</button>
              <button type="button" onClick={submit} className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending…' : 'Send booking request'}
              </button>
            </div>
            <p className="t-caption mt-4 sm:text-right">Registered non-profit company · No online payment · Balance payable {isStay ? 'on arrival' : 'on the day'}</p>
          </div>
        )}
      </div>

      {summary}
    </div>
  );
}
