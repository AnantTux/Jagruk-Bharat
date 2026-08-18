import { AuthNav } from "@/components/auth-nav";
import { SiteBrand } from "@/components/site-brand";

export function AppHeader({ subtitle, trailing, showDashboard = true }) {
    return (
        <header className="sticky top-0 z-50 h-[72px] border-b border-[#0e539d] bg-primary text-white">
            <div className="mx-auto flex h-full max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
                <SiteBrand light subtitle={subtitle} />
                <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
                    <AuthNav light showDashboard={showDashboard} />
                </nav>
                {trailing ? <div className="ml-auto shrink-0 lg:ml-3">{trailing}</div> : null}
            </div>
        </header>
    );
}
