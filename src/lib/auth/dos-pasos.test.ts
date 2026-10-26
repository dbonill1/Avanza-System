import { describe, expect, it } from "vitest";

import { decidirDosPasos, esquemaCodigo, rutaPendiente } from "./dos-pasos";

describe("decidirDosPasos", () => {
  it("no exige 2FA a ningún rol que no sea admin, aunque tenga factor", () => {
    for (const rol of ["vendedor", "cajero", "bodega", "gerente"] as const) {
      expect(decidirDosPasos(rol, "aal1", false)).toBe("no-requerido");
      expect(decidirDosPasos(rol, "aal1", true)).toBe("no-requerido");
    }
  });

  it("admin sin factor tiene que configurarlo", () => {
    expect(decidirDosPasos("admin", "aal1", false)).toBe("configurar");
  });

  it("admin con factor y solo contraseña tiene que poner el código", () => {
    expect(decidirDosPasos("admin", "aal1", true)).toBe("verificar");
  });

  it("admin que ya puso el código entra", () => {
    expect(decidirDosPasos("admin", "aal2", true)).toBe("listo");
  });

  it("sin nivel en la sesión se trata como solo contraseña", () => {
    expect(decidirDosPasos("admin", undefined, true)).toBe("verificar");
  });
});

describe("rutaPendiente", () => {
  it("manda a configurar o verificar, y a nada en los demás casos", () => {
    expect(rutaPendiente("configurar")).toBe("/configurar-2fa");
    expect(rutaPendiente("verificar")).toBe("/verificar-2fa");
    expect(rutaPendiente("listo")).toBeNull();
    expect(rutaPendiente("no-requerido")).toBeNull();
  });
});

describe("esquemaCodigo", () => {
  it("acepta 6 dígitos, con o sin espacios", () => {
    expect(esquemaCodigo.parse("123456")).toBe("123456");
    expect(esquemaCodigo.parse(" 123 456 ")).toBe("123456");
  });

  it("rechaza letras, menos o más de 6 dígitos, y vacío", () => {
    for (const malo of ["12345", "1234567", "12a456", "", null]) {
      expect(esquemaCodigo.safeParse(malo).success).toBe(false);
    }
  });
});
