"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { leadsApi, projectsApi } from "@/lib/api";

const GOLD = "#D4881E";
const CREAM = "#F7F5F2";
const INK = "#101010";

// Base du SITE public (pas l'API). En prod : https://signatureimmersion.ca
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Repli si getFeatured() échoue ou ne renvoie rien → le QR n'est jamais vide.
const FALLBACK_SLUG = "mercedes-voiture-1";

const qrSrc = (slug: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(
    `${SITE_URL}/embed/${slug}`
  )}`;

const PHONE_SCREEN = "/assets/univers/auto.jpg";

export default function ContactFinal() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [featuredSlug, setFeaturedSlug] = useState(FALLBACK_SLUG);

  // QR dynamique : on suit le projet vedette. Repli sur FALLBACK_SLUG si échec.
  useEffect(() => {
    projectsApi
      .getFeatured()
      .then((projects) => {
        if (projects && projects.length > 0 && projects[0].slug) {
          setFeaturedSlug(projects[0].slug);
        }
      })
      .catch(() => {
        /* on garde FALLBACK_SLUG */
      });
  }, []);

  const fade = (delay = 0) =>
    reduce
      ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: {
            duration: 0.9,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
          viewport: { once: true, margin: "-80px" },
        };

  return (
    <section
      id="final"
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{
        background: `radial-gradient(120% 90% at 50% 0%, #FFFFFF 0%, ${CREAM} 58%, #F1EEE8 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(55% 40% at 54% 42%, rgba(212,136,30,0.13) 0%, transparent 68%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-[1220px] px-8 py-24 lg:px-10 lg:py-28">
        <div className="final-grid grid items-center gap-14">
          <motion.div {...fade(0)} className="final-text max-w-[430px]">
            <p
              className="mb-7 text-sm font-medium uppercase tracking-[0.35em]"
              style={{ color: GOLD }}
            >
              {t("L'expérience Signature", "The Signature Experience")}
            </p>

            <h2
              className="text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.6rem]"
              style={{
                fontFamily: "var(--font-cormorant), serif",
                color: INK,
                fontWeight: 500,
              }}
            >
              {t("Prête à être", "Ready to be")}
              <br />
              {t("partagée", "shared")}
              <span style={{ color: GOLD }}>.</span>
            </h2>

            <div className="mt-7 h-px w-16" style={{ background: GOLD }} />

            <div className="mt-7 space-y-4">
              <p className="text-lg leading-relaxed" style={{ color: "#3A3A3A" }}>
                {t(
                  "Nous créons des expériences immersives enrichies par ",
                  "We craft immersive experiences enhanced by "
                )}
                <span style={{ color: GOLD }}>Luxedia&nbsp;IA</span>.
              </p>

              <p className="text-lg leading-relaxed" style={{ color: "#3A3A3A" }}>
                {t(
                  "Vos visiteurs explorent, posent leurs questions et obtiennent des réponses en temps réel.",
                  "Your visitors explore, ask their questions, and get answers in real time."
                )}
              </p>
            </div>

            <div className="mt-11 grid grid-cols-3 gap-5">
              <Pilier
                icon="link"
                title={t("Un lien unique", "A unique link")}
                desc={t("Facile à partager, partout.", "Easy to share, anywhere.")}
              />
              <Pilier
                icon="qr"
                title={t("Un QR code", "A QR code")}
                desc={t("Scannez et vivez l'expérience.", "Scan and live the experience.")}
              />
              <Pilier
                icon="chat"
                title="Luxedia IA"
                desc={t("Votre assistant intelligent intégré.", "Your built-in intelligent assistant.")}
              />
            </div>
          </motion.div>

          <motion.div {...fade(0.14)} className="final-phone flex justify-center">
            <PhoneMockup screen={PHONE_SCREEN} t={t} />
          </motion.div>

          <motion.div {...fade(0.24)} className="final-qr flex justify-center">
            <QrCard t={t} slug={featuredSlug} />
          </motion.div>
        </div>

        <motion.div {...fade(0.36)} className="mt-16 flex flex-col items-center">
          <button
            onClick={() => setOpen(true)}
            className="group inline-flex items-center gap-4 rounded-full px-12 py-5 text-base font-medium transition-all duration-300 hover:-translate-y-1"
            style={{
              background: GOLD,
              color: "#FFFFFF",
              boxShadow: "0 22px 52px -18px rgba(212,136,30,0.55)",
            }}
          >
            <span
              className="text-2xl transition-transform duration-300 group-hover:translate-x-1"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {t("Parlons de votre projet", "Let's talk about your project")}
            </span>
            <span className="text-xl">→</span>
          </button>

          <p
            className="mt-7 text-2xl italic"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              color: GOLD,
            }}
          >
            {t("Simple. Immersif. Efficace.", "Simple. Immersive. Effective.")}
          </p>
        </motion.div>
      </div>

      <ContactModal open={open} onClose={() => setOpen(false)} reduce={!!reduce} t={t} />

      <style>{`
        .final-grid {
          grid-template-columns: minmax(0, 400px) auto auto;
          column-gap: 72px;
          justify-content: center;
          max-width: 1040px;
          margin-inline: auto;
        }

        @media (max-width: 1100px) {
          .final-grid {
            grid-template-columns: 1fr;
            max-width: 520px;
            text-align: center;
          }

          .final-text {
            margin: 0 auto;
          }
        }

        @media (max-width: 640px) {
          #final {
            min-height: auto;
          }

          .final-text h2 {
            font-size: 3.3rem !important;
          }
        }
      `}</style>
    </section>
  );
}

