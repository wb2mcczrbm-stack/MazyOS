"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Revela o conteúdo quando ele entra na viewport (fade + sobe um pouco).
 *
 * É um "teste de animação" — discreto de propósito, coerente com a direção
 * (movimento quase nenhum). Dispara UMA vez por bloco e não repete no scroll pra
 * cima. Quem tem "menos movimento" ligado no aparelho vê tudo já revelado, sem
 * animação (o CSS cuida disso). Conteúdo fica sempre no DOM — some só visualmente
 * até revelar, então busca/leitor de tela continuam enxergando.
 *
 * `delay` (ms) permite escalonar itens de uma mesma faixa (efeito cascata).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeita a preferência do sistema: sem observer, revela na hora.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisivel(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisivel(true);
            io.disconnect(); // uma vez só
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visivel ? "reveal-on" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
