import { describe, expect, it } from "vitest";

import { parsearEnvPublico, parsearEnvServidor } from "./esquemas";

const publicoValido = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc123",
};

describe("parsearEnvPublico", () => {
  it("acepta una URL y una publishable key", () => {
    expect(parsearEnvPublico(publicoValido)).toEqual(publicoValido);
  });

  it("rechaza si falta la URL", () => {
    expect(() =>
      parsearEnvPublico({ ...publicoValido, NEXT_PUBLIC_SUPABASE_URL: undefined }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("rechaza una URL mal formada", () => {
    expect(() =>
      parsearEnvPublico({ ...publicoValido, NEXT_PUBLIC_SUPABASE_URL: "no-es-url" }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("rechaza una secret key puesta como variable pública", () => {
    expect(() =>
      parsearEnvPublico({
        ...publicoValido,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_no_deberia_estar_aqui",
      }),
    ).toThrow(/secret key/);
  });

  it("no incluye el valor de la key en el mensaje de error", () => {
    const secreto = "sb_secret_valor_que_no_debe_filtrarse";
    expect(() =>
      parsearEnvPublico({
        ...publicoValido,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: secreto,
      }),
    ).toThrow(expect.objectContaining({ message: expect.not.stringContaining(secreto) }));
  });
});

describe("parsearEnvServidor", () => {
  it("acepta la secret key", () => {
    expect(parsearEnvServidor({ SUPABASE_SECRET_KEY: "sb_secret_xyz" })).toEqual({
      SUPABASE_SECRET_KEY: "sb_secret_xyz",
    });
  });

  it("rechaza si falta o está vacía", () => {
    expect(() => parsearEnvServidor({})).toThrow(/SUPABASE_SECRET_KEY/);
    expect(() => parsearEnvServidor({ SUPABASE_SECRET_KEY: "" })).toThrow(
      /SUPABASE_SECRET_KEY/,
    );
  });
});