function Pilier({
  icon,
  title,
  desc,
}: {
  icon: "link" | "qr" | "chat";
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 10px 26px -14px rgba(0,0,0,0.22)",
        }}
      >
        <PilierIcon name={icon} />
      </div>
      <p className="text-sm font-semibold" style={{ color: INK }}>
        {title}
      </p>
      <p className="mt-1 text-xs leading-snug" style={{ color: "#6B6B6B" }}>
        {desc}
      </p>
    </div>
  );
}

function PilierIcon({ name }: { name: "link" | "qr" | "chat" }) {
  const s = { stroke: GOLD, strokeWidth: 1.6, fill: "none" as const };

  if (name === "link") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...s} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
      </svg>
    );
  }

  if (name === "qr") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...s} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M20 14v.01M14 20h.01M17 17v4M20 20v.01" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  );
}

function PhoneMockup({
  screen,
  t,
}: {
  screen: string;
  t: (fr: string, en: string) => string;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{
          background: `radial-gradient(45% 45% at 50% 50%, rgba(212,136,30,0.38) 0%, transparent 72%)`,
          transform: "scale(1.35)",
        }}
      />

      <div
        className="relative w-[272px] rounded-[3rem] p-[3px]"
        style={{
          background: `linear-gradient(160deg, ${GOLD} 0%, #7a4f12 40%, #2a1c08 100%)`,
          boxShadow: "0 46px 100px -34px rgba(0,0,0,0.55)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[2.8rem]"
          style={{ background: "#0B0B0B", aspectRatio: "9 / 19.5" }}
        >
          <img
            src={screen}
            alt={t("Aperçu de l'expérience immersive", "Preview of the immersive experience")}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(0.9)" }}
          />

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,11,11,0.62) 0%, transparent 30%, transparent 60%, rgba(11,11,11,0.9) 100%)",
            }}
          />

          <div
            aria-hidden
            className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full"
            style={{ background: "#0B0B0B" }}
          />

          <div className="absolute left-0 right-0 top-4 z-10 flex items-center justify-between px-6 text-[10px] font-medium text-white">
            <span>9:41</span>
            <span className="tracking-tight">●●● ▮</span>
          </div>

          <div className="absolute left-0 right-0 top-[3.8rem] z-10 flex items-center justify-between px-6">
            <span
              className="text-[13px] tracking-wide text-white"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              <span style={{ color: GOLD }}>S</span> SIGNATURE
            </span>
            <span className="text-white/80">≡</span>
          </div>

          <div className="absolute bottom-10 left-5 right-5">
            <div
              className="flex items-center justify-between rounded-full px-4 py-2.5"
              style={{
                background: "rgba(20,20,20,0.86)",
                border: "1px solid rgba(212,136,30,0.38)",
              }}
            >
              <span className="text-[11px] text-white/55">
                {t("Posez votre question…", "Ask your question…")}
              </span>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                style={{ background: GOLD, color: "#fff" }}
              >
                ➤
              </span>
            </div>
            <p className="mt-2 text-center text-[9px] tracking-wide text-white/40">
              {t("Propulsé par Luxedia IA", "Powered by Luxedia AI")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrCard({
  t,
  slug,
}: {
  t: (fr: string, en: string) => string;
  slug: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-[2rem] px-8 py-9"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 34px 80px -28px rgba(0,0,0,0.22)",
      }}
    >
      <div className="mb-3 text-xl" style={{ color: GOLD }}>
        ✦
      </div>

      <div className="relative">
        <img
          src={qrSrc(slug)}
          alt={t("QR code vers l'expérience", "QR code to the experience")}
          className="h-44 w-44"
        />
        <div
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{ background: "#FFFFFF", border: `1.5px solid ${GOLD}` }}
        >
          <span
            className="text-lg"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              color: GOLD,
            }}
          >
            S
          </span>
        </div>
      </div>

      <p className="mt-5 text-base font-semibold" style={{ color: INK }}>
        {t("Scannez pour découvrir", "Scan to discover")}
      </p>
      <p className="text-sm" style={{ color: "#6B6B6B" }}>
        {t("l'expérience en temps réel", "the experience in real time")}
      </p>
      <div className="mt-5 h-px w-12" style={{ background: GOLD }} />
    </div>
  );
}

