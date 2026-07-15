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


type LoginProps = {
  onSwitch: () => void
}

export function Login({ onSwitch }: LoginProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    try {
      const res = await fetch(
        `${API_URL}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      if (!res.ok) {
        toast.error("invalid email or password")
        return
      }

      router.push("/files")

    } catch {
      toast.error("server error")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Card className="w-full max-w-sm relative z-10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" onClick={onSwitch}>
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>

      <form onSubmit={handleLogin} className="flex flex-col gap-8">
        <CardContent>
          <div className="flex flex-col gap-6">
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

        <CardFooter className="flex-col gap-2">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button variant="outline" className="w-full"> Login with Google </Button>
        </CardFooter>
      </form>

    </Card>
  )
}
