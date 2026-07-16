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
import { Spinner } from "@/components/ui/spinner"
import { useState } from "react"
import { API_URL } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

type SignupProps = {
  onSwitch: () => void
}

export function Signup({ onSwitch }: SignupProps) {
  const router = useRouter()
  const { refresh } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    try {
      const res = await fetch(
        `${API_URL}/user/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
          }),
        }
      )

      if (!res.ok) {
        toast.error("email already in use")
        return
      }
      await refresh()
      router.push("/files")
    } catch {
      toast.error("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm relative z-10">
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>
          Enter your credentials to create an account
        </CardDescription>
        <CardAction>
          <Button variant="link" onClick={onSwitch} >
            Login
          </Button>
        </CardAction>
      </CardHeader >

      <form onSubmit={handleSignup} className="flex flex-col gap-8">
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label>First Name</Label>
              <Input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label>Last Name</Label>
              <Input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </CardFooter>
      </form>

    </Card >
  )
}
