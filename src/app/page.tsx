import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Create and Share{" "}
            <span className="text-primary">Polls</span>{" "}
            Instantly
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gather opinions, make decisions, and engage your community with
            beautiful, interactive polls. Simple, fast, and powerful.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/polls/create">
              Create Your First Poll
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/polls">
              Browse Polls
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose PollApp?</h2>
          <p className="text-muted-foreground">
            Everything you need to create engaging polls and gather valuable insights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Lightning Fast</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and share polls in seconds. No complex setup required.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Real-time Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See results update in real-time as people vote on your polls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Community Driven</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover trending polls and engage with the community.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is secure. Create private polls or share publicly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Join thousands of users creating engaging polls every day
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/register">
              Sign Up Free
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/polls">
              Explore Polls
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
