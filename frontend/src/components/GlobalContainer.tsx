import { Container } from "@mui/material";
import { VerticalSpacer } from "../components/VerticalSpacer";
import { GlobalHeader } from "../components/GlobalHeader";
import { GlobalFooter } from "../components/GlobalFooter";

export function GlobalContainer({
  children,
  pageTitle,
}: {
  children?: React.ReactNode;
  pageTitle?: string;
}){
  return (
    <Container
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <header>
        <GlobalHeader title={`タレントマネジメントシステム${pageTitle ? "　" + pageTitle : ""}`} />
      </header>

      <VerticalSpacer height={32} />

      <main>{children}</main>

      <footer>
        <GlobalFooter />
      </footer>
    </Container>
  );
}
