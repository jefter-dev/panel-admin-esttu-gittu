"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} Esttu | Gittu — Desenvolvido por
          </span>
          <Link
            href="https://jefterdev.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              whileHover={{
                scale: 1.1,
                rotate: 2,
                filter: "drop-shadow(0px 0px 6px rgba(59,130,246,0.6))",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="inline-block"
            >
              <Image
                src="/logo-jefterdev.svg"
                alt="JefterDev Logo"
                width={150}
                height={36}
                priority
              />
            </motion.div>
          </Link>
        </div>

        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/users" className="hover:text-primary transition-colors">
            Usuários
          </Link>
          <Link
            href="/settings"
            className="hover:text-primary transition-colors"
          >
            Configurações
          </Link>
        </nav>
      </div>
    </footer>
  );
}
