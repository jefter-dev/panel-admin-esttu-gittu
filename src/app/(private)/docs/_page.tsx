import ReactSwagger from "@/components/docs/react-swagger";
import { getApiDocs } from "@/lib/swagger"; // Importa do arquivo de configuração

export default async function IndexPage() {
  const spec = await getApiDocs();

  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}
