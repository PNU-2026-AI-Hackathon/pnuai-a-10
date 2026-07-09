export type NaverNewsResult = {
  title: string;
  url: string;
  summary: string;
  publishedAt?: string;
};

type NaverNewsApiItem = {
  title: string;
  originallink?: string;
  link: string;
  description: string;
  pubDate?: string;
};

type NaverNewsApiResponse = {
  items?: NaverNewsApiItem[];
};

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export async function searchNaverNews(query: string): Promise<NaverNewsResult[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.");
  }

  const searchParams = new URLSearchParams({
    query,
    display: "5",
    start: "1",
    sort: "date",
  });

  const response = await fetch(
    `https://openapi.naver.com/v1/search/news.json?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`네이버 뉴스 검색 실패: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as NaverNewsApiResponse;

  return (data.items ?? []).map((item) => ({
    title: stripHtml(item.title),
    url: item.originallink || item.link,
    summary: stripHtml(item.description),
    publishedAt: item.pubDate,
  }));
}