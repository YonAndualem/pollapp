import { Header } from "./header";

interface LayoutProps {
    children: React.ReactNode;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export function Layout({ children, user }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Header user={user} />
            <main className="container mx-auto py-6">
                {children}
            </main>
        </div>
    );
}
