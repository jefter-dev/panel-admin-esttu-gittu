import { Sidebar } from "@/components/layout/sidebar";
import { ContentWrapper } from "@/components/layout/content-wrapper";
import { Header } from "@/components/layout/header";
import { MainContent } from "@/components/layout/main-content";
import { PainelRoot } from "@/components/layout/painel-root";
import { SessionProvider } from "@/context/session-context";
import { AppThemeProvider } from "@/context/providers/app-theme-provider";

export default function PrivateLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppThemeProvider>
        <PainelRoot>
          <Sidebar />
          <ContentWrapper>
            <Header />
            <MainContent>{children}</MainContent>
          </ContentWrapper>
        </PainelRoot>
      </AppThemeProvider>
    </SessionProvider>
  );
}
