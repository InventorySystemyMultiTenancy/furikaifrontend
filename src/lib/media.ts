import { existsSync } from "fs";
import path from "path";

/**
 * Configuração central de mídia da Furikai.
 *
 * Todos os caminhos são relativos a /public. Quando um novo asset
 * (modelo 3D, vídeo, imagem) for adicionado ao projeto, basta colocá-lo
 * na pasta correspondente abaixo — nenhum componente precisa mudar.
 *
 * Se um arquivo referenciado aqui não existir em /public, os componentes
 * que o consomem (Hero3D, ScrollVideo, etc.) caem automaticamente em um
 * fallback elegante em vez de quebrar a página. Veja `resolveMedia()`.
 */
export const homeMedia = {
  // Hero — produto em destaque na tela inicial. Sem modelo 3D (.glb) ainda,
  // então o hero usa vídeo em loop como visual principal (ver hero-fallback.tsx).
  // TODO: trocar por um vídeo dedicado do produto quando houver um; por ora
  // reaproveita o vídeo de introdução pra não deixar o hero sem vídeo nenhum.
  heroModel: "/assets/models/furikai-shirt.glb",
  heroFallbackImage: "/assets/images/furikai-shirt-fallback.png",
  heroFallbackVideo: "/assets/videos/scroll-intro-desktop.mp4",

  // Primeiro vídeo com scroll scrubbing (seção cinematográfica / manifesto)
  firstScrollVideoDesktop: "/assets/videos/scroll-intro-desktop.mp4",
  firstScrollVideoMobile: "/assets/videos/scroll-intro-mobile.mp4",

  // Banner editorial entre as vitrines
  editorialBannerVideo: "/assets/videos/editorial-banner.mp4",
  editorialBannerImage: "/assets/images/editorial-banner.jpg",

  // Segundo vídeo com scroll scrubbing (comunidade / encontros)
  secondScrollVideoDesktop: "/assets/videos/scroll-community.mp4",
  secondScrollVideoMobile: "/assets/videos/scroll-community-mobile.mp4",

  logo: "/assets/logos/furikai-logo.svg",
  logoMark: "/assets/logos/furikai-mark.svg",
} as const;

export type HomeMediaKey = keyof typeof homeMedia;

/**
 * Verifica no servidor se o arquivo público existe.
 * Use em Server Components para decidir se um fallback deve ser
 * renderizado antes mesmo do client montar (evita "flash" de erro).
 */
export function mediaExists(publicPath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), "public", publicPath);
    return existsSync(fullPath);
  } catch {
    return false;
  }
}

export function resolveHomeMedia() {
  const keys = Object.keys(homeMedia) as HomeMediaKey[];
  const result = {} as Record<HomeMediaKey, { src: string; available: boolean }>;
  for (const key of keys) {
    const src = homeMedia[key];
    result[key] = { src, available: mediaExists(src) };
  }
  return result;
}
