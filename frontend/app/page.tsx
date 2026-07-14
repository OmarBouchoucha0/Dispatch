"use client"

import { useState } from "react"
import { Login } from "@/components/auth/login"
import { Signup } from "@/components/auth/signup"
import { AuthRedirect } from "@/components/auth/auth-redirect"

export default function Home() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <div className="relative flex items-center justify-center h-screen bg-background overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <AuthRedirect />
      {showLogin ? (
        <Login onSwitch={() => setShowLogin(false)} />
      ) : (
        <Signup onSwitch={() => setShowLogin(true)} />
      )}
    </div >
  )
}
