import { SearchEmployees } from "../components/SearchEmployees";
import { GlobalContainer } from "@/components/GlobalContainer";
import { DynamicTitle } from "@/components/DynamicTitle";

export default function Home() {
  return (
    <GlobalContainer>
      <DynamicTitle />
      <SearchEmployees />
    </GlobalContainer>
  );
}
