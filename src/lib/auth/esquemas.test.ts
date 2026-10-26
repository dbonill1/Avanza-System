import { describe, expect, it } from "vitest";

import { esquemaLogin } from "./esquemas";

describe("esquemaLogin", () => {
  it("normaliza el correo: sin espacios y en minúsculas", () => {
    const r = esquemaLogin.parse({ correo: "  Cajero1@Avanza.TEST ", clave: "x" });
    expect(r.correo).toBe("cajero1@avanza.test");
  });

  it("no toca la contraseña (los espacios cuentan)", () => {
    const r = esquemaLogin.parse({ correo: "a@b.test", clave: " clave con espacios " });
    expect(r.clave).toBe(" clave con espacios ");
  });

  it("rechaza un correo inválido con mensaje en español", () => {
    const r = esquemaLogin.safeParse({ correo: "no-es-correo", clave: "x" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Escribe un correo válido.");
  });

  it("rechaza contraseña vacía", () => {
    const r = esquemaLogin.safeParse({ correo: "a@b.test", clave: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Escribe tu contraseña.");
  });

  it("rechaza campos que no son texto (FormData vacío)", () => {
    expect(esquemaLogin.safeParse({ correo: null, clave: null }).success).toBe(false);
  });
});
