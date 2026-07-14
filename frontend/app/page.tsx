"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
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

      {showLogin ? (
        <Card className="w-full max-w-sm relative z-10">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button
                variant="link"
                onClick={() => setShowLogin(false)}
              >
                Sign Up
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" required />
                </div>

                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input type="password" required />
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full"> Login </Button>
            <Button variant="outline" className="w-full"> Login with Google </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-sm relative z-10">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Enter your credentials to create an account
            </CardDescription>
            <CardAction>
              <Button
                variant="link"
                onClick={() => setShowLogin(true)}
              >
                Login
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input type="text" required />
                </div>

                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input type="text" required />
                </div>

                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" required />
                </div>

                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input type="password" required />
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <Button className="w-full">
              Create account
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