function ContactModal({
  open,
  onClose,
  reduce,
  t,
}: {
  open: boolean;
  onClose: () => void;
  reduce: boolean;
  t: (fr: string, en: string) => string;
}) {
  const [form, setForm] = useState({ nom: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const tmo = setTimeout(() => firstRef.current?.focus(), 80);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(tmo);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const tmo = setTimeout(() => {
        setSent(false);
        setError(null);
        setLoading(false);
        setForm({ nom: "", contact: "", message: "" });
      }, 300);

      return () => clearTimeout(tmo);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (loading) return;
    if (!form.nom.trim() || !form.contact.trim()) {
      setError(t("Merci de renseigner votre nom et un moyen de contact.", "Please provide your name and a way to reach you."));
      return;
    }

    setError(null);
    setLoading(true);

    const contact = form.contact.trim();
    const isEmail = contact.includes("@");

    try {
      await leadsApi.create({
        name: form.nom.trim(),
        email: isEmail ? contact : undefined,
        phone: isEmail ? undefined : contact,
        message: form.message.trim() || undefined,
        buttonLabel: "Parlons de votre projet",
      });
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const dur = reduce ? 0 : 0.35;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t("Formulaire de contact", "Contact form")}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(11,11,11,0.55)",
              backdropFilter: "blur(4px)",
            }}
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl p-8 sm:p-10"
            style={{ background: CREAM }}
            initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label={t("Fermer", "Close")}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-black/5"
              style={{ color: "#6B6B6B" }}
            >
              ✕
            </button>

            {!sent ? (
              <>
                <h3
                  className="text-3xl leading-tight"
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    color: INK,
                    fontWeight: 500,
                  }}
                >
                  {t("Parlez-nous de votre espace.", "Tell us about your space.")}
                </h3>

                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#5A5A5A" }}>
                  {t(
                    "Nous vous répondrons avec une proposition adaptée.",
                    "We'll get back to you with a tailored proposal."
                  )}
                </p>

                <div className="mt-7 space-y-4">
                  <Field
                    ref={firstRef}
                    label={t("Nom", "Name")}
                    value={form.nom}
                    onChange={(v) => setForm({ ...form, nom: v })}
                    placeholder={t("Votre nom", "Your name")}
                  />

                  <Field
                    label={t("Courriel ou téléphone", "Email or phone")}
                    value={form.contact}
                    onChange={(v) => setForm({ ...form, contact: v })}
                    placeholder={t("Pour vous recontacter", "So we can reach you")}
                  />

                  <Field
                    label={t("Message", "Message")}
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                    placeholder={t("En quelques mots…", "In a few words…")}
                    textarea
                  />
                </div>

                {error && (
                  <p className="mt-4 text-sm" style={{ color: "#B4232A" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-7 w-full rounded-full py-3.5 text-base font-medium transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: GOLD,
                    color: "#FFFFFF",
                    boxShadow: "0 16px 36px -14px rgba(212,136,30,0.55)",
                  }}
                >
                  {loading
                    ? t("Envoi…", "Sending…")
                    : t("Demander une démonstration", "Request a demonstration")}
                </button>
              </>
            ) : (
              <div className="py-6 text-center">
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(212,136,30,0.12)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke={GOLD}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3
                  className="text-3xl"
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    color: INK,
                    fontWeight: 500,
                  }}
                >
                  {t("Message reçu.", "Message received.")}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "#5A5A5A" }}>
                  {t(
                    "Merci. Nous revenons vers vous très vite avec une proposition adaptée.",
                    "Thank you. We'll be in touch shortly with a tailored proposal."
                  )}
                </p>
                <button
                  onClick={onClose}
                  className="mt-7 text-sm font-medium underline-offset-4 hover:underline"
                  style={{ color: GOLD }}
                >
                  {t("Fermer", "Close")}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Field = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    textarea?: boolean;
  }
>(function Field({ label, value, onChange, placeholder, textarea }, ref) {
  const base =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[#D4881E]";

  return (
    <label className="block">
      <span
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
        style={{ color: "#6B6B6B" }}
      >
        {label}
      </span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={base}
          style={{
            borderColor: "rgba(0,0,0,0.12)",
            color: INK,
            resize: "none",
          }}
        />
      ) : (
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
          style={{
            borderColor: "rgba(0,0,0,0.12)",
            color: INK,
          }}
        />
      )}
    </label>
  );
});
