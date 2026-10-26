import Image from "next/image";

import simbolo from "../../public/marca/avanza-simbolo.png";
import texto from "../../public/marca/avanza-texto-blanco.png";

// Logo de Avanza: el símbolo rojo y el texto AVANZA en blanco.
export function Marca({ tamano = 36 }: { tamano?: number }) {
  const altoTexto = Math.round(tamano * 0.47);
  return (
    <div className="flex items-center gap-3">
      <Image src={simbolo} alt="" width={tamano} height={tamano} priority />
      <Image
        src={texto}
        alt="Avanza"
        width={Math.round((altoTexto * texto.width) / texto.height)}
        height={altoTexto}
        priority
      />
    </div>
  );
}
