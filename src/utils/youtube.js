/**
 * Extrae el video ID de cualquier URL de YouTube:
 *  - youtube.com/watch?v=ID
 *  - youtu.be/ID
 *  - youtube.com/embed/ID
 *  - youtube.com/shorts/ID   ← Shorts
 */
export function getYoutubeId(url) {
    if (!url) return null;
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

export function getYoutubeThumbnail(url) {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Devuelve la URL de embed correcta para usar en un <iframe>.
 * Los Shorts se redirigen a /embed/ igual que los videos normales.
 */
export function getYoutubeEmbedUrl(url) {
    const id = getYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
}