/**
 * 날짜를 한국 형식으로 포맷팅합니다.
 * @param timestamp - 밀리초 타임스탬프
 * @returns 한국 형식 날짜 문자열 (예: "2026년 1월 4일")
 */
export function formatDateKorean(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 날짜를 간단한 한국 형식으로 포맷팅합니다.
 * @param timestamp - 밀리초 타임스탬프
 * @returns 간단한 한국 형식 날짜 문자열 (예: "2026.01.04")
 */
export function formatDateKoreanShort(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
