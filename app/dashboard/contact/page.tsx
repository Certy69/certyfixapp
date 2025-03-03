import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" placeholder="Your Name" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="your@email.com" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message here..." />
            </div>
            <Button type="submit">Send Message</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Other ways to reach us</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Email: support@certyfix.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </CardContent>
      </Card>
    </div>
  )
}

